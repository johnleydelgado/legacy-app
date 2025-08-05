"use client";

import * as React from "react";
import { useDeleteOrderItem, useOrderItemsByOrderId, useOrderTotals } from "@/hooks/useOrdersItems";
import { useUpdateOrder, useDeleteOrder } from "@/hooks/useOrders";
import { OrderResponse } from "@/services/orders/types";
import OrdersDetailsHeaders from "../sections/headers";
import { InfoBox } from "../../../../custom/info-box";
import moment from "moment";
import Customers from "../sections/customers";
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

// import Customers from "../sections/customers";
import {
  ContactsTypes,
  Customer as CustomerQuotesTypes,
} from "../../../../../services/quotes/types";
import { useCustomer } from "../../../../../hooks/useCustomers2";
import { TableOrdersItems } from "../types";
import { useQuoteItemsByQuoteId } from "../../../../../hooks/useQuoteItems";
import ItemsSummary, { OrdersSummaryTypes } from "../sections/items-summary";
import { toast } from "sonner";
import {
  useCreateOrderItem,
  useUpdateOrderItem,
} from "../../../../../hooks/useOrdersItems";
import { uploadQuoteItemLogoToS3 } from "../../../../../utils/quote-items-logo-upload";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../../../hooks/redux";
import { setActiveCustomerID } from "../../../../../features/customers/customersSlice";
import {
  setActiveOrdersID,
  setActiveOrdersNumber,
} from "../../../../../features/orders/ordersSlice";
import ActivityHistory from "../sections/activity-history";
import { useCreateActivityHistory } from "../../../../../hooks/useActivityHistory";
import usePrevious from "../../../../../hooks/usePrevious";
import OrdersItemsTable2 from "../sections/orders-items-table-2";
import { OrderItemsSkeleton } from "../sections/order-items-skeleton";
import { ExtendedFile } from "../sections/image-upload-dropzone";
import { set } from "date-fns";
import { useCreateImageGallery, useImageGalleryByItemEndpoint } from "@/hooks/useImageGallery";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { FKItemType, Type } from "@/services/image-gallery/types";
import { uploadSingleImage } from "../../quotes-details/helpers-functions/image-helpers";
import { infoBoxFormatDate } from "@/helpers/date-formatter";
import { useQuote } from "@/hooks/useQuotes";
import Link from "next/link";
import { Contact, ContactTypeEnums } from "@/services/contacts/types";
import { Address, AddressTypeEnums } from "@/services/addresses/types";
import { useContactByReference, useContactMutations } from "@/hooks/useContacts";
import { useAddressByForeignKey, useAddressMutations } from "@/hooks/useAddresses";

interface ComponentProps {
  orderData: OrderResponse;
  orderId: number;
}

const OrdersDetails = ({ orderData, orderId }: ComponentProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const taxRate = 0.08;

  const [orderStatus, setOrderStatus] = React.useState<number>(orderData.status.id || 4);
  const [modifyFlag, setModifyFlag] = React.useState(false);
  
  const [currentCustomerID, setCurrentCustomerID] = React.useState(-1);
  const [customerChange, setCustomerChange] = React.useState<boolean>(false);

  const [isSaving, setIsSaving] = React.useState(false);
  
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const [toggleRefetch, setToggleRefetch] = React.useState(false);

  const [statusChange, setStatusChange] = React.useState<boolean>(false);
  const [statusText, setStatusText] = React.useState<string>("");
  
  const [orderItems, setOrderItems] = React.useState<TableOrdersItems[]>([]); 
  const [deleteItems, setDeleteItems] = React.useState<number[]>([]);

  const [ordersSummary, setOrdersSummary] = React.useState<OrdersSummaryTypes>({
    addedQuantity: 0,
    addedUnitPrice: 0,
    addedTaxRate: taxRate,
    addedLineTotal: 0,
    paid: 0,
  });

  const [contactBilling, setContactBilling] = React.useState<Contact | null>(null);
  const [modifyContactBilling, setModifyContactBilling] = React.useState<boolean>(false);

  const [contactShipping, setContactShipping] = React.useState<Contact | null>(null);
  const [modifyContactShipping, setModifyContactShipping] = React.useState<boolean>(false);

  const [addressBilling, setAddressBilling] = React.useState<Address | null>(null);
  const [modifyAddressBilling, setModifyAddressBilling] = React.useState<boolean>(false);

  const [addressShipping, setAddressShipping] = React.useState<Address | null>(null);
  const [modifyAddressShipping, setModifyAddressShipping] = React.useState<boolean>(false); 
  
  const [orderNotes, setOrderNotes] = React.useState<string>("");
  const [modifyNotes, setModifyNotes] = React.useState<boolean>(false);

  const { fullname } = useSelector((state: RootState) => state.users);

  const [customerData, setCustomerData] =
    React.useState<CustomerQuotesTypes | null>(null);

  const [currentImageFetchIndex, setCurrentImageFetchIndex] = React.useState(0);
  const [fkOrdersItemID, setFKOrdersItemID] = React.useState(-1);

  // Add these constants at the top of the file
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const [retryCount, setRetryCount] = React.useState<Record<number, number>>({});

  const {
    customer: fetchedCustomer,
    loading: customerLoading,
    error: customerError,
    refetch: refetchCustomer,
  } = useCustomer(currentCustomerID);

  const { 
    data: dataContactCustomerPrimary 
  } = useContactByReference(
    currentCustomerID, 
    "Customers", 
    ContactTypeEnums.PRIMARY
  );

  const {   
    data: dataContactCustomerBilling 
  } = useContactByReference(
    currentCustomerID, 
    "Customers", 
    ContactTypeEnums.BILLING
  );

  const { 
    data: dataContactCustomerShipping 
  } = useContactByReference(
    currentCustomerID, 
    "Customers", 
    ContactTypeEnums.SHIPPING
  );

  const {   
    data: dataContactOrdersBilling 
  } = useContactByReference(
    currentCustomerID, 
    "Orders", 
    ContactTypeEnums.BILLING
  );

  const {   
    data: dataContactOrdersShipping 
  } = useContactByReference(
    orderId, 
    "Orders", 
    ContactTypeEnums.SHIPPING
  );

  const { data: dataCustomerAddressBilling } = useAddressByForeignKey({
    fk_id: currentCustomerID,
    table: "Customers",
    address_type: AddressTypeEnums.BILLING
  });

  const { data: dataCustomerAddressShipping } = useAddressByForeignKey({
    fk_id: currentCustomerID,
    table: "Customers",
    address_type: AddressTypeEnums.SHIPPING
  });

  const { data: dataOrdersAddressBilling } = useAddressByForeignKey({
    fk_id: orderId,
    table: "Orders",
    address_type: AddressTypeEnums.BILLING
  });

  const { data: dataOrdersAddressShipping } = useAddressByForeignKey({
    fk_id: orderId,
    table: "Orders",
    address_type: AddressTypeEnums.SHIPPING
  });

  // API Hooks - Using the by-quote endpoint
  const {
    data: ordersItemsResponse,
    loading: isLoadingOrderItems,
    // error: itemsError,
    refetch: refetchOrdersItems,
    } = useOrderItemsByOrderId(orderId, 1, 10);
  
  const {
    data: orderTotals,
    loading: orderTotalsLoading,
    error: orderTotalsError,
    refetch: fetchOrderTotals,
  } = useOrderTotals(orderId);

  const mapToCustomerQuotesTypes = (customer: any): CustomerQuotesTypes => {
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
          ? (customer.primary_contact as ContactsTypes)
          : defaultContact,
      contacts: customer.contacts || [],
    } as CustomerQuotesTypes;
  };

  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();
  // Get the correct function names from the hooks
  const { updateOrderItem } = useUpdateOrderItem();
  const { createOrderItem } = useCreateOrderItem();
  const { deleteOrderItem } = useDeleteOrderItem();
  const createActivityHistory = useCreateActivityHistory();
  const { createImage } = useCreateImageGallery();

  const { createContact, updateContact } = useContactMutations();
  const { createAddress, updateAddress } = useAddressMutations();

  const {
    data: dataOrdersItemsImage,
    loading: isLoadingOrdersItemsImage,
    error: errorOrdersItemsImage,
    refetch: refetchOrdersItemsImage,
  } = useImageGalleryByItemEndpoint(fkOrdersItemID, 'ORDERS');

  const { 
    data: dataQuoteDetails, 
    isLoading: isLoadingQuoteDetails, 
    error: errorQuoteDetails, 
    refetch: refetchQuoteDetails 
  } = useQuote(orderData.serial_encoder.serial_quote_id);

  const createOrderItemsPipeline = async () => {
    try {
      const newOrderItems = orderItems.filter(data => data.ordersItemsID === -1 && data.actionCreate);

      if (newOrderItems.length > 0) {
        const createPromises = await Promise.all(newOrderItems.map(async (item) => {
          const createData = {
            orderID: orderData.pk_order_id,
            productID: item.productID,
            trimID: item.trimID > 0 ? item.trimID : 1,
            yarnID: item.yarnID > 0 ? item.yarnID : 1,
            packagingID: item.packagingID > 0 ? item.packagingID : 1,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: taxRate,
          }

          return createOrderItem(createData);
        }));

        const order_item_ids = createPromises.map(data => data.pk_order_item_id);
        const order_item_numbers = createPromises.map(data => data.item_number);
        const createActivity = `Create new ${order_item_numbers.join(", ")} Orders Items from Orders #${orderData.order_number}`

        // toast.success(createActivity);
        console.log(createActivity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: createActivity,
          activityType: `Create`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });

        let uploadedImages = [];

        for (let i = 0; i < newOrderItems.length; i++) {
          const data = newOrderItems[i];
          if (!data || !data.images || data.images.length === 0) continue;

          const order_item_id = Number(order_item_ids[i]);

          for (let j = 0; j < data.images.length; j++) {
            const dataImage = data.images[j];
            const imageType = dataImage.typeImage === Type.LOGO ? Type.LOGO :
                (dataImage.typeImage === Type.ARTWORK ? Type.ARTWORK : Type.OTHER);

            const createImageParams = {
              fkItemID: order_item_id,
              fkItemType: FKItemType.ORDERS,
              imageFile: dataImage,
              description: dataImage.name || `Image ${j+1} for item #${order_item_id}`,
              type: imageType
            }

            try {
              // Attempt to upload with retry logic
              const uploadedImage = await uploadSingleImage(createImageParams, createImage);

              if (uploadedImage) {
                uploadedImages.push(uploadedImage);

                // @ts-ignore
                await createActivityHistory.mutateAsync({
                  customerID: currentCustomerID,
                  status: orderStatus,
                  tags: "",
                  activity: `Uploaded image "${dataImage.name || createImageParams.description}" for Order Item #${order_item_id}`,
                  activityType: "Upload",
                  documentID: orderId,
                  documentType: "Orders",
                  userOwner: fullname || "Undefined User",
                });
              }
            } catch (uploadError) {
              console.error(`Failed to process image ${j+1} for order item #${order_item_id}:`, uploadError);
              toast.error(`Failed to process image ${j+1} for order item #${order_item_id}`);
            }
          }
        }
        
      }

      setOrderItems(prevState => prevState.map(data => {
        return { ...data, actionCreate: false };
      }));

      return Promise.resolve();

    } catch (error) {
      console.error("Failed to create order items:", error);
      toast.error("Failed to create order items");
    }
  }

  const updateOrderItemsPipeline = async () => {
    try {
      const updateOrderItems = orderItems.filter(data => data.ordersItemsID !== -1 && data.actionEdited);

      if (updateOrderItems.length > 0) {
        const updatePromises = await Promise.all(updateOrderItems.map(async (item) => {
          const updateData = {
            productID: item.productID,
            trimID: item.trimID > 0 ? item.trimID : undefined,
            yarnID: item.yarnID > 0 ? item.yarnID : undefined,
            packagingID: item.packagingID > 0 ? item.packagingID : undefined,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate,
          }

          return updateOrderItem(item.ordersItemsID, updateData);
        }));

        const allUpdateActivities = updateOrderItems.flatMap(item => {
          if (item.modifyList) {
            return item.modifyList.map((activity, _) =>
              `Update ${activity} for Order Item #${item.itemNumber}`
            );
          }
        });

        await Promise.all(allUpdateActivities.map(async (activity) => {
          if (activity) {
            // toast.success(activity);
            console.log(activity);
           
            // @ts-ignore
            await createActivityHistory.mutateAsync({
              customerID: currentCustomerID,
              status: orderStatus,
              tags: "",
              activity: activity,
              activityType: `Update`,
              documentID: orderId,
              documentType: "Orders",
              userOwner: fullname || "Undefined User",
            });
          }
        }));  

        const order_item_numbers = updatePromises.map(data => data.item_number);
        const updateActivity = `Update ${order_item_numbers.join(", ")} Orders Items from Orders #${orderData.order_number}`

        // toast.success(updateActivity);
        console.log(updateActivity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: updateActivity,
          activityType: `Update`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });

        setOrderItems(prevState => prevState.map(data => {
          return { ...data, actionEdited: false, modifyList: [] };
        }));

        return Promise.resolve();
      }

    } catch (error) {
      console.error("Failed to update order items:", error);
      toast.error("Failed to update order items");
    }
  }

  const deleteOrderItemsPipeline = async () => {
    try {
      if (deleteItems.length > 0) {
        await Promise.all(deleteItems.map(async (orderItemsID) => {
          return deleteOrderItem(orderItemsID);
        }));

        const deleteActivity = `Delete ${deleteItems.join(", ")} Orders Items from Orders #${orderData.order_number}`;

        // toast.success(deleteActivity);
        console.log(deleteActivity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: deleteActivity,
          activityType: `Delete`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });
      }

      return Promise.resolve();

    } catch (error) {
      console.error("Failed to delete order items:", error);
      toast.error("Failed to delete order items");
    }
  }

  const handleBillingChange = async () => {
    try {
      if (!modifyContactBilling && !modifyAddressBilling) return;

      let setContactResponse = null;
      let setAddressResponse = null;

      if (dataContactOrdersBilling && modifyContactBilling) {
        setContactResponse = await updateContact({
          id: dataContactOrdersBilling.pk_contact_id,
          data: {
            firstname: contactBilling?.first_name || "",
            lastname: contactBilling?.last_name || "",
            email: contactBilling?.email || "",
            phoneNumber: contactBilling?.phone_number || "",
            mobileNumber: contactBilling?.mobile_number || "",
            positionTitle: contactBilling?.position_title || "",
            contactType: "BILLING",
          }
        });
      } else if (!dataContactOrdersBilling && modifyContactBilling) {
        setContactResponse = await createContact({
          fk_id: orderId,
          firstname: contactBilling?.first_name || "",
          lastname: contactBilling?.last_name || "",
          email: contactBilling?.email || "",
          phoneNumber: contactBilling?.phone_number || "",
          mobileNumber: contactBilling?.mobile_number || "",
          positionTitle: contactBilling?.position_title || "",
          contactType: "BILLING",
          table: "Orders"
        });
      }

      if (setContactResponse) {
        const activity = `Set Orders #${orderData.order_number} billing contact to ${contactBilling?.first_name} ${contactBilling?.last_name}`;

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });
      } else {
        toast.error("Failed to update billing contact. Please try again.");
        console.error("Failed to update billing contact. Please try again.");
      }

      if (dataOrdersAddressBilling && modifyAddressBilling) {
        setAddressResponse = await updateAddress({
          id: dataOrdersAddressBilling.pk_address_id,
          data: {
            address1: addressShipping?.address1 || "",
            city: addressShipping?.city || "",  
            state: addressShipping?.state || "",
            zip: addressShipping?.zip || "",
            country: addressShipping?.country || "",
            address_type: "BILLING",
          }
        });
      } else if (!dataOrdersAddressBilling && modifyAddressBilling) {
        setAddressResponse = await createAddress({
          fk_id: orderId,
          address1: addressBilling?.address1 || "",
          city: addressBilling?.city || "",
          state: addressBilling?.state || "",
          zip: addressBilling?.zip || "",
          country: addressBilling?.country || "",
          address_type: "BILLING",
          table: "Orders"
        });
      }

      if (setAddressResponse) {
        const activity = `Set Orders #${orderData.order_number} billing address to ${addressBilling?.address1} ${addressBilling?.city} ${addressBilling?.state} ${addressBilling?.zip} ${addressBilling?.country}`;

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({ 
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });
      } else {
        toast.error("Failed to update billing address. Please try again.");
        console.error("Failed to update billing address. Please try again.");   
      }
    } catch (error) {
      console.error("Failed to update billing address:", error);
      toast.error("Failed to update billing address. Please try again.");
    }

    return Promise.resolve();
  }

  const handleShippingChange = async () => {
    try {
      if (!modifyContactShipping && !modifyAddressShipping) return;

      let setContactResponse = null;
      let setAddressResponse = null;

      if (dataContactOrdersShipping && modifyContactShipping) {
        setContactResponse = await updateContact({
          id: dataContactOrdersShipping.pk_contact_id,
          data: {
            firstname: contactShipping?.first_name || "",
            lastname: contactShipping?.last_name || "",
            email: contactShipping?.email || "",
            phoneNumber: contactShipping?.phone_number || "",
            mobileNumber: contactShipping?.mobile_number || "",
            positionTitle: contactShipping?.position_title || "",
            contactType: "SHIPPING",
          }
        });
      } else if (!dataContactOrdersShipping && modifyContactShipping) {
        setContactResponse = await createContact({
          fk_id: orderId,
          firstname: contactShipping?.first_name || "", 
          lastname: contactShipping?.last_name || "",
          email: contactShipping?.email || "",
          phoneNumber: contactShipping?.phone_number || "",
          mobileNumber: contactShipping?.mobile_number || "",
          positionTitle: contactShipping?.position_title || "",
          contactType: "SHIPPING",
          table: "Orders"
        });
      }

      if (setContactResponse) {
        const activity = `Set Orders #${orderData.order_number} shipping contact to ${contactShipping?.first_name} ${contactShipping?.last_name}`;

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });
      } else {
        toast.error("Failed to update shipping contact. Please try again.");
        console.error("Failed to update shipping contact. Please try again.");
      }

      if (dataOrdersAddressShipping && modifyAddressShipping) {
        setAddressResponse = await updateAddress({
          id: dataOrdersAddressShipping.pk_address_id,
          data: {
            address1: addressShipping?.address1 || "",
            city: addressShipping?.city || "",
            state: addressShipping?.state || "",
            zip: addressShipping?.zip || "",
            country: addressShipping?.country || "",
            address_type: "SHIPPING",
          }
        });
      } else if (!dataOrdersAddressShipping && modifyAddressShipping) {
        setAddressResponse = await createAddress({
          fk_id: orderId,
          address1: addressShipping?.address1 || "",
          city: addressShipping?.city || "",
          state: addressShipping?.state || "",
          zip: addressShipping?.zip || "",
          country: addressShipping?.country || "",
          address_type: "SHIPPING",
          table: "Orders"
        });
      }

      if (setAddressResponse) {
        const activity = `Set Orders #${orderData.order_number} shipping address to ${addressShipping?.address1} ${addressShipping?.city} ${addressShipping?.state} ${addressShipping?.zip} ${addressShipping?.country}`;

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });
      } else {
        toast.error("Failed to update shipping address. Please try again.");    
        console.error("Failed to update shipping address. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update shipping address:", error);
      toast.error("Failed to update shipping address. Please try again.");
    }

    return Promise.resolve();
  }

  const handleUpdateOrder = async () => {
    if (!modifyFlag) return;

    try {
      setIsSaving(true);

      await createOrderItemsPipeline();
      await updateOrderItemsPipeline();
      await deleteOrderItemsPipeline();

      await handleBillingChange();
      await handleShippingChange();

      const totalSub = orderItems.reduce((sum, item) => sum + item.total, 0);

      const updateData = {
        customerID: currentCustomerID,
        statusID: orderStatus,
        orderDate: orderData.order_date,
        deliveryDate: orderData.delivery_date || "",
        subtotal: totalSub,
        taxTotal: 0.08,
        currency: "USD",
        notes: orderNotes,
        terms: "",
        tags: "[]",
        userOwner: fullname || "Undefined User",
      }

      // @ts-ignore
      await updateOrderMutation.mutateAsync(
        {id: orderId, data: updateData}
      );

      if (statusChange) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: `Update Orders #${orderData.order_number} to ${statusText} status`,
          activityType: `Update`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });

        setStatusChange(false);
      }

      if (customerChange) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: orderStatus,
          tags: "",
          activity: `Update Orders #${orderData.order_number} customer to ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
          activityType: `Update`,
          documentID: orderId,
          documentType: "Orders",
          userOwner: fullname || "Undefined User",
        });

        setCustomerChange(false);
      }

      let activityText = `Order #${orderData.order_number} updated successfully`;
  
      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: orderStatus,
        tags: "",
        activity: activityText,
        activityType: `Update`,
        documentID: orderId,
        documentType: "Orders",
        userOwner: fullname,
      });

      toast.success(activityText);
      console.log(activityText);

      setToggleRefetch(prevState => !prevState);
      refetchOrdersItems();

    } catch (error) {
      console.error("Failed to update quotes:", error);
      toast.error("Failed to update quotes. Please try again.");
    } finally {
      setModifyFlag(false); // Reset modify flag since changes are saved
      setIsSaving(false); // Always reset saving state
    }
  }

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      await deleteOrderMutation.mutateAsync(orderId);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: orderStatus,
        tags: "",
        activity: `Delete Orders #${orderData.order_number} from customer ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
        activityType: `Delete`,
        documentID: orderId,
        documentType: "Orders",
      });

      toast.success(`Order # ${orderData.order_number} deleted successfully`);
      router.back();
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleConvertInvoice = async () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(orderData.customer_data.id));

    // @ts-ignore
    dispatch(setActiveOrdersID(orderId));

    // @ts-ignore
    dispatch(setActiveOrdersNumber(orderData.order_number));

    router.push("/crm/invoices/add");
  };

  const handleConvertPurchaseOrder = async () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(orderData.customer_data.id));

    // @ts-ignore
    dispatch(setActiveOrdersID(orderId));

    // @ts-ignore
    dispatch(setActiveOrdersNumber(orderData.order_number));

    router.push("/production/purchase-orders/add");
  }

  const handleConvertShipping = async () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(orderData.customer_data.id));

    // @ts-ignore
    dispatch(setActiveOrdersID(orderId));

    // @ts-ignore
    dispatch(setActiveOrdersNumber(orderData.order_number));

    router.push("/crm/shipping/add");
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

  const renderSerialInvoiceInfo = React.useCallback((serialInvoiceIds: number[]) => {
    if (orderData.serial_encoder.serial_invoice_ids && serialInvoiceIds.length > 0) {
      return (
        <div className="flex flex-row gap-x-2">
          <p className="text-sm text-blue-500">Invoices:</p>
          <div className="flex flex-col gap-y-0">
          {serialInvoiceIds.map((invoiceId) => (
            <Link href={`/crm/invoices/${invoiceId}`}>
              <p className="text-sm text-blue-500 hover:underline">{`Invoice #${invoiceId}`}</p>
            </Link>
          ))}
        </div>
        </div>
      );
    }
  }, [orderData.serial_encoder.serial_invoice_ids]);

  React.useEffect(() => {
    if (fetchedCustomer) {
      setCustomerData(mapToCustomerQuotesTypes(fetchedCustomer));

      if (fetchedCustomer.notes && !modifyNotes) {
        setOrderNotes(`${fetchedCustomer.notes} ${orderData.notes}` || "");
      }
    }
  }, [fetchedCustomer]);

  React.useEffect(() => {
    if (orderData) {
      setCurrentCustomerID(orderData?.customer_data?.id || -1);
      setOrderNotes(orderData?.notes || "");
    }
  }, [orderData]);

  React.useEffect(() => {  
    if (dataContactOrdersBilling && !modifyContactBilling) {
      setContactBilling(dataContactOrdersBilling);
      
    } else if (dataContactCustomerBilling && modifyContactBilling) {
      setContactBilling(dataContactCustomerBilling);

    } else {
      setContactBilling(dataContactCustomerPrimary || null);
    }

    if (dataContactOrdersShipping && !modifyContactShipping) {
      setContactShipping(dataContactOrdersShipping);

    } else if (dataContactCustomerShipping && modifyContactShipping) {
      setContactShipping(dataContactCustomerShipping);

    } else {
      setContactShipping(dataContactCustomerPrimary || null);
    }

  }, [
    dataContactCustomerPrimary,
    dataContactCustomerBilling,
    dataContactCustomerShipping,
    dataContactOrdersBilling,
    dataContactOrdersShipping,
    currentCustomerID
  ]);

  React.useEffect(() => {
    if (dataOrdersAddressBilling && !modifyAddressBilling) {
      setAddressBilling(dataOrdersAddressBilling);
    } else if (dataCustomerAddressBilling && modifyAddressBilling) {
      setAddressBilling(dataCustomerAddressBilling);
    }

    if (dataOrdersAddressShipping && !modifyAddressShipping) {
      setAddressShipping(dataOrdersAddressShipping);
    } else if (dataCustomerAddressShipping && modifyAddressShipping) {
      setAddressShipping(dataCustomerAddressShipping);
    }
  }, [
    dataCustomerAddressBilling, 
    dataOrdersAddressBilling, 
    dataCustomerAddressShipping,
    dataOrdersAddressShipping
  ]);

  React.useEffect(() => {
    if (ordersItemsResponse && ordersItemsResponse.items) {
      const normalizeData = ordersItemsResponse.items.map((data, _) => {
        return {
          ordersItemsID: data.pk_order_item_id,
          orderID: data.orders_data.id,
          productID: data.products_data.id,
          categoryID: data.products_category_data.id,
          categoryName: data.products_category_data.name,
          itemNumber: data.item_number || "",
          trimID: data.trim_data?.id ?? -1,
          trimName: data.trim_data?.trim ?? "",
          packagingID: data.packaging_data?.id ?? -1,
          packagingName: data.packaging_data?.packaging ?? "",
          yarnID: data.yarn_data?.id ?? -1,
          yarnName: data.yarn_data?.yarn_color ?? "",
          images: [] as ExtendedFile[],
          imagesLoaded: true,
          itemName: data.item_name ?? "",
          itemDescription: data.item_description ?? "",
          quantity: data.quantity ?? 0,
          unitPrice: parseFloat(`${data.unit_price}`) ?? 0,
          taxRate,
          total: parseFloat(`${data.line_total}`) ?? 0,
          actionCreate: false,
          actionModify: false,
          actionEdited: false,
          errorState: [] as string[],
          modifyList: [] as string[],
        };
      });

      setOrderItems(normalizeData);
      setCurrentImageFetchIndex(0);
    } else {
      setOrderItems([]);
    }
  }, [ordersItemsResponse]);

  React.useEffect(() => {
    if (orderItems && orderItems.length > 0 && currentImageFetchIndex < orderItems.length) {
      const currentItem = orderItems[currentImageFetchIndex];
      if (currentItem?.ordersItemsID && currentItem.ordersItemsID > 0) {
        setFKOrdersItemID(currentItem.ordersItemsID);
      }
    }
  }, [orderItems, currentImageFetchIndex]);

  React.useEffect(() => {
    // Check if we have a valid order item ID
    if (fkOrdersItemID > 0) {
      // Check if data exists but items array is empty
      if (dataOrdersItemsImage?.items?.length === 0) {
        // Get current retry count for this item
        const currentRetryCount = retryCount[fkOrdersItemID] || 0;
        
        if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
          // Increment retry count
          setRetryCount(prev => ({ 
            ...prev, 
            [fkOrdersItemID]: currentRetryCount + 1 
          }));
          
          // Retry after delay
          setTimeout(() => {
            console.warn(`Retrying image fetch for item ${fkOrdersItemID} due to empty items. Attempt ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
            refetchOrdersItemsImage();
          }, RETRY_DELAY);
          return;
        }
      }

      // Process successful fetch with non-empty items
      if (dataOrdersItemsImage?.items) {
        // Reset retry count for successful fetch
        setRetryCount(prev => ({ ...prev, [fkOrdersItemID]: 0 }));
      
        // Update the current item with the fetched images
        setOrderItems(prevItems =>
          prevItems.map(item =>
            item.ordersItemsID === fkOrdersItemID
              ? {
                ...item,
                images: convertImageGalleryToExtendedFile(dataOrdersItemsImage.items),
                imagesLoaded: true
              }
              : item
          )
        );

        // Move to the next item after a short delay
        setTimeout(() => {
          setCurrentImageFetchIndex(prevIndex => {
            if (prevIndex + 1 >= orderItems.length) {
              return prevIndex;
            }
            return prevIndex + 1;
          });
        }, 500);
      }
    }

    // Handle error case
    if (errorOrdersItemsImage && fkOrdersItemID > 0) {
      // Get current retry count for this item
      const currentRetryCount = retryCount[fkOrdersItemID] || 0;
      
      if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
        // Increment retry count
        setRetryCount(prev => ({ 
          ...prev, 
          [fkOrdersItemID]: currentRetryCount + 1 
        }));
        
        // Retry after delay
        setTimeout(() => {
          console.warn(`Retrying image fetch for item ${fkOrdersItemID}. Attempt ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
          refetchOrdersItemsImage();
        }, RETRY_DELAY);
      } else {
        // Max retries reached, move to next item
        console.error(`Failed to fetch images for item ${fkOrdersItemID} after ${MAX_RETRY_ATTEMPTS} attempts`);
        setOrderItems(prevItems =>
          prevItems.map(item =>
            item.ordersItemsID === fkOrdersItemID
              ? {
                ...item,
                imagesLoaded: true,
                images: []
              }
              : item
          )
        );
        
        // Move to next item
        setTimeout(() => {
          setCurrentImageFetchIndex(prevIndex => {
            if (prevIndex + 1 >= orderItems.length) {
              return prevIndex;
            }
            return prevIndex + 1;
          });
        }, 500);
      }
    }
  }, [dataOrdersItemsImage, errorOrdersItemsImage, fkOrdersItemID, refetchOrdersItemsImage]);

  React.useEffect(() => {
    if (orderItems && orderItems.length > 0) {
      orderItems
        .map((data) =>
          setOrdersSummary((prevState) => ({
            ...prevState,
            addedQuantity: prevState.addedQuantity + data.quantity,
            addedUnitPrice: prevState.addedUnitPrice + data.unitPrice,
            addedLineTotal:
              prevState.addedLineTotal + data.quantity * data.unitPrice,
          }))
        );
    }
  }, [orderItems]);

  if (!orderData) {
    return <div>Order not found</div>;
  }

  return (
    <div className="min-h-screen">
      <OrdersDetailsHeaders
        status={orderStatus}
        setStatus={setOrderStatus}
        modifyFlag={modifyFlag}
        setModifyFlag={setModifyFlag}
        handleDeleteOrder={() => setShowDeleteDialog(true)}
        handleUpdateClick={handleUpdateOrder}
        add={false}
        isSaving={isSaving}
        handleConvertInvoice={handleConvertInvoice}
        handleConvertPurchaseOrder={handleConvertPurchaseOrder}
        handleConvertShipping={handleConvertShipping}
        setStatusChange={setStatusChange}
        setStatusText={setStatusText}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete order
                #{orderData.order_number}
                and remove all associated order items from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrder}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Quote Info */}
      <InfoBox
        title={`Order #${orderData.order_number}`}
        subtitle={<div className="flex flex-col gap-0 pl-6">
          <div className="flex flex-row gap-x-2">
            <p className="text-sm text-blue-500">Created at {infoBoxFormatDate(orderData.created_at)}</p>
            <p className="text-sm text-blue-500">{`|`}</p>
            <p className="text-sm text-blue-500"> Created by {orderData.user_owner}</p>
          </div>
          <p className="text-sm text-blue-500 hidden">Updated At {infoBoxFormatDate(orderData.updated_at || "")}</p>
          {orderData.serial_encoder.serial_order_id && dataQuoteDetails && 
            <Link href={`/crm/quotes/${orderData.serial_encoder.serial_quote_id}`}>
              <p className="text-sm text-blue-500 hover:underline">{`Converted from Quote #${dataQuoteDetails.quote_number}`}</p>
            </Link>
          }
          {orderData.serial_encoder.serial_invoice_ids && 
            orderData
              .serial_encoder
              .serial_invoice_ids
              .filter((data) => data !== orderData.pk_order_id)
              .length > 0 && (
                <div className="flex flex-col gap-y-0">
                  <p className="text-sm text-blue-500">Converted to Invoices:</p>
                  {orderData.serial_encoder.serial_invoice_ids
                    .map((data, index) => (
                      <Link href={`/crm/invoices/${data}`} key={index}>
                        <p className="text-sm text-blue-500 ml-2 hover:underline">Invoice #{data}</p>
                      </Link>
                    ))}
                  </div>
                )
          }
          {orderData.serial_encoder.serial_purchase_order_ids && (
            <div className="flex flex-col gap-y-0">
              <p className="text-sm text-blue-500">Converted to Purchase Orders:</p>
              {orderData.serial_encoder.serial_purchase_order_ids.map((data, index) => (
                <Link href={`/production/purchase-orders/${data}`} key={index}>
                  <p className="text-sm text-blue-500 ml-2 hover:underline">Purchase Order #{data}</p>
                </Link>
              ))}
            </div>
          )}
        </div>}
      />

      <Customers
        data={customerData}
        setCustomerID={setCurrentCustomerID}
        setModifyFlag={setModifyFlag}
        customerLoading={customerLoading}
        setCustomerChange={(tick) => setCustomerChange(tick)}
        contactBilling={contactBilling}
        setContactBilling={setContactBilling}
        contactShipping={contactShipping}
        setContactShipping={setContactShipping}
        addressBilling={addressBilling}
        setAddressBilling={setAddressBilling}
        addressShipping={addressShipping}
        setAddressShipping={setAddressShipping}
        documentNotes={orderNotes}
        setDocumentNotes={setOrderNotes}
        setModifyNotes={setModifyNotes}
        setModifyContactBilling={setModifyContactBilling}
        setModifyContactShipping={setModifyContactShipping}
        setModifyAddressBilling={setModifyAddressBilling}
        setModifyAddressShipping={setModifyAddressShipping}
      />

      {isLoadingOrderItems ? 
         <OrderItemsSkeleton />
         : <OrdersItemsTable2
              ordersItems={orderItems}
              setOrdersItems={setOrderItems}
              setModifyFlag={setModifyFlag}
              setDeletedOrdersItems={setDeleteItems}
           />
      }

      <ItemsSummary
        // data={orderTotals || null}
        // refetch={fetchOrderTotals}
        addedQuantity={ordersSummary.addedQuantity}
        addedUnitPrice={ordersSummary.addedUnitPrice}
        addedTaxRate={ordersSummary.addedTaxRate}
        addedLineTotal={ordersSummary.addedLineTotal}
        paid={ordersSummary.paid}
      />

      <ActivityHistory documentID={orderId} toggleRefetch={toggleRefetch} />
    </div>
  );
};

export default OrdersDetails;
