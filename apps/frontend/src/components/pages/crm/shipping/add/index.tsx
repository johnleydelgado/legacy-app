"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { RootState } from "../../../../../store";
import moment from "moment";
import { toast } from "sonner";

import ShippingDetailsHeaders from "../sections/headers";
import {
  ContactsTypes,
  Customer as CustomerShippingOrdersTypes,
} from "../../../../../services/shipping-orders/types";
import { TableOrdersItems } from "../types";
import ShippingItemsTable, {
  ShippingItem,
} from "../sections/shipping-items-table";
import PackageSpecifications, {
  PackageSpec,
} from "../sections/package-specifications";
import Customers from "../sections/customers";
import { useCustomer } from "../../../../../hooks/useCustomers2";
import { useCreateShippingOrder } from "../../../../../hooks/useShippingOrders";
import { useCreateShippingOrderItem } from "../../../../../hooks/useShippingOrderItems";
import { useCreateShippingPackageSpecification } from "../../../../../hooks/useShippingPackageSpecifications";
import { useCreateShippingPackageSpecItem } from "../../../../../hooks/useShippingPackageSpecItems";
import { useDeleteShippingOrder } from "../../../../../hooks/useShippingOrders";
import { useDeleteShippingOrderItem } from "../../../../../hooks/useShippingOrderItems";
import { useDeleteShippingPackageSpecification } from "../../../../../hooks/useShippingPackageSpecifications";
import { useDeleteShippingPackageSpecItem } from "../../../../../hooks/useShippingPackageSpecItems";
import { useCreateActivityHistory } from "../../../../../hooks/useActivityHistory";
import {
  executeShippingOrderPipeline,
  ShippingPipelineData,
  PipelineHooks,
} from "../../../../../services/shipping-order-pipeline";
import { useCreateImageGallery } from "../../../../../hooks/useImageGallery";
import { imageGalleryService } from "../../../../../services/image-gallery";
import {
  CreateImageGalleryParams,
  FKItemType,
  Type,
} from "../../../../../services/image-gallery/types";
import { uploadSingleImage } from "../../quotes-details/helpers-functions/image-helpers";
import CompanyInfo from "../sections/company-info";
import { InfoBox } from "@/components/custom/info-box";
import { ExtendedFile } from "../../orders/sections/image-upload-dropzone";
// Add imports for order data
import { useOrder } from "../../../../../hooks/useOrders";
import { useOrderItemsByOrderId } from "../../../../../hooks/useOrdersItems";
import { useImageGalleryByItemEndpoint } from "../../../../../hooks/useImageGallery";
import ShippingItemsSkeleton from "../sections/shipping-items-skeleton";
import PackageSpecificationsSkeleton from "../sections/package-specifications-skeleton";

const ShippingAdd = () => {
  const router = useRouter();
  const taxRate = 0.08;

  const customerID = useSelector(
    (state: RootState) => state.customers.customerID
  );
  const ordersID = useSelector((state: RootState) => state.orders.ordersID);
  const ordersNumber = useSelector(
    (state: RootState) => state.orders.ordersNumber
  );
  const { fullname } = useSelector((state: RootState) => state.users);

  const [modifyFlag, setModifyFlag] = React.useState(false);
  const [isCreateFlag, setIsCreateFlag] = React.useState(false);
  const [shippingStatus, setShippingStatus] = React.useState<number>(24);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [customerData, setCustomerData] =
    React.useState<CustomerShippingOrdersTypes | null>(null);
  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(-1);

  const [shippingItems, setShippingItems] = React.useState<ShippingItem[]>([]);
  const [packages, setPackages] = React.useState<PackageSpec[]>([]);

  // Image fetching state
  const [currentImageFetchIndex, setCurrentImageFetchIndex] =
    React.useState<number>(0);
  const [fkOrdersItemID, setFKOrdersItemID] = React.useState<number>(-1);

  // Ref to track current items length to avoid stale closures
  const itemsLengthRef = React.useRef<number>(0);

  // Update the ref whenever shippingItems changes
  React.useEffect(() => {
    itemsLengthRef.current = shippingItems.length;
  }, [shippingItems]);

  // Shipping data state that will be managed by Customers component
  const [shippingData, setShippingData] = React.useState({
    insuranceValue: 0,
  });

  // Initialize mutations
  const createShippingOrderMutation = useCreateShippingOrder();
  const createShippingOrderItemMutation = useCreateShippingOrderItem();
  const createShippingPackageSpecificationMutation =
    useCreateShippingPackageSpecification();
  const createShippingPackageSpecItemMutation =
    useCreateShippingPackageSpecItem();
  const createActivityHistory = useCreateActivityHistory();

  // Delete mutations for rollback functionality
  const deleteShippingOrderMutation = useDeleteShippingOrder();
  const deleteShippingOrderItemMutation = useDeleteShippingOrderItem();
  const deleteShippingPackageSpecificationMutation =
    useDeleteShippingPackageSpecification();
  const deleteShippingPackageSpecItemMutation =
    useDeleteShippingPackageSpecItem();
  const { createImage } = useCreateImageGallery();

  // Fetch order data if converting from order
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useOrder(ordersID > 0 ? ordersID : 0, ordersID > 0);

  const {
    data: orderItemsData,
    loading: orderItemsLoading,
    error: orderItemsError,
  } = useOrderItemsByOrderId(ordersID > 0 ? ordersID : 0, 1, 100);

  // Fetch images for order items
  const {
    data: dataOrdersItemsImage,
    loading: isLoadingOrdersItemsImage,
    error: errorOrdersItemsImage,
    refetch: refetchOrdersItemsImage,
  } = useImageGalleryByItemEndpoint(
    fkOrdersItemID > 0 ? fkOrdersItemID : 0,
    "ORDERS"
  );

  // Fetch customer data when customer ID changes
  const {
    customer: fetchedCustomer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(currentCustomerID > 0 ? currentCustomerID : customerID);

  // Debug logging for customer fetching
  React.useEffect(() => {
    console.log("DEBUG - useCustomer params:", {
      currentCustomerID,
      customerID,
      finalID: currentCustomerID > 0 ? currentCustomerID : customerID,
      fetchedCustomer,
      customerLoading,
      customerError,
    });
  }, [
    currentCustomerID,
    customerID,
    fetchedCustomer,
    customerLoading,
    customerError,
  ]);

  const quotesNumber = "";

  const formatDate = (dateStringParams: string) => {
    const dateString = moment(dateStringParams);
    return dateString.format("MMMM D, YYYY");
  };

  const convertImageGalleryToExtendedFile = (
    imageGallery: any[]
  ): ExtendedFile[] => {
    if (!imageGallery || !Array.isArray(imageGallery)) return [];

    return imageGallery.map((image) => ({
      // Required ExtendedFile properties
      preview: image.url || image.image_url || "",
      typeImage: image.type || "OTHER",
      lastModified: Date.now(),
      name: image.filename || `image-${Date.now()}`,
      size: 0,
      type: "image/jpeg",
      uid: `${Date.now()}-${Math.random()}`,
      status: "done",
      percent: 100,
      ...image, // Keep original properties too
    }));
  };

  const mapToCustomerShippingOrdersTypes = (
    customer: any
  ): CustomerShippingOrdersTypes => {
    // @ts-ignore
    const defaultContact: ContactsTypes = {
      pk_contact_id: -1,
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      mobile_number: "",
      contact_type: "",
    };

    return {
      ...customer,
      owner_name: customer.owner_name || "",
      contact_primary:
        customer.primary_contact &&
        Object.keys(customer.primary_contact).length > 0
          ? (customer.primary_contact as ContactsTypes)
          : defaultContact,
      contacts: customer.contacts || [],
    } as CustomerShippingOrdersTypes;
  };

  // Convert order items to shipping items
  const convertOrderItemsToShippingItems = React.useCallback(
    (orderItems: any[]): ShippingItem[] => {
      if (!orderItems || orderItems.length === 0) return [];

      return orderItems.map((item, index) => {
        const convertedItem = {
          orderItemsID: -1,
          orderID: -1,
          productID: item.products_data?.id || -1,
          categoryID: item.products_category_data?.id || -1,
          categoryName: item.products_category_data?.name || "",
          trimsID: item.trim_data?.id || -1,
          trimsName: item.trim_data?.trim || "",
          packagingID: item.packaging_data?.id || -1,
          packagingName: item.packaging_data?.packaging || "",
          yarnID: item.yarn_data?.id || -1,
          yarnName: item.yarn_data?.yarn_color || "",
          item_name: item.item_name || `Item ${index + 1}`,
          item_description: item.item_description || "",
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
          total: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
          actionEdit: false,
          actionDelete: false,
          // Extended ShippingItem properties
          images: [],
          imagesLoaded: false,
          taxRate: 0.08,
          actionCreate: true,
          actionModify: false,
          actionEdited: false,
          errorState: [],
          modifyList: [],
          itemNumber: (index + 1).toString(),
          packageID: undefined,
          // Store original order item ID for image fetching
          originalOrderItemID: item.pk_order_item_id || -1,
        };

        return convertedItem;
      });
    },
    []
  );

  // Effect to copy order data when converting from order
  React.useEffect(() => {
    if (ordersID > 0 && orderData && orderItemsData && !isCreateFlag) {
      // Set customer ID from order but don't use cached customer data
      // Let useCustomer hook fetch the latest customer data
      if (orderData.customer_data) {
        setCurrentCustomerID(orderData.customer_data.id);
        // Don't set customerData here - let useCustomer hook fetch fresh data
      }

      // Convert order items to shipping items
      const convertedItems = convertOrderItemsToShippingItems(
        orderItemsData?.items || []
      );
      setShippingItems(convertedItems);
      setModifyFlag(true);
      setIsCreateFlag(true);
    }
  }, [
    ordersID,
    orderData,
    orderItemsData,
    convertOrderItemsToShippingItems,
    ordersNumber,
    isCreateFlag,
  ]);

  // Effect to fetch images for order items
  React.useEffect(() => {
    if (
      shippingItems &&
      shippingItems.length > 0 &&
      currentImageFetchIndex < shippingItems.length
    ) {
      const currentItem = shippingItems[currentImageFetchIndex];

      if (
        currentItem?.originalOrderItemID &&
        currentItem.originalOrderItemID > 0
      ) {
        setFKOrdersItemID(currentItem.originalOrderItemID);
      }
    }
  }, [shippingItems, currentImageFetchIndex]);

  // Effect to process fetched images
  React.useEffect(() => {
    // Only run if we have image data and a valid order item ID
    if (dataOrdersItemsImage?.items && fkOrdersItemID > 0) {
      // Update the current item with the fetched images
      setShippingItems((prevItems) =>
        prevItems.map((item) =>
          item.originalOrderItemID === fkOrdersItemID
            ? {
                ...item,
                images: convertImageGalleryToExtendedFile(
                  dataOrdersItemsImage.items
                ),
                imagesLoaded: true,
              }
            : item
        )
      );

      // Move to the next item after a short delay to avoid race conditions
      setTimeout(() => {
        setCurrentImageFetchIndex((prevIndex) => {
          // Use the ref to get current length safely
          const currentItemsLength = itemsLengthRef.current;
          // If we've processed all items, reset
          if (prevIndex + 1 >= currentItemsLength) {
            return prevIndex; // Stay at last index
          }
          return prevIndex + 1;
        });
      }, 500);
    }
  }, [dataOrdersItemsImage, fkOrdersItemID]);

  const handleCreatePipeline = async () => {
    try {
      setIsSubmitting(true);

      // Prepare pipeline data
      const pipelineData: ShippingPipelineData = {
        customerID: currentCustomerID,
        shippingStatus,
        shippingData,
        shippingItems,
        packages,
        taxRate,
        fullname: fullname || "Undefined User",
        orderID: ordersID > 0 ? ordersID : undefined, // NEW - link to source order if present
        calculateShippingOrderTotals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      };

      // Prepare hooks for pipeline
      const pipelineHooks: PipelineHooks = {
        createShippingOrder: createShippingOrderMutation,
        createShippingOrderItem: createShippingOrderItemMutation,
        createShippingPackageSpecification:
          createShippingPackageSpecificationMutation,
        createShippingPackageSpecItem: createShippingPackageSpecItemMutation,
        createActivityHistory,
        createImage,
        createImageFromUrl:
          imageGalleryService.createFromUrl.bind(imageGalleryService),
        deleteShippingOrder: deleteShippingOrderMutation,
        deleteShippingOrderItem: deleteShippingOrderItemMutation,
        deleteShippingPackageSpecification:
          deleteShippingPackageSpecificationMutation,
        deleteShippingPackageSpecItem: deleteShippingPackageSpecItemMutation,
      };

      // Execute the pipeline
      const createdShippingOrder = await executeShippingOrderPipeline(
        pipelineData,
        pipelineHooks,
        uploadSingleImage,
        Type,
        FKItemType
      );

      // Create activity history for conversion if from order
      if (ordersID > 0 && ordersNumber) {
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: shippingStatus,
          tags: "",
          activity: `Order #${ordersNumber} converted to Shipping Order #${createdShippingOrder.shipping_order_number}`,
          activityType: `Convert`,
          documentID: ordersID,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });

        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: shippingStatus,
          tags: "",
          activity: `Shipping Order #${createdShippingOrder.shipping_order_number} created from Order #${ordersNumber}`,
          activityType: `Convert`,
          documentID: createdShippingOrder.pk_shipping_order_id,
          documentType: "Shipping Orders",
          userOwner: fullname || "Undefined User",
        });
      }

      // Success - clean up and redirect
      setIsCreateFlag(false);
      setModifyFlag(false);

      // Show success message
      toast.success(
        `Shipping Order #${createdShippingOrder.shipping_order_number} created successfully`
      );

      // Redirect to shipping orders detail page after successful creation
      router.push(`/crm/shipping/${createdShippingOrder.pk_shipping_order_id}`);

      return createdShippingOrder;
    } catch (error) {
      // Error handling is managed by the pipeline service
      console.error("Failed to create shipping order pipeline:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle shipment creation with validation
  const handleCreateShipment = React.useCallback(async () => {
    if (!customerData) {
      toast.error("Please Select Customer for Shipping Order");
      return;
    }

    // Validate phone number before proceeding
    // Use shipping contact phone number from packages instead of customer primary contact
    let shippingPhoneNumber = null;
    
    // Check if any packages have a phone number (from package specifications)
    if (packages.length > 0) {
      const packageWithPhone = packages.find(pkg => pkg.phone_number && pkg.phone_number.trim());
      shippingPhoneNumber = packageWithPhone?.phone_number;
    }
    
    // Fallback to customer primary contact if no package phone number
    if (!shippingPhoneNumber) {
      const currentCustomer = fetchedCustomer || customerData;
      const customerContact = currentCustomer?.contact_primary;
      shippingPhoneNumber = customerContact?.phone_number;
    }
    
    console.log("DEBUG - Packages:", packages);
    console.log("DEBUG - Shipping phone number:", shippingPhoneNumber);
    
    if (!shippingPhoneNumber) {
      toast.error(
        "Shipping contact phone number is required for EasyPost shipping rates. Please add a phone number in the Package Specifications section."
      );
      return;
    }

    const cleanPhoneNumber = shippingPhoneNumber.replace(/\D/g, "");
    if (cleanPhoneNumber.length < 10) {
      toast.error(
        `Shipping contact phone number must be at least 10 digits. Current number "${shippingPhoneNumber}" has only ${cleanPhoneNumber.length} digits. Please update the phone number in Package Specifications.`
      );
      return;
    }

    // Check if packages have shipping rates selected
    if (packages.length > 0) {
      const packagesWithoutRates = packages.filter(
        (pkg) => !pkg.carrier || !pkg.service
      );

      if (packagesWithoutRates.length > 0) {
        const packageNames = packagesWithoutRates
          .map((pkg) => pkg.name)
          .join(", ");
        toast.error(
          `Please provide carrier and service information for the following packages: ${packageNames}`
        );
        return;
      }
    }

    if (shippingItems.length === 0) {
      toast.error("Please add at least one item to the shipping order");
      return;
    }

    // Validate package assignments
    if (packages.length > 0) {
      // Check if any packages have no items assigned
      const packagesWithNoItems = packages.filter((pkg) => {
        const itemsInPackage = shippingItems.filter(
          (item) => item.packageQuantities?.[pkg.id]
        );
        return itemsInPackage.length === 0;
      });

      if (packagesWithNoItems.length > 0) {
        const packageNames = packagesWithNoItems
          .map((pkg) => pkg.name)
          .join(", ");
        toast.error(
          `The following packages have no items assigned: ${packageNames}. Please assign items to all packages or remove empty packages.`
        );
        return;
      }
    }

    try {
      await handleCreatePipeline();
    } catch (error) {
      console.error("Error in shipping order creation process:", error);
    }
  }, [
    customerData,
    packages,
    shippingItems,
    currentCustomerID,
    shippingStatus,
    createShippingOrderMutation,
    createShippingOrderItemMutation,
  ]);

  // Update customer data when fetched customer changes
  React.useEffect(() => {
    if (fetchedCustomer) {
      setCustomerData(mapToCustomerShippingOrdersTypes(fetchedCustomer));
    }
  }, [fetchedCustomer]);

  return (
    <div className="flex flex-col p-4" style={{ rowGap: "10px" }}>
      <ShippingDetailsHeaders
        status={shippingStatus}
        setStatus={setShippingStatus}
        add={true}
        modifyFlag={modifyFlag}
        setModifyFlag={setModifyFlag}
        handleUpdateClick={handleCreateShipment}
        isSaving={isSubmitting}
        disableSave={!currentCustomerID || currentCustomerID <= 0}
      />

      <InfoBox
        title={`Creating new shipping order ${
          ordersNumber.length > 0 ? `from Order #${ordersNumber}` : ""
        }`}
        subtitle="Select a customer, add shipping details and items to your shipping order. Once saved, the shipping order will be available in the shipping orders list."
      />
      <CompanyInfo />

      {/* Customer Information */}
      <Customers
        data={customerData}
        customerID={currentCustomerID}
        setCustomerID={setCurrentCustomerID}
        setModifyFlag={setModifyFlag}
        customerLoading={customerLoading}
      />

      {/* Package Specifications */}
      {ordersID > 0 && (orderLoading || orderItemsLoading) ? (
        <PackageSpecificationsSkeleton />
      ) : (
        <PackageSpecifications
          shippingItems={shippingItems}
          setShippingItems={setShippingItems}
          packages={packages}
          setPackages={setPackages}
          shippingContact={customerData?.contact_primary}
          shippingAddress={customerData?.addresses?.[0]}
          isDetailsPage={false}
        />
      )}

      {/* Shipping Items Table */}
      {ordersID > 0 && (orderLoading || orderItemsLoading) ? (
        <ShippingItemsSkeleton />
      ) : (
        <ShippingItemsTable
          shippingItems={shippingItems}
          setShippingItems={setShippingItems}
          setModifyFlag={setModifyFlag}
          packages={packages}
        />
      )}
    </div>
  );
};

export default ShippingAdd;
