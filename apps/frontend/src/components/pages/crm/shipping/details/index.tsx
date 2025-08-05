"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import moment from "moment";

import ShippingDetailsHeaders from "../sections/headers";
import { InfoBox } from "@/components/custom/info-box";
import {
  ContactsTypes,
  Customer as CustomerShippingOrdersTypes,
} from "../../../../../services/shipping-orders/types";
import { TableOrdersItems } from "../types";
import ShippingItemsTable, {
  ShippingItem,
} from "../sections/shipping-items-table";
import ShippingItemsSkeleton from "../sections/shipping-items-skeleton";
import PackageSpecifications, {
  PackageSpec,
} from "../sections/package-specifications";
import PackageSpecificationsSkeleton from "../sections/package-specifications-skeleton";
import Customers from "../sections/customers";
import { useCustomer } from "../../../../../hooks/useCustomers2";
import {
  useUpdateShippingOrder,
  useDeleteShippingOrder,
} from "../../../../../hooks/useShippingOrders";
import {
  useShippingOrderItemsByShippingOrderId,
  useUpdateShippingOrderItem,
  useCreateShippingOrderItem,
  useDeleteShippingOrderItem,
  useShippingOrderTotals,
} from "../../../../../hooks/useShippingOrderItems";
import { useCreateActivityHistory } from "../../../../../hooks/useActivityHistory";
import { useCreateImageGallery } from "../../../../../hooks/useImageGallery";
import { imageGalleryService } from "../../../../../services/image-gallery";
import { useImageGalleryByItemEndpoint } from "../../../../../hooks/useImageGallery";
import { uploadSingleImage } from "../../quotes-details/helpers-functions/image-helpers";
import { ExtendedFile } from "../../quotes-details/sections/image-upload-dropzone";
import {
  FKItemType,
  Type,
  CreateImageGalleryParams,
} from "../../../../../services/image-gallery/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ActivityHistory from "../sections/activity-history";
import usePrevious from "../../../../../hooks/usePrevious";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import CompanyInfo from "../sections/company-info";
import {
  useShippingPackageSpecificationsByShippingOrderId,
  useUpdateShippingPackageSpecification,
  useCreateShippingPackageSpecification,
  useDeleteShippingPackageSpecification,
} from "../../../../../hooks/useShippingPackageSpecifications";
import { shippingPackageSpecItemsService } from "../../../../../services/shipping-package-spec-items";
import { useShippingPackageSpecItemsByPackageSpec } from "../../../../../hooks/useShippingPackageSpecItems";
import PackingSlipPDF from "@/components/pdf/packing-slip-pdf";
import PackageSelectDialog from "@/components/dialogs/package-select-dialog";
import { pdf } from "@react-pdf/renderer";
import { COMPANY_INFO } from "@/constants/company-info";

interface ShippingDetailsProps {
  shippingOrder: any; // We'll type this properly based on your shipping order type
}

const ShippingDetails: React.FC<ShippingDetailsProps> = ({ shippingOrder }) => {
  const router = useRouter();
  const taxRate = 0.08;

  const { fullname } = useSelector((state: RootState) => state.users);

  const [shippingStatus, setShippingStatus] = React.useState<number>(
    shippingOrder?.status?.id || 1
  );
  const [modifyFlag, setModifyFlag] = React.useState(false);
  const [isCreateFlag, setIsCreateFlag] = React.useState(false);
  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(
    shippingOrder?.customer?.pk_customer_id || -1
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showPackageSelectDialog, setShowPackageSelectDialog] =
    React.useState(false);

  const [toggleRefetch, setToggleRefetch] = React.useState(false);
  const [refetchImages, setRefetchImages] = React.useState(false);

  const [statusChange, setStatusChange] = React.useState<boolean>(false);
  const [statusText, setStatusText] = React.useState<string>("");
  const [customerChange, setCustomerChange] = React.useState<boolean>(false);

  const [shippingItems, setShippingItems] = React.useState<ShippingItem[]>([]);
  const [deletedShippingItems, setDeletedShippingItems] = React.useState<
    number[]
  >([]);
  const prevShippingItems = usePrevious(shippingItems);

  // Package specifications state
  const [packages, setPackages] = React.useState<PackageSpec[]>([]);

  const [customerData, setCustomerData] =
    React.useState<CustomerShippingOrdersTypes | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);

  // Image fetching state
  const [currentImageFetchIndex, setCurrentImageFetchIndex] =
    React.useState<number>(0);
  const [fkShippingOrderItemID, setFKShippingOrderItemID] =
    React.useState<number>(-1);

  // Ref to track if we're currently processing an item
  const isProcessingRef = React.useRef<boolean>(false);
  // Ref to track current items length to avoid stale closures
  const itemsLengthRef = React.useRef<number>(0);
  // Ref to track processed items to prevent infinite loops
  const processedItemsRef = React.useRef<Set<number>>(new Set());
  // Ref to track current shipping items to avoid stale closures
  const shippingItemsRef = React.useRef<ShippingItem[]>([]);
  // Ref to track timeouts for cleanup
  const timeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
  // Ref to track if we've already processed the current response
  const processedResponseRef = React.useRef<string>("");

  // Update the ref whenever shippingItems changes - use useLayoutEffect to avoid re-renders
  React.useLayoutEffect(() => {
    itemsLengthRef.current = shippingItems.length;
    shippingItemsRef.current = shippingItems;
    // Reset processed items when shipping items change
    processedItemsRef.current.clear();
    // Clear any pending timeouts when shipping items change
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, [shippingItems]);

  // Shipping data state that will be managed by Customers component
  const [shippingData, setShippingData] = React.useState({
    insuranceValue: Number(shippingOrder?.insurance_value) || 0,
  });

  // API Hooks - using same naming pattern as add page
  const {
    customer: fetchedCustomer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(currentCustomerID > 0 ? currentCustomerID : null);

  const {
    data: shippingOrderItemsResponse,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchShippingOrderItems,
  } = useShippingOrderItemsByShippingOrderId(
    shippingOrder.pk_shipping_order_id,
    {
      page: currentPage,
      limit: 10,
    }
  );

  const {
    data: shippingOrderTotals,
    isLoading: shippingOrderTotalsLoading,
    error: shippingOrderTotalsError,
    refetch: fetchShippingOrderTotals,
  } = useShippingOrderTotals(shippingOrder.pk_shipping_order_id);

  // Package specifications hooks
  const {
    data: packageSpecificationsResponse,
    isLoading: packagesLoading,
    error: packagesError,
    refetch: refetchPackageSpecifications,
  } = useShippingPackageSpecificationsByShippingOrderId(
    shippingOrder.pk_shipping_order_id,
    { page: 1, limit: 100 }
  );

  // Package spec items will be loaded via the package specifications response

  // Mutations
  const updateShippingOrderMutation = useUpdateShippingOrder();
  const deleteShippingOrderMutation = useDeleteShippingOrder();
  const updateShippingOrderItemMutation = useUpdateShippingOrderItem();
  const createShippingOrderItemMutation = useCreateShippingOrderItem();
  const deleteShippingOrderItemMutation = useDeleteShippingOrderItem();
  const createActivityHistory = useCreateActivityHistory();
  const { createImage } = useCreateImageGallery();

  // Package specification mutations
  const updateShippingPackageSpecificationMutation =
    useUpdateShippingPackageSpecification();
  const createShippingPackageSpecificationMutation =
    useCreateShippingPackageSpecification();
  const deleteShippingPackageSpecificationMutation =
    useDeleteShippingPackageSpecification();

  // Fetch images for shipping order items
  const {
    data: dataShippingOrderItemsImage,
    loading: isLoadingShippingOrderItemsImage,
    error: errorShippingOrderItemsImage,
    refetch: refetchShippingOrderItemsImage,
  } = useImageGalleryByItemEndpoint(
    fkShippingOrderItemID > 0 ? fkShippingOrderItemID : null,
    "SHIPPING"
  );

  const mapToCustomerShippingOrdersTypes = (
    customer: any
  ): CustomerShippingOrdersTypes => {
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

  const createShippingOrderItemsPipeline = async () => {
    const newShippingItems = shippingItems.filter(
      (item) => item.orderItemsID === -1 && item.actionCreate
    );

    if (newShippingItems.length > 0) {
      const createPromises = await Promise.all(
        newShippingItems.map(async (item) => {
          const createData = {
            fkShippingOrderID: shippingOrder.pk_shipping_order_id,
            fkProductID: item.productID || undefined,
            fkTrimID: item.trimsID || undefined,
            fkYarnID: item.yarnID || undefined,
            fkPackagingID: item.packagingID || undefined,
            fkShippingPackageID: item.packageID || undefined,
            itemNumber: item.itemNumber,
            itemName: item.item_name,
            itemDescription: item.item_description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            taxRate: taxRate,
          };

          return createShippingOrderItemMutation.mutateAsync(createData);
        })
      );

      const shipping_order_item_numbers = createPromises.map(
        (data) => data.item_number
      );

      const createActivity = `Create new ${shipping_order_item_numbers.join(
        ", "
      )} Shipping Order Items from Shipping Order #${
        shippingOrder.shipping_order_number
      }`;

      console.log(createActivity);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: shippingStatus,
        tags: "",
        activity: createActivity,
        activityType: `Create`,
        documentID: shippingOrder.pk_shipping_order_id,
        documentType: "Shipping",
        userOwner: fullname || "Undefined User",
      });

      // Process images for created items
      const shipping_order_item_ids = createPromises.map(
        (data) => data.pk_shipping_order_item_id
      );

      for (let i = 0; i < newShippingItems.length; i++) {
        const item = newShippingItems[i];

        if (!item.images || item.images.length === 0) {
          continue;
        }

        const shipping_order_item_id = Number(shipping_order_item_ids[i]);

        for (let j = 0; j < item.images.length; j++) {
          const dataImage = item.images[j];
          const imageType =
            dataImage.typeImage === Type.LOGO
              ? Type.LOGO
              : dataImage.typeImage === Type.ARTWORK
              ? Type.ARTWORK
              : Type.OTHER;

          try {
            let uploadedImage = null;

            // Check if this is a File object (new upload) or ExtendedFile (already uploaded)
            const isFile = dataImage instanceof File;

            if (isFile) {
              // Use uploadSingleImage for File objects
              const createImageParams: CreateImageGalleryParams = {
                fkItemID: shipping_order_item_id,
                fkItemType: FKItemType.SHIPPING,
                imageFile: dataImage,
                description:
                  dataImage.name ||
                  `Image ${j + 1} for item #${shipping_order_item_id}`,
                type: imageType,
              };

              uploadedImage = await uploadSingleImage(
                createImageParams,
                createImage
              );
            } else {
              // Use createImageFromUrl for already uploaded images (ExtendedFile objects)
              const imageUrl =
                (dataImage as any).preview ||
                (dataImage as any).url ||
                (dataImage as any).image_url ||
                "";
              const imageName =
                (dataImage as any).name ||
                (dataImage as any).filename ||
                `Image ${j + 1} for item #${shipping_order_item_id}`;

              // Call createImageFromUrl directly since it's not a mutation hook
              uploadedImage = await imageGalleryService.createFromUrl({
                url: imageUrl,
                fkItemID: shipping_order_item_id,
                fkItemType: FKItemType.SHIPPING,
                description: imageName,
                type: imageType,
              });
            }

            if (uploadedImage) {
              // @ts-ignore
              await createActivityHistory.mutateAsync({
                customerID: currentCustomerID,
                status: shippingStatus,
                tags: "",
                activity: `Uploaded image "${
                  dataImage.name ||
                  `Image ${j + 1} for item #${shipping_order_item_id}`
                }" for Shipping Order Item #${shipping_order_item_id}`,
                activityType: "Upload",
                documentID: shippingOrder.pk_shipping_order_id,
                documentType: "Shipping",
                userOwner: fullname || "Undefined User",
              });
            }
          } catch (uploadError) {
            console.error(
              `Failed to process image ${
                j + 1
              } for shipping order item #${shipping_order_item_id}:`,
              uploadError
            );
            toast.error(
              `Failed to process image ${
                j + 1
              } for shipping order item #${shipping_order_item_id}`
            );
          }
        }
      }

      setIsCreateFlag(false);
      await refetchShippingOrderItems();
      // Trigger image refetch for new items
      setRefetchImages((prev) => !prev);
    }
  };

  const updateShippingOrderItemsPipeline = async () => {
    const itemsToUpdate = shippingItems.filter(
      (item) => item.orderItemsID > 0 && item.actionEdited
    );

    if (itemsToUpdate.length > 0) {
      const updatePromises = itemsToUpdate.map(async (item) => {
        const updateData = {
          fkProductID: item.productID ? Number(item.productID) : undefined,
          fkTrimID: item.trimsID > 0 ? Number(item.trimsID) : undefined,
          fkYarnID: item.yarnID > 0 ? Number(item.yarnID) : undefined,
          fkPackagingID:
            item.packagingID > 0 ? Number(item.packagingID) : undefined,
          fkShippingPackageID: item.packageID
            ? Number(item.packageID)
            : undefined,
          itemName: item.item_name,
          itemDescription: item.item_description,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unit_price) || 0,
          taxRate: Number(taxRate),
        };

        return updateShippingOrderItemMutation.mutateAsync({
          id: item.orderItemsID,
          item: updateData,
        });
      });

      await Promise.all(updatePromises);

      if (
        prevShippingItems &&
        JSON.stringify(prevShippingItems) !== JSON.stringify(shippingItems)
      ) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: shippingStatus,
          tags: "",
          activity: `Updated ${updatePromises.length} Shipping Items from Shipping Order #${shippingOrder.shipping_order_number}`,
          activityType: `Update`,
          documentID: shippingOrder.pk_shipping_order_id,
          documentType: "Shipping",
          userOwner: fullname || "Undefined User",
        });
      }
    }
  };

  const deleteShippingOrderItemsPipeline = async () => {
    const itemsToDelete = shippingItems.filter(
      (item) => item.orderItemsID > 0 && item.actionDelete
    );

    if (itemsToDelete.length > 0) {
      const deletePromises = itemsToDelete.map(async (item) => {
        return deleteShippingOrderItemMutation.mutateAsync(item.orderItemsID);
      });

      await Promise.all(deletePromises);
    }
  };

  // Package validation function
  const validatePackageAssignments = (): boolean => {
    if (packages.length === 0) {
      return true; // No packages to validate
    }

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
      return false;
    }

    return true;
  };

  // Phone number validation function
  const validatePhoneNumber = (): boolean => {
    // Use shipping contact phone number from packages instead of customer primary contact
    let shippingPhoneNumber = null;

    // Check if any packages have a phone number (from package specifications)
    if (packages.length > 0) {
      const packageWithPhone = packages.find(
        (pkg) => pkg.phone_number && pkg.phone_number.trim()
      );
      shippingPhoneNumber = packageWithPhone?.phone_number;
    }

    // Fallback to customer primary contact if no package phone number
    if (!shippingPhoneNumber) {
      const shippingContact =
        customerData?.contact_primary ||
        shippingOrder.customer?.contact_primary;
      shippingPhoneNumber = shippingContact?.phone_number;
    }

    if (!shippingPhoneNumber) {
      toast.error(
        "Shipping contact phone number is required for EasyPost shipping rates. Please add a phone number in the Package Specifications section."
      );
      return false;
    }

    const cleanPhoneNumber = shippingPhoneNumber.replace(/\D/g, "");

    if (cleanPhoneNumber.length < 10) {
      toast.error(
        `Shipping contact phone number must be at least 10 digits. Current number "${shippingPhoneNumber}" has only ${cleanPhoneNumber.length} digits. Please update the phone number in Package Specifications.`
      );
      return false;
    }

    return true;
  };

  // Package specifications pipeline
  const updatePackageSpecificationsPipeline = async () => {
    if (packages.length === 0) return;

    // Get existing package specifications from the database
    const existingPackages = packageSpecificationsResponse?.items || [];

    // Find packages that need to be created (new packages with temporary IDs)
    const newPackages = packages.filter((pkg) => pkg.id < 0);

    // Find packages that need to be updated (existing packages)
    const updatedPackages = packages.filter((pkg) => pkg.id > 0);

    // Find packages that need to be deleted (packages in database but not in current state)
    const packagesToDelete = existingPackages.filter(
      (dbPkg) =>
        !packages.some(
          (currentPkg) => currentPkg.id === dbPkg.pk_shipping_package_spec_id
        )
    );

    // Buy labels for packages that have shipping rates but no tracking codes
    const packagesNeedingLabels = packages.filter(
      (pkg) =>
        pkg.easypost_shipment_id &&
        pkg.easypost_shipment_rate_id &&
        !pkg.tracking_code
    );

    const labelResults = new Map<number, any>();

    if (packagesNeedingLabels.length > 0) {
      try {
        console.log(
          `🏷️ Buying labels for ${packagesNeedingLabels.length} packages...`
        );

        // Import the EasyPost service
        const { easyPostService } = await import(
          "../../../../../services/easypost"
        );

        const buyLabelPromises = packagesNeedingLabels.map(async (pkg) => {
          try {
            if (!pkg.easypost_shipment_id || !pkg.easypost_shipment_rate_id) {
              throw new Error(
                `Missing shipment or rate ID for package "${pkg.name}"`
              );
            }

            const labelData = await easyPostService.buyLabel(
              pkg.easypost_shipment_id,
              pkg.easypost_shipment_rate_id
            );

            labelResults.set(pkg.id, labelData);
            console.log(
              `✅ Bought label for package "${pkg.name}":`,
              labelData
            );

            return { packageId: pkg.id, labelData };
          } catch (error) {
            console.error(
              `❌ Failed to buy label for package "${pkg.name}":`,
              error
            );
            throw error;
          }
        });

        await Promise.all(buyLabelPromises);
        toast.success(
          `Purchased ${packagesNeedingLabels.length} shipping labels`
        );
      } catch (error) {
        console.error("❌ Failed to buy labels:", error);
        toast.error("Failed to purchase some shipping labels");
      }
    }

    // Create new packages
    if (newPackages.length > 0) {
      const createPromises = newPackages.map(async (pkg) => {
        // Get label data for this package if available
        const labelData = labelResults.get(pkg.id);

        const createData = {
          fkShippingOrderId: shippingOrder.pk_shipping_order_id,
          name: pkg.name,
          companyName: pkg.company_name,
          phoneNumber: pkg.phone_number,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          weight: pkg.weight,
          measurementUnit: pkg.measurement_unit,
          // Preset ID fields
          fkDimensionPresetId: pkg.fk_dimension_preset_id,
          fkWeightPresetId: pkg.fk_weight_preset_id,
          address: pkg.address,
          city: pkg.city,
          state: pkg.state,
          zip: pkg.zip,
          country: pkg.country,
          // Shipping rate fields
          carrier: pkg.carrier,
          service: pkg.service,
          carrierDescription: pkg.carrier_description,
          shippingRateId: pkg.shipping_rate_id,
          easypostShipmentId: pkg.easypost_shipment_id || undefined,
          easypostShipmentRateId: pkg.easypost_shipment_rate_id || undefined,
          // Label data from EasyPost
          trackingCode: labelData?.trackingCode || pkg.tracking_code,
          labelUrl: labelData?.labelUrl || pkg.label_url,
          shipmentStatus: labelData?.shipmentStatus || pkg.shipment_status,
          estimatedDeliveryDays: pkg.estimated_delivery_days,
        };
        return createShippingPackageSpecificationMutation.mutateAsync(
          createData
        );
      });
      await Promise.all(createPromises);
    }

    // Update existing packages
    if (updatedPackages.length > 0) {
      const updatePromises = updatedPackages.map(async (pkg) => {
        // Get label data for this package if available
        const labelData = labelResults.get(pkg.id);

        const updateData = {
          name: pkg.name,
          companyName: pkg.company_name,
          phoneNumber: pkg.phone_number,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          weight: pkg.weight,
          measurementUnit: pkg.measurement_unit,
          address: pkg.address,
          city: pkg.city,
          state: pkg.state,
          zip: pkg.zip,
          country: pkg.country,
          // Shipping rate fields
          carrier: pkg.carrier,
          service: pkg.service,
          carrierDescription: pkg.carrier_description,
          shippingRateId: pkg.shipping_rate_id,
          easypostShipmentId: pkg.easypost_shipment_id || undefined,
          easypostShipmentRateId: pkg.easypost_shipment_rate_id || undefined,
          // Label data from EasyPost
          trackingCode: labelData?.trackingCode || pkg.tracking_code,
          labelUrl: labelData?.labelUrl || pkg.label_url,
          shipmentStatus: labelData?.shipmentStatus || pkg.shipment_status,
          estimatedDeliveryDays: pkg.estimated_delivery_days,
        };
        return updateShippingPackageSpecificationMutation.mutateAsync({
          id: pkg.id,
          spec: updateData,
        });
      });
      await Promise.all(updatePromises);
    }

    // Delete packages
    if (packagesToDelete.length > 0) {
      const deletePromises = packagesToDelete.map(async (pkg) => {
        return deleteShippingPackageSpecificationMutation.mutateAsync(
          pkg.pk_shipping_package_spec_id
        );
      });
      await Promise.all(deletePromises);
    }

    if (
      newPackages.length > 0 ||
      updatedPackages.length > 0 ||
      packagesToDelete.length > 0
    ) {
      // Package specifications updated successfully
    }
  };

  const handleUpdateClick = async () => {
    if (!modifyFlag) return;

    try {
      setIsSaving(true);

      // Validate package assignments before updating
      if (!validatePackageAssignments()) {
        setIsSaving(false);
        return;
      }

      // Validate phone number before updating
      if (!validatePhoneNumber()) {
        setIsSaving(false);
        return;
      }

      await createShippingOrderItemsPipeline();
      await updateShippingOrderItemsPipeline();
      await deleteShippingOrderItemsPipeline();
      await updatePackageSpecificationsPipeline();

      // Calculate total amount
      const subtotal = shippingItems.reduce((sum, item) => {
        return sum + item.quantity * item.unit_price;
      }, 0);

      const taxTotal = subtotal * taxRate;
      const totalAmount = subtotal + taxTotal;

      // Update shipping order
      const updatePayload = {
        customerID:
          currentCustomerID > 0
            ? Number(currentCustomerID)
            : Number(shippingOrder.customer?.pk_customer_id),
        statusID: Number(shippingStatus),
        taxTotal: Number(taxTotal),
        subtotal: Number(subtotal),
        insuranceValue: Number(shippingData.insuranceValue),
      };

      await updateShippingOrderMutation.mutateAsync({
        id: shippingOrder.pk_shipping_order_id,
        shippingOrder: updatePayload,
      });

      // Create activity history for general shipping order updates
      if (modifyFlag) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: shippingStatus,
          tags: "",
          activity: `Updated Shipping Order #${shippingOrder.shipping_order_number} details`,
          activityType: `Update`,
          documentID: shippingOrder.pk_shipping_order_id,
          documentType: "Shipping",
          userOwner: fullname || "Undefined User",
        });
      }

      if (statusChange) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: shippingStatus,
          tags: "",
          activity: `Update Shipping Order #${shippingOrder.shipping_order_number} to ${statusText} status`,
          activityType: `Status Change`,
          documentID: shippingOrder.pk_shipping_order_id,
          documentType: "Shipping",
          userOwner: fullname || "Undefined User",
        });

        setStatusChange(false);
      }

      if (customerChange) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: shippingStatus,
          tags: "",
          activity: `Update Shipping Order #${shippingOrder.shipping_order_number} customer to ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
          activityType: `Update`,
          documentID: shippingOrder.pk_shipping_order_id,
          documentType: "Shipping",
          userOwner: fullname || "Undefined User",
        });
        setCustomerChange(false);
      }

      toast.success(
        `Shipping Order #${shippingOrder.shipping_order_number} updated successfully`
      );

      setModifyFlag(false);
      await refetchShippingOrderItems();
      await refetchPackageSpecifications();
      setToggleRefetch(!toggleRefetch);
      // Trigger image refetch after any save operation
      setRefetchImages((prev) => !prev);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error("Failed to update shipping order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShippingOrder = async () => {
    try {
      setIsDeleting(true);
      await deleteShippingOrderMutation.mutateAsync(
        shippingOrder.pk_shipping_order_id
      );

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: shippingStatus,
        tags: "",
        activity: `Delete Shipping Order #${shippingOrder.shipping_order_number} from customer ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
        activityType: `Delete`,
        documentID: shippingOrder.pk_shipping_order_id,
        documentType: "Shipping",
        userOwner: fullname || "Undefined User",
      });

      toast.success(
        `Shipping Order #${shippingOrder.shipping_order_number} deleted successfully`
      );
      router.back();
    } catch (error) {
      console.error("Failed to delete shipping order:", error);
      toast.error("Failed to delete shipping order. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleGeneratePackingSlip = () => {
    // Show package selection dialog instead of generating PDF directly
    setShowPackageSelectDialog(true);
  };

  const handlePackageSelect = async (packageIndex: number) => {
    try {
      // Get the selected package
      const selectedPackage =
        packageSpecificationsResponse?.items?.[packageIndex];
      if (!selectedPackage) {
        toast.error("Selected package not found");
        return;
      }

      // Prepare customer billing data
      const customer = customerData || shippingOrder.customer;
      const contact = customer?.contact_primary;
      const address = customer?.addresses?.[0];

      // Prepare items data matching the shipping items table structure
      const items = shippingItems.map((item) => ({
        categoryName: item.categoryName || "",
        itemNumber: item.itemNumber || "",
        item_name: item.item_name || "",
        item_description: item.item_description || "",
        yarnName: item.yarnName || "",
        packagingName: item.packagingName || "",
        trimsName: item.trimsName || "",
        quantity: item.quantity || 0,
        image: item.images?.[0]?.preview || "", // Keep for backward compatibility
        images:
          item.images
            ?.filter((img) => img.preview)
            .map((img) => ({ preview: img.preview! })) || [], // Pass all images with valid previews
      }));

      // Calculate total quantity
      const totalQuantity = shippingItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      const doc = (
        <PackingSlipPDF
          // Company Information
          companyName={COMPANY_INFO.name}
          companyAddress={`${COMPANY_INFO.address.street1}, ${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.state} ${COMPANY_INFO.address.zip}`}
          companyPhone={COMPANY_INFO.address.phone}
          companyEmail={COMPANY_INFO.email}
          companyWebsite={COMPANY_INFO.website}
          // Order Information
          invoiceNumber={shippingOrder.shipping_order_number || "N/A"}
          poNumber={shippingOrder.shipping_order_number || "N/A"}
          createdAt={formatDate(shippingOrder.order_date)}
          customerDueDate={formatDate(shippingOrder.due_date)}
          productDescription={shippingItems[0]?.item_name || "Products"}
          // Customer Billing Information
          customerBilling={{
            company: customer?.name || "N/A",
            name: contact
              ? `${contact.first_name} ${contact.last_name}`
              : "N/A",
            address: address
              ? `${address.address1}, ${address.city}, ${address.state} ${address.zip}`
              : "N/A",
            email: contact?.email || "N/A",
          }}
          // Package Shipping Information
          selectedPackage={{
            name: selectedPackage.name || "",
            company_name: selectedPackage.company_name || "",
            phone_number: selectedPackage.phone_number || "",
            address: selectedPackage.address || "",
            city: selectedPackage.city || "",
            state: selectedPackage.state || "",
            zip: selectedPackage.zip || "",
            country: selectedPackage.country || "",
          }}
          // Items
          items={items}
          // Total
          totalQuantity={totalQuantity}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Close the dialog
      setShowPackageSelectDialog(false);
    } catch (error) {
      console.error("Error generating packing slip:", error);
      toast.error("Failed to generate packing slip");
    }
  };

  const formatDate = (dateStringParams: string) => {
    const dateString = moment(dateStringParams);
    return dateString.format("MMMM D, YYYY");
  };

  const convertImageGalleryToExtendedFile = (
    imageGallery: any[]
  ): ExtendedFile[] => {
    if (!imageGallery || !Array.isArray(imageGallery)) {
      return [];
    }

    return imageGallery.map((image, index) => {
      // Create a mock File object since ExtendedFile extends File
      const mockFile = new File([], image.filename || `image-${Date.now()}`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      // Create ExtendedFile with only the properties we need, avoiding read-only File properties
      const extendedFile = Object.assign(mockFile, {
        id: `${image.id || Date.now()}-${Math.random()}`,
        preview: image.url || image.image_url || "",
        url: image.url || image.image_url || "",
        typeImage: image.type || "OTHER",
        uid: `${Date.now()}-${Math.random()}`,
        status: "done",
        percent: 100,
        // Only add non-read-only properties from the original image
        fk_item_id: image.fk_item_id,
        fk_item_type: image.fk_item_type,
        created_at: image.created_at,
        updated_at: image.updated_at,
      }) as ExtendedFile;

      return extendedFile;
    });
  };

  // Effects
  React.useEffect(() => {
    if (fetchedCustomer) {
      setCustomerData(mapToCustomerShippingOrdersTypes(fetchedCustomer));
    }
  }, [fetchedCustomer]);

  // Process shipping order items response - only when response changes
  React.useEffect(() => {
    if (shippingOrderItemsResponse && shippingOrderItemsResponse.items) {
      setShippingItems((prevItems) => {
        const normalizeData = shippingOrderItemsResponse.items.map(
          (data, index) => {
            // Find existing item to preserve images
            const existingItem = prevItems.find(
              (item) => item.orderItemsID === data.pk_shipping_order_item_id
            );

            const normalizedItem = {
              orderItemsID: data.pk_shipping_order_item_id,
              orderID:
                data.shipping_order_data?.pk_shipping_order_id ||
                shippingOrder.pk_shipping_order_id,
              productID: Number(data.product_data?.pk_product_id) || -1,
              categoryID: Number(data.product_data?.fk_category_id) || -1,
              categoryName: data.product_data?.product_name || "",
              trimsID: Number(data.trims_data?.pk_trim_id) || -1,
              trimsName: data.trims_data?.trim_name || "",
              packagingID: Number(data.packaging_data?.pk_packaging_id) || -1,
              packagingName: data.packaging_data?.packaging_name || "",
              yarnID: Number(data.yarn_data?.pk_yarn_id) || -1,
              yarnName: data.yarn_data?.yarn_name || "",
              item_name: data.item_name || "",
              item_description: data.item_description || "",
              quantity: Number(data.quantity) || 0,
              unit_price: Number(data.unit_price) || 0,
              total: Number(data.quantity) * Number(data.unit_price) || 0,
              taxRate: Number(data.tax_rate) || taxRate,
              actionCreate: false,
              actionModify: false,
              actionEdited: false,
              actionEdit: false,
              actionDelete: false,
              errorState: [],
              modifyList: [],
              itemNumber: data.item_number || `${index + 1}`,
              // Preserve existing images if available, but only mark as loaded if there are actual images
              images: existingItem?.images || [],
              imagesLoaded:
                existingItem?.images && existingItem.images.length > 0
                  ? existingItem.imagesLoaded
                  : false,
              packageID: undefined, // Package assignments now handled via ShippingPackageSpecItems
              packageQuantities: {}, // Will be populated from package spec items
            } as ShippingItem;

            return normalizedItem;
          }
        );

        return normalizeData;
      });

      // Reset image fetching index to start fetching images for new items
      setCurrentImageFetchIndex(0);

      // Clear the current FKShippingOrderItemID to force a fresh fetch
      setFKShippingOrderItemID(-1);

      // Reset processed response ref to allow processing new data
      processedResponseRef.current = "";
    } else {
      setShippingItems([]);
    }
  }, [shippingOrderItemsResponse, shippingOrder.pk_shipping_order_id, taxRate]);

  // Fetch images for all items
  React.useEffect(() => {
    if (!shippingItems || shippingItems.length === 0) {
      return;
    }

    const fetchAllImages = async () => {
      const updatedItems = await Promise.all(
        shippingItems.map(async (item, index) => {
          try {
            const response = await imageGalleryService.getByItemEndpoint(
              item.orderItemsID,
              "SHIPPING"
            );

            if (response?.items && response.items.length > 0) {
              const converted = convertImageGalleryToExtendedFile(
                response.items
              );

              return {
                ...item,
                images: converted,
                imagesLoaded: true,
              };
            } else {
              return {
                ...item,
                images: [],
                imagesLoaded: true,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching images for item ${item.orderItemsID}:`,
              error
            );
            return {
              ...item,
              images: [],
              imagesLoaded: true,
            };
          }
        })
      );

      setShippingItems(updatedItems);
    };

    fetchAllImages();
  }, [shippingItems.length, refetchImages]);

  // Load package specifications
  React.useEffect(() => {
    if (packageSpecificationsResponse && packageSpecificationsResponse.items) {
      const normalizedPackages = packageSpecificationsResponse.items.map(
        (pkg) =>
          ({
            id: Number(pkg.pk_shipping_package_spec_id),
            name: pkg.name,
            company_name: pkg.company_name || "",
            phone_number: pkg.phone_number || "",
            length: Number(pkg.length),
            width: Number(pkg.width),
            height: Number(pkg.height),
            weight: Number(pkg.weight),
            measurement_unit: pkg.measurement_unit || "metric",
            fk_dimension_preset_id: pkg.fk_dimension_preset_id,
            fk_weight_preset_id: pkg.fk_weight_preset_id,
            address: pkg.address || "",
            city: pkg.city || "",
            state: pkg.state || "",
            zip: pkg.zip || "",
            country: pkg.country || "",
            // Shipping rate fields
            carrier: pkg.carrier || "",
            service: pkg.service || "",
            carrier_description: pkg.carrier_description || "",
            shipping_rate_id: pkg.shipping_rate_id || "",
            easypost_shipment_id: pkg.easypost_shipment_id || "",
            easypost_shipment_rate_id: pkg.easypost_shipment_rate_id || "",
            tracking_code: pkg.tracking_code || "",
            label_url: pkg.label_url || "",
            shipment_status: pkg.shipment_status || "",
            estimated_delivery_days: pkg.estimated_delivery_days || "",
          } as PackageSpec)
      );

      setPackages(normalizedPackages);
    } else {
      setPackages([]);
    }
  }, [packageSpecificationsResponse]);

  // Populate packageQuantities from package spec items
  React.useEffect(() => {
    if (
      shippingItems.length > 0 &&
      packageSpecificationsResponse?.items &&
      packageSpecificationsResponse.items.length > 0
    ) {
      // Create a map of package spec items by shipping order item ID
      const packageQuantitiesMap: Record<number, Record<number, number>> = {};

      // Fetch package items for all packages
      const fetchPackageItems = async () => {
        try {
          for (const pkg of packageSpecificationsResponse.items) {
            const packageSpecId = Number(pkg.pk_shipping_package_spec_id);

            // Fetch package spec items for this package
            const response =
              await shippingPackageSpecItemsService.getShippingPackageSpecItemsByPackageSpecId(
                packageSpecId,
                { page: 1, limit: 1000 }
              );

            if (response?.items && response.items.length > 0) {
              const packageSpecItems = response.items;

              // Populate the map
              packageSpecItems.forEach((item: any) => {
                const shippingOrderItemId = Number(
                  item.fk_shipping_order_item_id
                );
                const quantity = Number(item.qty);

                if (!packageQuantitiesMap[shippingOrderItemId]) {
                  packageQuantitiesMap[shippingOrderItemId] = {};
                }
                packageQuantitiesMap[shippingOrderItemId][packageSpecId] =
                  quantity;
              });
            }
          }

          // Update shipping items with package quantities
          setShippingItems((prevItems) =>
            prevItems.map((item) => ({
              ...item,
              packageQuantities: packageQuantitiesMap[item.orderItemsID] || {},
            }))
          );
        } catch (error) {
          console.error("Error populating package quantities:", error);
        }
      };

      fetchPackageItems();
    }
  }, [shippingItems.length, packageSpecificationsResponse]);

  if (!shippingOrder) {
    return <div>Shipping order not found</div>;
  }

  return (
    <div className="flex flex-col p-4" style={{ rowGap: "10px" }}>
      <ShippingDetailsHeaders
        status={shippingStatus}
        setStatus={setShippingStatus}
        modifyFlag={modifyFlag}
        setModifyFlag={setModifyFlag}
        handleDeleteOrder={() => setShowDeleteDialog(true)}
        handleUpdateClick={handleUpdateClick}
        handleGeneratePackingSlip={handleGeneratePackingSlip}
        add={false}
        isSaving={isSaving}
        setStatusChange={setStatusChange}
        packages={packageSpecificationsResponse?.items || []}
        customerData={customerData || shippingOrder.customer}
        shippingOrder={shippingOrder}
        shippingItems={shippingItems}
        setStatusText={setStatusText}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                shipping order #{shippingOrder.shipping_order_number}
                and remove all associated shipping items from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteShippingOrder}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Shipping Order Info */}
      <InfoBox
        title={`Shipping Order ${shippingOrder.shipping_order_number} - Items Shipped`}
        subtitle={`This shipping order is currently managed by ${
          shippingOrder?.customer?.owner_name || "Unassigned"
        }. Last updated on ${formatDate(shippingOrder.order_date)}`}
      />

      <CompanyInfo />

      <Customers
        data={customerData || shippingOrder.customer}
        customerID={currentCustomerID}
        setCustomerID={setCurrentCustomerID}
        setModifyFlag={setModifyFlag}
        customerLoading={customerLoading}
      />

      {packagesLoading ? (
        <PackageSpecificationsSkeleton />
      ) : (
        <PackageSpecifications
          shippingItems={shippingItems}
          setShippingItems={setShippingItems}
          packages={packages}
          setPackages={setPackages}
          onPackageChange={() => setModifyFlag(true)}
          shippingContact={
            customerData?.contact_primary ||
            shippingOrder.customer?.contact_primary
          }
          shippingAddress={
            customerData?.addresses?.[0] ||
            shippingOrder.customer?.addresses?.[0]
          }
          isDetailsPage={true}
        />
      )}

      {itemsLoading ? (
        <ShippingItemsSkeleton />
      ) : (
        <ShippingItemsTable
          shippingItems={shippingItems}
          setShippingItems={setShippingItems}
          setModifyFlag={setModifyFlag}
          setDeletedShippingItems={setDeletedShippingItems}
          packages={packages}
          totalItems={shippingOrderItemsResponse?.meta?.totalItems || 0}
          currentPage={currentPage}
          totalPages={shippingOrderItemsResponse?.meta?.totalPages || 1}
          onPageChange={setCurrentPage}
        />
      )}

      <ActivityHistory
        documentID={shippingOrder.pk_shipping_order_id}
        toggleRefetch={toggleRefetch}
      />

      {/* Package Selection Dialog for Packing Slip */}
      <PackageSelectDialog
        open={showPackageSelectDialog}
        onOpenChange={setShowPackageSelectDialog}
        packages={
          packageSpecificationsResponse?.items?.map((pkg) => ({
            name: pkg.name || "",
            company_name: pkg.company_name || "",
            phone_number: pkg.phone_number || "",
            address: pkg.address || "",
            city: pkg.city || "",
            state: pkg.state || "",
            zip: pkg.zip || "",
            country: pkg.country || "",
          })) || []
        }
        onPackageSelect={handlePackageSelect}
        isLoading={packagesLoading}
      />
    </div>
  );
};

export default ShippingDetails;
