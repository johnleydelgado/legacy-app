"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import OrdersDetailsHeaders from "../sections/headers";
import { InfoBox } from "../../../../custom/info-box";
import Customers from "../sections/customers";
import {
  Customer as CustomerQuotesTypes,
} from "../../../../../services/quotes/types";
import { useCustomer } from "../../../../../hooks/useCustomers2";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useQuoteItemsByQuoteId } from "../../../../../hooks/useQuoteItems";
import { TableOrdersItems } from "../types";
import { useCreateOrder } from "../../../../../hooks/useOrders";
import { useCreateOrderItem } from "../../../../../hooks/useOrdersItems";
import { CreateOrderDto } from "../../../../../services/orders/types";
import { CreateOrderItemDTO } from "../../../../../services/orders-items/types";
import ItemsSummary, { OrdersSummaryTypes } from "../sections/items-summary";
import { uploadQuoteItemLogoToS3 } from "../../../../../utils/quote-items-logo-upload";
import {toast} from "sonner";
import {useCreateActivityHistory} from "../../../../../hooks/useActivityHistory";
import OrdersItemsTable2 from "../sections/orders-items-table-2";
import {ExtendedFile} from "../../quotes-details/sections/image-upload-dropzone";
import { useCreateImageGallery, useCreateImageGalleryFromUrl, useImageGallery, useImageGalleryByItemEndpoint, useUpdateImageGallery } from "@/hooks/useImageGallery";
import { FKItemType, Type } from "@/services/image-gallery/types";
import { uploadSingleImage } from "../../quotes-details/helpers-functions/image-helpers";
import { Contact, ContactType, ContactTypeEnums } from "@/services/contacts/types";
import { Address, AddressTypeEnums } from "@/services/addresses/types";
import { useContactByReference, useContactMutations } from "@/hooks/useContacts";
import { useAddressByForeignKey, useAddressMutations } from "@/hooks/useAddresses";

const OrderAdd = () => {
  const router = useRouter();

  const taxRate = 0.08;

  const [modifyFlag, setModifyFlag] = React.useState(false);
  const [orderStatus, setOrderStatus] = React.useState<number>(4);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [customerData, setCustomerData] =
    React.useState<CustomerQuotesTypes | null>(null);
  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(-1);

  const [orderItems, setOrderItems] = React.useState<TableOrdersItems[]>([]);
  const [deleteItems, setDeleteItems] = React.useState<number[]>([]);

  const [ordersSummary, setOrdersSummary] = React.useState<OrdersSummaryTypes>({
    addedQuantity: 0,
    addedUnitPrice: 0,
    addedTaxRate: 0,
    addedLineTotal: 0,
    paid: 0,
  });

  const [contactBilling, setContactBilling] = React.useState<Contact | null>(null);
  const [contactShipping, setContactShipping] = React.useState<Contact | null>(null);
  
  const [addressBilling, setAddressBilling] = React.useState<Address | null>(null);
  const [addressShipping, setAddressShipping] = React.useState<Address | null>(null);
  
  const [ordersNotes, setOrdersNotes] = React.useState<string>("");
  const [modifyNotes, setModifyNotes] = React.useState<boolean>(false);

  const customerID = useSelector(
    (state: RootState) => state.customers.customerID
  );
  const { fullname } = useSelector((state: RootState) => state.users);

  const quotesID = useSelector((state: RootState) => state.quotes.quotesID);
  const quotesNumber = useSelector((state: RootState) => state.quotes.quotesNumber);

  const [fkOrdersItemID, setFKOrdersItemID] = React.useState<number>(-1);
  const [currentImageFetchIndex, setCurrentImageFetchIndex] = React.useState<number>(0);

  // New hooks for order creation
  const { mutateAsync: createOrder } = useCreateOrder();
  const { createOrderItem } = useCreateOrderItem();
  const createActivityHistory = useCreateActivityHistory();
  const { createImage } = useCreateImageGallery();
  const { createImageFromUrl } = useCreateImageGalleryFromUrl();
  const { updateImage } = useUpdateImageGallery();

  const { createContact } = useContactMutations();
  const { createAddress } = useAddressMutations();

  // API Hooks - Using the by-quote endpoint
  const {
    data: quoteItemsResponse,
    isLoading: itemsLoading,
    error: itemsError,
  } = useQuoteItemsByQuoteId(quotesID, { page: 1, limit: 10 });

  const {
    customer: fetchedCustomer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(currentCustomerID > 0 ? currentCustomerID : customerID);

  const { 
    data: dataContactPrimary 
  } = useContactByReference(currentCustomerID, "Customers", ContactTypeEnums.PRIMARY);

  const {   
    data: dataContactBilling 
  } = useContactByReference(currentCustomerID, "Customers", ContactTypeEnums.BILLING);

  const { 
    data: dataContactShipping 
  } = useContactByReference(currentCustomerID, "Customers", ContactTypeEnums.SHIPPING);

  const { data: dataAddressBilling } = useAddressByForeignKey({
    fk_id: currentCustomerID,
    table: "Customers",
    address_type: AddressTypeEnums.BILLING
  });

  const { data: dataAddressShipping } = useAddressByForeignKey({
    fk_id: currentCustomerID,
    table: "Customers",
    address_type: AddressTypeEnums.SHIPPING
  });

  const {
    data: dataQuotesItemsImage,
    loading: isLoadingQuotesItemsImage,
    error: errorQuotesItemsImage,
    refetch: refetchQuotesItemsImage,
  } = useImageGalleryByItemEndpoint(fkOrdersItemID > 0 ? fkOrdersItemID : null, 'QUOTES');

  // Format today's date as ISO string for order creation
  const today = new Date().toISOString().split("T")[0];

  const mapToCustomerTypes = (customer: any): CustomerQuotesTypes => {
    // @ts-ignore
    const defaultContact: ContactsTypes = {
      pk_contact_id: -1,
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      mobile_number: "",
      contact_type: "",
      // Add any other required properties from ContactsTypes
    };

    return {
      ...customer,
      owner_name: customer.owner_name || "",
      contact_primary:
        customer.primary_contact &&
        Object.keys(customer.primary_contact).length > 0
          ? (customer.primary_contact as ContactType)
          : defaultContact,
      contacts: customer.contacts || [],
    } as CustomerQuotesTypes;
  };

  // Calculate client-side totals for preview before order creation
  const calculateOrderTotals = React.useMemo(() => {
    const subtotal = orderItems.reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );
    // These rates should ideally come from configuration
    const tax = subtotal * taxRate; // Assuming 8% tax
    const shipping = 0; // Free shipping for this example
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      total,
      totalQuantity: orderItems
        .reduce((acc, item) => acc + (item.quantity || 0), 0)
        .toString(),
    };
  }, [orderItems]);

  const handleContactChange = async (orderID: number, orderNumber: string) => {
    if (contactBilling) {
      try {
        await createContact({
          fk_id: orderID,
          firstname: contactBilling.first_name,
          lastname: contactBilling.last_name,
          email: contactBilling.email,
          phoneNumber: contactBilling.phone_number,
          mobileNumber: contactBilling.mobile_number,
          positionTitle: contactBilling.position_title,
          contactType: ContactTypeEnums.BILLING,
          table: "Orders"
        });

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: `Set Orders #${orderNumber} Billing Contact`,
          activityType: `Set`,
          documentID: orderID,
          documentType: "Orders",
          userOwner: fullname || "Undefined User"
        });

        // toast.success(`Orders #${orderNumber} Billing Contact successfully created`);
        console.log(`Orders #${orderNumber} Billing Contact successfully created`);

      } catch (error) {
        console.error("Failed to create contact:", error);
      }

      return Promise.resolve();
    }

    if (contactShipping) {
      try {
        await createContact({
          fk_id: orderID,
          firstname: contactShipping.first_name,
          lastname: contactShipping.last_name,
          email: contactShipping.email,
          phoneNumber: contactShipping.phone_number,
          mobileNumber: contactShipping.mobile_number,
          positionTitle: contactShipping.position_title,
          contactType: ContactTypeEnums.SHIPPING,
          table: "Orders"
        });

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: `Set Orders #${orderNumber} Shipping Contact`,
          activityType: `Set`,
          documentID: orderID,
          documentType: "Orders",
          userOwner: fullname || "Undefined User"
        });

        // toast.success(`Orders #${orderNumber} Shipping Contact successfully created`);
        console.log(`Orders #${orderNumber} Shipping Contact successfully created`);

      } catch (error) {
        console.error("Failed to create contact:", error);
      }

      return Promise.resolve();
    }
  }

  const handleAddressChange = async (orderID: number, orderNumber: string) => {
    try {
      if (!addressBilling) {
        toast.error("No address billing found");
        console.error("No address billing found");
        return Promise.resolve();
      }

      await createAddress({
        fk_id: orderID,
        address1: addressBilling.address1,
        address2: addressBilling.address2 || "",
        city: addressBilling.city,
        state: addressBilling.state,
        zip: addressBilling.zip,
        country: addressBilling.country,
        address_type: AddressTypeEnums.BILLING,
        table: "Orders"
      });

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: orderStatus,
        tags: "",
        activity: `Set Orders #${orderNumber} Billing Address`,
        activityType: `Set`,
        documentID: orderID,
        documentType: "Orders",
        userOwner: fullname || "Undefined User"
      });

      // toast.success(`Orders #${orderNumber} Billing Address successfully created`);
      console.log(`Orders #${orderNumber} Billing Address successfully created`);

      if (!addressShipping) {
        toast.error("No address shipping found");
        console.error("No address shipping found");
        return Promise.resolve();
      }

      await createAddress({
        fk_id: orderID,
        address1: addressShipping.address1,
        address2: addressShipping.address2 || "",
        city: addressShipping.city,
        state: addressShipping.state,
        zip: addressShipping.zip,
        country: addressShipping.country,
        address_type: AddressTypeEnums.SHIPPING,
        table: "Orders"
      });

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: orderStatus,
        tags: "",
        activity: `Set Orders #${orderNumber} Shipping Address`,
        activityType: `Set`,
        documentID: orderID,
        documentType: "Orders",
        userOwner: fullname || "Undefined User"
      });

      // toast.success(`Orders #${orderNumber} Shipping Address successfully created`);
      console.log(`Orders #${orderNumber} Shipping Address successfully created`);

    } catch (error) {
      console.error("Failed to create address:", error);
    }

    return Promise.resolve();

  }

  const handleCreateOrder = async () => {
    if (!customerData || (currentCustomerID === -1 && customerID === -1)) {
      toast("Please select a customer before creating an order");
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      // Create the order with data from calculated totals
      const orderData: CreateOrderDto = {
        customerID: currentCustomerID,
        statusID: orderStatus,
        quotesID: quotesID,
        orderDate: today,
        deliveryDate: today, // Set an appropriate delivery date or make it configurable
        subtotal: calculateOrderTotals.subtotal,
        taxTotal: calculateOrderTotals.tax,
        currency: "USD", // Assuming USD as default currency
        notes: ordersNotes,
        terms: "",
        tags: "",
        userOwner: fullname,
      };

      const createdOrder = await createOrder(orderData);
      
      await handleContactChange(createdOrder.pk_order_id, createdOrder.order_number);
      await handleAddressChange(createdOrder.pk_order_id, createdOrder.order_number);

      if (orderItems.length > 0) {
        const createPromises = await Promise.all(orderItems.map(async (item) => {
          const createData = {
            orderID: createdOrder.pk_order_id,
            productID: item.productID,
            packagingID: item.packagingID > 0 ? item.packagingID : 1, // Default packaging ID
            trimID: item.trimID > 0 ? item.trimID : 1, // Default trim ID
            yarnID: item.yarnID > 0 ? item.yarnID : 1, // Default yarn ID
            itemName: item.itemName,
            itemDescription: item.itemDescription || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: taxRate, // Default tax rate of 8%
          };

          return createOrderItem(createData);
        }));

        const order_item_numbers = createPromises.map(data => data.item_number);
        const createActivity = `Create new ${order_item_numbers.join(", ")} Orders Items from Order #${createdOrder.order_number}`

        // toast.success(createActivity);
        console.log(createActivity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: createActivity,
          activityType: `Create`,
          documentID: createdOrder.pk_order_id,
          documentType: "Orders",
          userOwner: fullname,
        });

        const order_item_ids = createPromises.map(data => data.pk_order_item_id);

        // Process images sequentially instead of all at once
        let uploadedImages = [];

        // Sequential processing of each quote item's images
        for (let i = 0; i < orderItems.length; i++) {
          const data = orderItems[i]; 
          if (!data || !data.images || data.images.length === 0) continue;

          const order_item_id = Number(order_item_ids[i]);

          // Process each image sequentially for this order item
          for (let j = 0; j < data.images.length; j++) {
            const dataImage = data.images[j];

            const imageType = dataImage.typeImage === Type.LOGO ? Type.LOGO :
                (dataImage.typeImage === Type.ARTWORK ? Type.ARTWORK : Type.OTHER);

            try {
              // Check if dataImage is a File object or a URL
              const isFile = dataImage instanceof File;
              
              let uploadedImage;
              
              if (isFile) {
                // Use createImage for File objects
                const createImageParams = {
                  fkItemID: order_item_id,
                  fkItemType: FKItemType.ORDERS,
                  imageFile: dataImage,
                  description: dataImage.name || `Image ${j+1} for item #${order_item_id}`,
                  type: imageType
                }

                // Attempt to upload with retry logic
                uploadedImage = await uploadSingleImage(createImageParams, createImage);
              } else {
                // Use createImageFromUrl for non-File objects (URLs)
                const imageUrl = (dataImage as any).preview || (dataImage as any).url || (dataImage as any).image_url || '';
                const imageName = (dataImage as any).name || (dataImage as any).filename || `Image ${j+1} for item #${order_item_id}`;
                
                // Call createImageFromUrl directly since it's not a mutation hook
                uploadedImage = await createImageFromUrl({
                  url: imageUrl,
                  fkItemID: order_item_id,
                  fkItemType: FKItemType.ORDERS,
                  description: imageName,
                  type: imageType
                });
              }

              if (uploadedImage) {
                uploadedImages.push(uploadedImage);

                // @ts-ignore
                await createActivityHistory.mutateAsync({
                  customerID: currentCustomerID,
                  status: orderStatus,
                  tags: "",
                  activity: `Uploaded image "${(dataImage as any).name || `Image ${j+1} for item #${order_item_id}`}" for Order Item #${order_item_id}`,
                  activityType: "Upload",
                  documentID: createdOrder.pk_order_id,
                  documentType: "Orders",
                  userOwner: fullname,
                })
              }
            } catch (uploadError) {
              // Fault tolerance - continue with other images even if this one fails
              console.error(`Failed to process image ${j+1} for order item #${order_item_id}:`, uploadError);
              toast.error(`Failed to process image ${j+1} for order item #${order_item_id}`);
            }
          }
        }

        // toast.success(`Uploaded ${uploadedImages.length} images for Order #${createdOrder.order_number}`);

      }

      if (quotesNumber && quotesNumber.length > 0) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: `Quote #${quotesNumber} converted to Order #${createdOrder.order_number}`,
          activityType: `Convert`,
          documentID: quotesID,
          documentType: "Quotes",
          userOwner: fullname,
        });

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: `Order #${createdOrder.order_number} created from Quote #${quotesNumber}`,
          activityType: `Convert`,
          documentID: createdOrder.pk_order_id,
          documentType: "Orders",
          userOwner: fullname,
        });
      }

      let activityText = `Create new Order #${createdOrder.order_number}`;
  
      if (quotesNumber.length > 0) activityText = `${activityText} from Quote #${quotesNumber}`;
  
      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: orderStatus,
        tags: "",
        activity: activityText,
        activityType: `Create`,
        documentID: createdOrder.pk_order_id,
        documentType: "Orders",
        userOwner: fullname,
      });

      toast.success(activityText);
      console.log(activityText);

      // Reset modification flag and set creation flag
      setModifyFlag(false);
      
      // Redirect to order [id] page
      router.push(`/crm/orders/${createdOrder.pk_order_id}`);

      return createdOrder;

      } catch (error) {
        console.error("Error creating order:", error);
        toast.error(`Error creating Order got error ${error}`);
      } finally {
        setIsSubmitting(false);
      }
    };

  const convertImageGalleryToExtendedFile = (imageGallery: any[]): ExtendedFile[] => {
    if (!imageGallery || !Array.isArray(imageGallery)) return [];
  
    return imageGallery.map(image => ({
      // Required ExtendedFile properties
      preview: image.url || image.image_url || '',
      typeImage: image.type || 'OTHER',
      lastModified: Date.now(),
      name: image.filename || `image-${Date.now()}`,
      size: 0,
      type: 'image/jpeg',
      uid: `${Date.now()}-${Math.random()}`,
      status: 'done',
      percent: 100,
      ...image // Keep original properties too
    }));
  };  

  React.useEffect(() => {
    if (customerID) {
      setCurrentCustomerID(customerID);
    }
  }, [customerID]);

  React.useEffect(() => {
    if (dataContactBilling) {
      setContactBilling(dataContactBilling);
    } else {
      setContactBilling(dataContactPrimary || null);
    }

    if (dataContactShipping) {
      setContactShipping(dataContactShipping);
    } else {
      setContactShipping(dataContactPrimary || null);
    }
  }, [dataContactBilling, dataContactShipping, dataContactPrimary]);

  React.useEffect(() => {
    if (dataAddressBilling) {
      setAddressBilling(dataAddressBilling);
    }

    if (dataAddressShipping) {
      setAddressShipping(dataAddressShipping);
    }
  }, [dataAddressBilling, dataAddressShipping]);

  // Then use it in the useEffect:
  React.useEffect(() => {
    if (fetchedCustomer) {
      setCustomerData(mapToCustomerTypes(fetchedCustomer));

      if (fetchedCustomer.notes && !modifyNotes) {
        setOrdersNotes(`${fetchedCustomer.notes}` || "");
      }
    }
  }, [fetchedCustomer]);

  React.useEffect(() => {
    if (quoteItemsResponse && quoteItemsResponse.items) {
      const normalize_data = quoteItemsResponse.items.map((data, _) => {
        return {
          ordersItemsID: -1,
          quotesItemsID: data.pk_quote_item_id ?? -1,
          orderID: -1,
          categoryID: data.product_data?.fk_category_id ?? -1,
          categoryName:
              data.product_data?.product_category?.category_name ?? "",
          productID: data.product_data?.pk_product_id ?? -1,
          // itemNumber: data.item_number ?? "",
          itemNumber: "---",
          itemName: data.item_name ?? "",
          itemDescription: data.item_description ?? "",
          images: [] as ExtendedFile[],
          imagesLoaded: false,
          packagingID: data.packaging_data?.pk_packaging_id ?? -1,
          packagingName: data.packaging_data?.packaging ?? "",
          trimID: data.trims_data?.pk_trim_id ?? -1,
          trimName: data.trims_data?.trim ?? "",
          yarnID: data.yarn_data?.pk_yarn_id ?? -1,
          yarnName: data.yarn_data?.yarn_color ?? "",
          quantity: data.quantity ?? 0,
          unitPrice: parseFloat(`${data.unit_price}`) ?? 0,
          taxRate: 0.08,
          total: parseFloat(`${data.line_total}`) ?? 0,
          actionCreate: false,
          actionModify: false,
          actionEdited: false,
          errorState: [] as string[], // Explicitly type this as string[]
          modifyList: [] as string[], // Explicitly type this as string[]
        };
      });

      setOrderItems(normalize_data);
    } else if (quoteItemsResponse && quoteItemsResponse.items.length === 0) {
      setOrderItems([]);
    }
  }, [quoteItemsResponse]);

  React.useEffect(() => {
    if (orderItems && orderItems.length > 0 && currentImageFetchIndex < orderItems.length) {
      const currentItem = orderItems[currentImageFetchIndex];

      if (currentItem?.quotesItemsID && currentItem.quotesItemsID > 0) {
        setFKOrdersItemID(currentItem.quotesItemsID);
      }
    }
  }, [orderItems, currentImageFetchIndex]);

  React.useEffect(() => {
    // Only run if we have image data and a valid quote item ID
    if (dataQuotesItemsImage?.items && fkOrdersItemID > 0) {
      // Update the current item with the fetched images, with proper type conversion
      setOrderItems(prevItems =>
        prevItems.map(item =>
          item.quotesItemsID === fkOrdersItemID
            ? {
                ...item,
                images: convertImageGalleryToExtendedFile(dataQuotesItemsImage.items),
                imagesLoaded: true
              }: item
          )
      );

      // Move to the next item after a short delay to avoid race conditions
      setTimeout(() => {
        setCurrentImageFetchIndex(prevIndex => {
          // If we've processed all items, reset
          if (prevIndex + 1 >= orderItems.length) {
            return prevIndex; // Stay at last index
          }
          return prevIndex + 1;
        });
      }, 500);
    }
  }, [dataQuotesItemsImage, fkOrdersItemID]);

  React.useEffect(() => {
    if (orderItems && orderItems.length > 0) {
      const totalQuantity = orderItems.reduce(
        (sum, item) => sum + item.quantity, 0);
      const totalUnitPrice = orderItems.reduce(
        (sum, item) => sum + item.unitPrice, 0);
      const taxRate = 0.08;
      const totalSub = orderItems.reduce(
        (sum, item) => sum + item.total, 0);

      setOrdersSummary({
        addedTaxRate: taxRate,
        addedQuantity: totalQuantity,
        addedUnitPrice: totalUnitPrice,
        addedLineTotal: totalSub,
        paid: 0
      });
    }
  }, [orderItems]);

  React.useEffect(() => {
    if (customerData && customerData?.pk_customer_id) {
      setCurrentCustomerID(customerData?.pk_customer_id || -1);
    }
  }, [customerData]);

  return (
    <div className="flex flex-col p-4" style={{ rowGap: "10px" }}>
      <OrdersDetailsHeaders
        status={orderStatus}
        setStatus={setOrderStatus}
        add={true}
        modifyFlag={modifyFlag}
        setModifyFlag={setModifyFlag}
        handleUpdateClick={handleCreateOrder}
        isSaving={isSubmitting}
        disableSave={!currentCustomerID || currentCustomerID <= 0}
      />

      <InfoBox
        title={`Creating new order ${quotesNumber.length > 0 ? `from Quote #${quotesNumber}` : ''}`}
        subtitle="Select a customer and add items to your order. Once saved, the order will be available in the orders list."
      />

      <Customers
        data={customerData}
        setCustomerID={setCurrentCustomerID}
        setModifyFlag={setModifyFlag}
        customerLoading={customerLoading}
        contactBilling={contactBilling}
        setContactBilling={setContactBilling}
        contactShipping={contactShipping}
        setContactShipping={setContactShipping}
        addressBilling={addressBilling}
        setAddressBilling={setAddressBilling}
        addressShipping={addressShipping}
        setAddressShipping={setAddressShipping}
        documentNotes={ordersNotes}
        setDocumentNotes={setOrdersNotes}
        setModifyNotes={setModifyNotes}
      />

      <OrdersItemsTable2
        ordersItems={orderItems}
        setOrdersItems={setOrderItems}
        setModifyFlag={setModifyFlag}
        setDeletedOrdersItems={setDeleteItems}
      />

      <ItemsSummary
        addedQuantity={ordersSummary.addedQuantity}
        addedUnitPrice={ordersSummary.addedUnitPrice}
        addedTaxRate={ordersSummary.addedTaxRate}
        addedLineTotal={ordersSummary.addedLineTotal}
        paid={ordersSummary.paid}
      />
    </div>
  );
};

export default OrderAdd;
