"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Activity, Dot } from "lucide-react";
import { toast } from "sonner";

import QuotesDetailsHeaders from "./sections/headers";

import moment from "moment";
import Customers from "./sections/customers";

import {
  ContactsTypes,
  Customer as CustomerQuotesTypes,
  QuoteDetails as QuoteDetailsTypes,
  SerialEncoder,
} from "../../../../services/quotes/types";
import { useCustomer } from "@/hooks/useCustomers2";
import { useUpdateQuote, useDeleteQuote, useCreateQuote } from "../../../../hooks/useQuotes";
import QuoteItemsTable from "./sections/quotes-items-table";
import {
  useQuoteItemsByQuoteId,
  useUpdateQuoteItem,
  useCreateQuoteItem,
  useQuoteTotals, useDeleteQuoteItem,
} from "../../../../hooks/useQuoteItems";
import { TableQuotesItems } from "./types";
import QuoteItemsSkeleton from "./sections/quotes-items-skeleton";
import { InfoBox } from "@/components/custom/info-box";
import { useAppDispatch } from "../../../../hooks/redux";
import { setActiveCustomerID } from "../../../../features/customers/customersSlice";
import {setActiveQuotesID, setActiveQuotesNumber} from "../../../../features/quotes/quotesSlice";
import { uploadQuoteItemLogoToS3 } from "@/utils/quote-items-logo-upload";
import ItemsSummary, { QuotesSummaryTypes } from "./sections/items-summary";
import {
  AlertDialogHeader,
  AlertDialog,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "../../../ui/alert-dialog";
import ActivityHistory from "./sections/activity-history";
import {useCreateActivityHistory, useDocumentActivityHistory} from "../../../../hooks/useActivityHistory";
import usePrevious from "../../../../hooks/usePrevious";
import QuotesItems, {QuoteItemsType} from "./sections/quotes-items-2";
import {useCreateImageGallery, useCreateImageGalleryFromUrl, useImageGalleryByItemEndpoint} from "../../../../hooks/useImageGallery";
import {ExtendedFile} from "./sections/image-upload-dropzone";
import {FKItemType, Type} from "../../../../services/image-gallery/types";
import {uploadSingleImage} from "./helpers-functions/image-helpers";

import {infoBoxFormatDate, updateDataFormatDate} from "../../../../helpers/date-formatter";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { useOrder } from "@/hooks/useOrders";
import { Contact, ContactTypeEnums } from "@/services/contacts/types";
import { Address, AddressTypeEnums } from "@/services/addresses/types";
import { useContactByReference, useContactMutations } from "@/hooks/useContacts";
import { useAddressByForeignKey, useAddressMutations } from "@/hooks/useAddresses";

interface QuoteDetailsProps {
  quote: QuoteDetailsTypes;
}

const QuoteDetails: React.FC<QuoteDetailsProps> = ({ quote }) => {
  const taxRate = 0.08;

  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [modifyStatus, setModifyStatus] = React.useState(false);

  const [quoteStatus, setQuoteStatus] = React.useState<number>(
    quote?.status?.id || 1
  );
  const [statusChange, setStatusChange] = React.useState<boolean>(false);
  const [statusText, setStatusText] = React.useState<string>("");

  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(-1);
  const [customerChange, setCustomerChange] = React.useState<boolean>(false);

  const [isSaving, setIsSaving] = React.useState(false);

  const [customerData, setCustomerData] =
    React.useState<CustomerQuotesTypes | null>(null);

  const [quotesItems, setQuotesItems] = React.useState<QuoteItemsType[]>([]);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [toggleRefetch, setToggleRefetch] = React.useState(false);

  const [fkQuotesItemID, setFKQuotesItemID] = React.useState<number>(-1);
  const [currentImageFetchIndex, setCurrentImageFetchIndex] = React.useState<number>(0);
  const [deletedQuotesItems, setDeletedQuotesItems] = React.useState<number[]>([]);

  const [currentPage, setCurrentPage] = React.useState(1);

  const [quotesSummary, setQuotesSummary] = React.useState<QuotesSummaryTypes>({
    addedQuantity: 0,
    addedUnitPrice: 0,
    addedTaxRate: taxRate,
    addedLineTotal: 0,
    paid: 0,
  });

  const [confirmDuplicateQuote, setConfirmDuplicateQuote] = React.useState(false);

  const [contactBilling, setContactBilling] = React.useState<Contact | null>(null);
  const [modifyContactBilling, setModifyContactBilling] = React.useState<boolean>(false);

  const [contactShipping, setContactShipping] = React.useState<Contact | null>(null);
  const [modifyContactShipping, setModifyContactShipping] = React.useState<boolean>(false);

  const [addressBilling, setAddressBilling] = React.useState<Address | null>(null);
  const [modifyAddressBilling, setModifyAddressBilling] = React.useState<boolean>(false);

  const [addressShipping, setAddressShipping] = React.useState<Address | null>(null);
  const [modifyAddressShipping, setModifyAddressShipping] = React.useState<boolean>(false);

  const [quotesNotes, setQuotesNotes] = React.useState("");
  const [modifyNotes, setModifyNotes] = React.useState<boolean>(false);

  const [retryCount, setRetryCount] = React.useState<Record<number, number>>({});
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const { fullname } = useSelector((state: RootState) => state.users);

    // Use the useCustomer hook to fetch customer data
  const {
    customer: fetchedCustomer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(currentCustomerID > 0 ? currentCustomerID : null);

  const { 
    data: dataContactCustomerPrimary 
  } = useContactByReference(currentCustomerID, "Customers", ContactTypeEnums.PRIMARY);

  const {   
    data: dataContactCustomerBilling 
  } = useContactByReference(currentCustomerID, "Customers", ContactTypeEnums.BILLING);

  const { 
    data: dataContactCustomerShipping 
  } = useContactByReference(currentCustomerID, "Customers", ContactTypeEnums.SHIPPING);

  const {   
    data: dataContactQuotesBilling 
  } = useContactByReference(quote.pk_quote_id, "Quotes", ContactTypeEnums.BILLING);

  const { 
    data: dataContactQuotesShipping 
  } = useContactByReference(quote.pk_quote_id, "Quotes", ContactTypeEnums.SHIPPING);

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

  const { data: dataQuotesAddressBilling } = useAddressByForeignKey({
    fk_id: quote.pk_quote_id,
    table: "Quotes",
    address_type: AddressTypeEnums.BILLING
  });

  const { data: dataQuotesAddressShipping } = useAddressByForeignKey({
    fk_id: quote.pk_quote_id,
    table: "Quotes",
    address_type: AddressTypeEnums.SHIPPING
  });

  const {
    data: quoteItemsResponse,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchQuotesItemsList,
  } = useQuoteItemsByQuoteId(quote.pk_quote_id, {
    page: currentPage,
    limit: 10
  });

  const {
    data: dataOrderDetails,
    isLoading: isLoadingOrderDetails,
    error: errorOrderDetails,
    refetch: refetchOrderDetails,
  } = useOrder(quote?.serial_encoder?.serial_order_id || -1)

  const {
    data: dataQuotesItemsImage,
    loading: isLoadingQuotesItemsImage,
    error: errorQuotesItemsImage,
    refetch: refetchQuotesItemsImage,
  } = useImageGalleryByItemEndpoint(fkQuotesItemID, 'QUOTES');

  const {
    data: dataQuotesSummary,
    isLoading: isLoadingQuotesSummary,
    error: errorQuotesSummary,
    refetch: refetchQuotesSummary,
  } = useQuoteTotals(quote.pk_quote_id);

  const createActivityHistory = useCreateActivityHistory();

  // Initialize mutations
  const createQuoteMutation = useCreateQuote();
  const updateQuoteMutation = useUpdateQuote();
  const { createContact, updateContact } = useContactMutations();
  const { createAddress, updateAddress } = useAddressMutations();
  const updateQuoteItemMutation = useUpdateQuoteItem();
  const createQuoteItemMutation = useCreateQuoteItem();
  const deleteQuoteItemMutation = useDeleteQuoteItem();
  const { createImage } = useCreateImageGallery();
  const { createImageFromUrl } = useCreateImageGalleryFromUrl();
  const deleteQuoteMutation = useDeleteQuote();

  const createQuotesItemsPipeline = async () => {
    const newQuotesItems = quotesItems.filter(data => data.quotesItemsID === -1 && data.actionCreate);

    if (newQuotesItems.length > 0) {
      const createPromises = await Promise.all(newQuotesItems.map(async (item) => {
        const createData = {
          fkQuoteID: quote.pk_quote_id,
          fkProductID: item.productID,
          fkTrimID: item.trimID,
          fkYarnID: item.yarnID,
          fkPackagingID: item.packagingID,
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: 0.08,
        }

        return createQuoteItemMutation.mutateAsync(createData);
      }));

      const quotes_item_ids = createPromises.map(data => data.pk_quote_item_id);
      const quotes_item_numbers = createPromises.map(data => data.item_number);
      const createActivity = `Create new ${quotes_item_numbers.join(", ")} Quotes Items from Quotes #${quote.quote_number}`

      // toast.success(createActivity);
      console.log(createActivity);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: createActivity,
        activityType: `Create`,
        documentID: quote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      let uploadedImages = [];

      for (let i = 0; i < newQuotesItems.length; i++) {
        const data = newQuotesItems[i];
        if (!data || !data.images || data.images.length === 0) continue;

        const quote_item_id = Number(quotes_item_ids[i]);

        for (let j = 0; j < data.images.length; j++) {
          const dataImage = data.images[j];
          const imageType = dataImage.typeImage === Type.LOGO ? Type.LOGO :
              (dataImage.typeImage === Type.ARTWORK ? Type.ARTWORK : Type.OTHER);

          const createImageParams = {
            fkItemID: quote_item_id,
            fkItemType: FKItemType.QUOTES,
            imageFile: dataImage,
            description: dataImage.name || `Image ${j+1} for item #${quote_item_id}`,
            type: imageType
          };

          try {
            // Attempt to upload with retry logic
            const uploadedImage = await uploadSingleImage(createImageParams, createImage);

            if (uploadedImage) {
              uploadedImages.push(uploadedImage);

              // @ts-ignore
              await createActivityHistory.mutateAsync({
                customerID: currentCustomerID,
                status: quoteStatus,
                tags: "",
                activity: `Uploaded image "${dataImage.name || createImageParams.description}" for Quote Item #${quote_item_id}`,
                activityType: "Upload",
                documentID: quote.pk_quote_id,
                documentType: "Quotes",
                userOwner: fullname || "Undefined User"
              });
            }
          } catch (uploadError) {
            // Fault tolerance - continue with other images even if this one fails
            console.error(`Failed to process image ${j+1} for quote item #${quote_item_id}:`, uploadError);
            toast.error(`Failed to process image ${j+1} for quote item #${quote_item_id}`);
          }
        }
      }
    }

    setQuotesItems(prevState => prevState.map(data => {
      return { ...data, actionCreate: false };
    }));

    return Promise.resolve();
  };

  const updateQuotesItemsPipeline = async () => {
    const modifyQuotesItems = quotesItems.filter(data => data.quotesItemsID !== -1 && data.actionEdited);

    if (modifyQuotesItems.length > 0) {
      const updatePromises = await Promise.all(modifyQuotesItems.map(async (item) => {
        const updateData = {
          fkProductID: item.productID,
          fkTrimID: item.trimID,
          fkYarnID: item.yarnID,
          fkPackagingID: item.packagingID,
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: 0.08,
        }

        return updateQuoteItemMutation.mutateAsync({
          id: item.quotesItemsID,
          item: updateData
        });
      }));

      const allUpdateActivities = modifyQuotesItems.flatMap(quotesItem => {
        if (quotesItem.modifyList)
          return quotesItem.modifyList.map((activity, _) =>
              `Update ${activity} for Quotes Item ${quotesItem.itemNumber}`);

        return null;
      });

      await Promise.all(allUpdateActivities.map(async (activity) => {
        if (activity) {
          // toast.success(activity);
          console.log(activity);

          // @ts-ignore
          await createActivityHistory.mutateAsync({
            customerID: currentCustomerID,
            status: quoteStatus,
            tags: "",
            activity: activity,
            activityType: `Update`,
            documentID: quote.pk_quote_id,
            documentType: "Quotes",
            userOwner: fullname || "Undefined User"
          });
        }
      }));

      // const quotes_item_ids = updatePromises.map(data => data.pk_quote_item_id);
      const quotes_item_numbers = modifyQuotesItems.map(data => data.itemNumber);
      const updateActivity = `Update ${quotes_item_numbers.join(", ")} Quotes Items from Quotes #${quote.quote_number}`

      // toast.success(updateActivity);
      console.log(updateActivity);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: updateActivity,
        activityType: `Update`,
        documentID: quote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      setQuotesItems(prevState => prevState.map(data => {
        return { ...data, actionEdited: false, modifyList: [] };
      }));

      // let uploadedImages = [];
      //
      // for (let i = 0; i < modifyQuotesItems.length; i++) {
      //   const data = modifyQuotesItems[i];
      //   if (!data || !data.images || data.images.length === 0) continue;
      //
      //   const quote_item_id = Number(quotes_item_ids[i]);
      //
      //   for (let j = 0; j < data.images.length; j++) {
      //     const dataImage = data.images[j];
      //     const imageType = dataImage.typeImage === Type.LOGO ? Type.LOGO :
      //         (dataImage.typeImage === Type.ARTWORK ? Type.ARTWORK : Type.OTHER);
      //
      //     const createImageParams = {
      //       fkItemID: quote_item_id,
      //       fkItemType: FKItemType.QUOTES,
      //       imageFile: dataImage,
      //       description: dataImage.name || `Image ${j+1} for item #${quote_item_id}`,
      //       type: imageType
      //     };
      //
      //     try {
      //       // Attempt to upload with retry logic
      //       const uploadedImage = await uploadSingleImage(createImageParams, createImage);
      //
      //       if (uploadedImage) {
      //         uploadedImages.push(uploadedImage);
      //
      //         // @ts-ignore
      //         await createActivityHistory.mutateAsync({
      //           customerID: currentCustomerID,
      //           status: quoteStatus,
      //           tags: "",
      //           activity: `Uploaded image "${dataImage.name || createImageParams.description}" for Quote Item #${quote_item_id}`,
      //           activityType: "Upload",
      //           documentID: quote.pk_quote_id,
      //           documentType: "Quotes",
      //         });
      //       }
      //     } catch (uploadError) {
      //       // Fault tolerance - continue with other images even if this one fails
      //       console.error(`Failed to process image ${j+1} for quote item #${quote_item_id}:`, uploadError);
      //       toast.error(`Failed to process image ${j+1} for quote item #${quote_item_id}`);
      //     }
      //   }
      // }
    }

    return Promise.resolve();
  };

  const deleteQuotesItemsPipeline = async () => {
    if (deletedQuotesItems.length > 0) {
      await Promise.all(deletedQuotesItems.map(async (quotesItemID) =>
          deleteQuoteItemMutation.mutateAsync(quotesItemID)));

      const deleteActivity = `Deleted Quotes Items IDs ${deletedQuotesItems.join(", ")} from Quotes #${quote.quote_number}`

      // toast.success(deleteActivity);
      console.log(deleteActivity);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: deleteActivity,
        activityType: `Delete`,
        documentID: quote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });
    }
    return Promise.resolve();
  }

  const handleBillingChange = async () => {
    try {
      if (!modifyContactBilling && !modifyAddressBilling) return;

      let setContactResponse = null;
      let setAddressResponse = null;

      if (dataContactQuotesBilling && modifyContactBilling) {
        setContactResponse = await updateContact({
          id: dataContactQuotesBilling.pk_contact_id, 
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

      } else if (!dataContactQuotesBilling && modifyContactBilling) {
        setContactResponse = await createContact({
          fk_id: quote.pk_quote_id,
          firstname: contactBilling?.first_name || "",
          lastname: contactBilling?.last_name || "",
          email: contactBilling?.email || "",
          phoneNumber: contactBilling?.phone_number || "",
          mobileNumber: contactBilling?.mobile_number || "",
          positionTitle: contactBilling?.position_title || "",
          contactType: "BILLING",
          table: "Quotes"
        });
      }

      if (setContactResponse) {
        const activity = `Set Quotes #${quote.quote_number} billing contact to ${contactBilling?.first_name} ${contactBilling?.last_name}`

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: quote.pk_quote_id,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });
      } else {
        toast.error("Failed to update billing contact. Please try again.");
        console.error("Failed to update billing contact. Please try again.");
      }

      if (dataQuotesAddressBilling && modifyAddressBilling) {
        setAddressResponse = await updateAddress({
          id: dataQuotesAddressBilling.pk_address_id,
          data: {
            address1: addressBilling?.address1 || "",
            city: addressBilling?.city || "",
            state: addressBilling?.state || "",
            zip: addressBilling?.zip || "",
            country: addressBilling?.country || "",
            address_type: "BILLING",
          }
        });
      } else if (!dataQuotesAddressBilling && modifyAddressBilling) {
        setAddressResponse = await createAddress({
          fk_id: quote.pk_quote_id,
          address1: addressBilling?.address1 || "",
          city: addressBilling?.city || "",
          state: addressBilling?.state || "",
          zip: addressBilling?.zip || "",
          country: addressBilling?.country || "",
          address_type: "BILLING",
          table: "Quotes"
        });
      }

      if (setAddressResponse) {
        const activity = `Set Quotes #${quote.quote_number} billing address to ${addressBilling?.address1} ${addressBilling?.city} ${addressBilling?.state} ${addressBilling?.zip} ${addressBilling?.country}`

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: quote.pk_quote_id,
          documentType: "Quotes", 
          userOwner: fullname || "Undefined User"
        });
      } else {
        toast.error("Failed to update billing address. Please try again.");
        console.error("Failed to update billing address. Please try again.");
      }

    } catch (error) {
      console.error("Failed to update quotes billing data:", error);
      toast.error("Failed to update quotes billing data. Please try again.");
    } 

    return Promise.resolve();
  }

  const handleShippingChange = async () => {
    try {
      if (!modifyContactShipping && !modifyAddressShipping) return;

      let setContactResponse = null;
      let setAddressResponse = null;

      if (dataContactQuotesShipping) {
        setContactResponse = await updateContact({
          id: dataContactQuotesShipping.pk_contact_id, 
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

      } else {
        setContactResponse = await createContact({
          fk_id: quote.pk_quote_id,
          firstname: contactShipping?.first_name || "",
          lastname: contactShipping?.last_name || "",
          email: contactShipping?.email || "",
          phoneNumber: contactShipping?.phone_number || "",
          mobileNumber: contactShipping?.mobile_number || "",
          positionTitle: contactShipping?.position_title || "",
          contactType: contactShipping?.contact_type || "",
          table: "Quotes"
        });
      }

      if (setContactResponse) {
        const activity = `Set Quotes #${quote.quote_number} billing contact to ${contactBilling?.first_name} ${contactBilling?.last_name}`

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: quote.pk_quote_id,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });
      } else {
        toast.error("Failed to update billing contact. Please try again.");
        console.error("Failed to update billing contact. Please try again.");
      }

      if (dataQuotesAddressShipping) {
        setAddressResponse = await updateAddress({
          id: dataQuotesAddressShipping.pk_address_id,
          data: {
            address1: addressShipping?.address1 || "",
            city: addressShipping?.city || "",
            state: addressShipping?.state || "",
            zip: addressShipping?.zip || "",
            country: addressShipping?.country || "",
            address_type: "SHIPPING",
          }
        }); 
      } else {
        setAddressResponse = await createAddress({
          fk_id: quote.pk_quote_id,
          address1: addressShipping?.address1 || "",
          city: addressShipping?.city || "",
          state: addressShipping?.state || "",
          zip: addressShipping?.zip || "",
          country: addressShipping?.country || "",
          address_type: "SHIPPING",
          table: "Quotes"
        });
      }

      if (setAddressResponse) {
        const activity = `Set Quotes #${quote.quote_number} shipping address to ${addressShipping?.address1} ${addressShipping?.city} ${addressShipping?.state} ${addressShipping?.zip} ${addressShipping?.country}`

        // toast.success(activity);
        console.log(activity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,  
          tags: "",
          activity: activity,
          activityType: `Set`,
          documentID: quote.pk_quote_id,
          documentType: "Quotes", 
          userOwner: fullname || "Undefined User" 
        });

      } else {
        toast.error("Failed to update shipping address. Please try again.");
        console.error("Failed to update shipping address. Please try again.");
      }

    } catch (error) {
      console.error("Failed to update quotes billing data:", error);
      toast.error("Failed to update quotes billing data. Please try again.");
    } 

    return Promise.resolve();
  }

  const handleUpdateClick = async () => {
    if (!modifyStatus) return;

    try {
      setIsSaving(true);

      await createQuotesItemsPipeline();
      await updateQuotesItemsPipeline();
      await deleteQuotesItemsPipeline();

      await handleBillingChange();
      await handleShippingChange();

      const totalSub = quotesItems.reduce((sum, item) => sum + item.total, 0);

      const updateData = {
        customerID: currentCustomerID,
        quoteDate: quote.quote_date,
        expirationDate: quote.expiration_date,
        statusID: quoteStatus,
        subtotal: totalSub,
        taxTotal: 0.08,
        currency: "USD",
        notes: quotesNotes,
        terms: "",
        tags: "[]"
      }

      // @ts-ignore
      await updateQuoteMutation.mutateAsync(
          {id: quote.pk_quote_id, quote: updateData});

      if (statusChange) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: `Update Quotes #${quote.quote_number} to ${statusText} status`,
          activityType: `Update`,
          documentID: quote.pk_quote_id,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });

        setStatusChange(false);
      }

      if (customerChange) {
        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: `Update Quotes #${quote.quote_number} customer to ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
          activityType: `Update`,
          documentID: quote.pk_quote_id,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });
        setCustomerChange(false);
      }

      setToggleRefetch(prevState => !prevState);
      refetchQuotesItemsImage();

      toast.success(`Quote #${quote.quote_number} updated successfully`);
      console.log(`Quote #${quote.quote_number} updated successfully`);

    } catch (error) {
      console.error("Failed to update quotes:", error);
      toast.error("Failed to update quotes. Please try again.");
    } finally {
      setModifyStatus(false); // Reset modify flag since changes are saved
      setIsSaving(false); // Always reset saving state
    }
  }

  const handleDuplicateQuote = async () => {
    try {
      const quoteData = {
        customerID: currentCustomerID,
        quoteDate: new Date().toISOString().split("T")[0],
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        statusID: 1,
        subtotal: quotesSummary.addedLineTotal,
        taxTotal: 0.08 * quotesSummary.addedLineTotal,
        currency: "USD",
        notes: "",
        terms: "",
        tags: "",
        userOwner: fullname || "Undefined User"
      };

      // @ts-ignore
      const createdQuote = await createQuoteMutation.mutateAsync(quoteData);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: `Duplicating Quote #${quote.quote_number} to new Quote #${createdQuote.quote_number}`,
        activityType: `Duplicate`,
        documentID: quote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: `Duplicate new Quotes # ${createdQuote.quote_number} from Quote #${quote.quote_number}`,
        activityType: `Duplicate`,
        documentID: createdQuote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      toast.success(`Duplicating Quote #${quote.quote_number} to new Quote #${createdQuote.quote_number} successfully created`);
      console.log(`Duplicating Quote #${quote.quote_number} to new Quote #${createdQuote.quote_number} successfully created`);

      if (quotesItems.length > 0) {
        // Step 3: Create new quote items using the created quote's ID
        const createPromises = await Promise.all(quotesItems.map(async (item) => {
          const createData = {
            fkQuoteID: createdQuote.pk_quote_id,
            fkProductID: item.productID,
            fkTrimID: item.trimID,
            fkYarnID: item.yarnID,
            fkPackagingID: item.packagingID ,
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: taxRate
          };

          return createQuoteItemMutation.mutateAsync(createData);
        }));

        const quotes_item_numbers = createPromises.map(data => data.item_number);

        const createActivity = `Create new ${quotes_item_numbers.join(", ")} Quotes Items from Quotes #${createdQuote.quote_number}`

        // toast.success(createActivity);
        console.log(createActivity);

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: createActivity,
          activityType: `Create`,
          documentID: createdQuote.pk_quote_id,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });

        const quotes_item_ids = createPromises.map(data => data.pk_quote_item_id);

        // Process images sequentially instead of all at once
        let uploadedImages = [];

        // Sequential processing of each quote item's images
        for (let i = 0; i < quotesItems.length; i++) {
          const data = quotesItems[i];
          if (!data || !data.images || data.images.length === 0) continue;

          const quote_item_id = Number(quotes_item_ids[i]);

          // Process each image sequentially for this quote item
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
                  fkItemID: quote_item_id,
                  fkItemType: FKItemType.QUOTES,
                  imageFile: dataImage,
                  description: dataImage.name || `Image ${j+1} for item #${quote_item_id}`,
                  type: imageType
                }

                // Attempt to upload with retry logic
                uploadedImage = await uploadSingleImage(createImageParams, createImage);
              } else {
                // Use createImageFromUrl for non-File objects (URLs)
                const imageUrl = (dataImage as any).preview || (dataImage as any).url || (dataImage as any).image_url || '';
                const imageName = (dataImage as any).name || (dataImage as any).filename || `Image ${j+1} for item #${quote_item_id}`;
                
                // Call createImageFromUrl directly since it's not a mutation hook
                uploadedImage = await createImageFromUrl({
                  url: imageUrl,
                  fkItemID: quote_item_id,
                  fkItemType: FKItemType.QUOTES,
                  description: imageName,
                  type: imageType
                });
              }

              if (uploadedImage) {
                uploadedImages.push(uploadedImage);

                // @ts-ignore
                await createActivityHistory.mutateAsync({
                  customerID: currentCustomerID,
                  status: quoteStatus,
                  tags: "",
                  activity: `Uploaded image "${(dataImage as any).name || `Image ${j+1} for item #${quote_item_id}`}" for Quote Item #${quote_item_id}`,
                  activityType: "Upload",
                  documentID: createdQuote.pk_quote_id,
                  documentType: "Quotes",
                  userOwner: fullname,
                })
              }

            } catch (error) {
              console.error(`Failed to process image ${j+1} for quote item #${quote_item_id}:`, error);
              toast.error(`Failed to process image ${j+1} for quote item #${quote_item_id}`);
            }
          }
        }

        console.log(`Upload process completed: ${uploadedImages.length} images successfully uploaded`);
        // toast.success(`Uploaded ${uploadedImages.length} images for Quote #${createdQuote.quote_number}`);

      } else {
        toast.success("Quote created successfully (no items to add)");
        console.log("Quote created successfully (no items to add)");
      }

      setModifyStatus(false);

      // Redirect to quotes list page after successful creation
      router.push(`/crm/quotes/${createdQuote.pk_quote_id}`);

      return createdQuote;
    } catch (error) {
      console.error("Failed to create quote and quote items:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToOrderClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(quote.customer.pk_customer_id));

    // @ts-ignore
    dispatch(setActiveQuotesID(quote.pk_quote_id));

    // @ts-ignore
    dispatch(setActiveQuotesNumber(quote.quote_number));

    router.push("/crm/orders/add");
  };

  const confirmDelete = async () => {
    if (!quote.pk_quote_id) return;

    try {
      setIsDeleting(true);
      await deleteQuoteMutation.mutateAsync(quote.pk_quote_id);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: `Delete Quotes #${quote.quote_number} from customer ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
        activityType: `Delete`,
        documentID: quote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      toast.success("Quote deleted successfully");
      // Navigate away after successful deletion
      router.back();
    } catch (error) {
      console.error("Failed to delete quote:", error);
      toast.error("Failed to delete quote");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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

  const renderSerialInvoiceInfo = React.useCallback((serialInvoiceIds: number[]) => {
    if (quote.serial_encoder.serial_invoice_ids && serialInvoiceIds.length > 0) {
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
  }, [quote.serial_encoder.serial_invoice_ids]);

  React.useEffect(() => {
    if (quote) {
      setQuotesNotes(quote.notes|| "");
    }

    if (quote && quote.customer) {
      setCurrentCustomerID(quote.customer.pk_customer_id);
    }
  }, [quote]);

  React.useEffect(() => {
    if (dataContactQuotesBilling && !modifyContactBilling) {
      setContactBilling(dataContactQuotesBilling);
    } else if (dataContactCustomerBilling && modifyContactBilling) {
      setContactBilling(dataContactCustomerBilling);
    } else {
      setContactBilling(dataContactCustomerPrimary || null);
    }

    if (dataContactQuotesShipping && !modifyContactShipping) {
      setContactShipping(dataContactQuotesShipping);
    } else if (dataContactCustomerShipping && modifyContactShipping) {
      setContactShipping(dataContactCustomerShipping);
    } else {
      setContactShipping(dataContactCustomerPrimary || null);
    }

  }, [
    dataContactCustomerPrimary,
    dataContactCustomerBilling,
    dataContactCustomerShipping,
    dataContactQuotesBilling,
    dataContactQuotesShipping,
    currentCustomerID
  ]);

  React.useEffect(() => {
    if (dataQuotesAddressBilling && !modifyAddressBilling) {
      setAddressBilling(dataQuotesAddressBilling);
    } else if (dataCustomerAddressBilling && modifyAddressBilling) {
      setAddressBilling(dataCustomerAddressBilling);
    }

    if (dataQuotesAddressShipping && !modifyAddressShipping) {
      setAddressShipping(dataQuotesAddressShipping);
    } else if (dataCustomerAddressShipping && modifyAddressShipping) {
      setAddressShipping(dataCustomerAddressShipping);
    }
  }, [
    dataCustomerAddressBilling, 
    dataQuotesAddressBilling, 
    dataCustomerAddressShipping,
    dataQuotesAddressShipping
  ]);

  React.useEffect(() => {
    if (
        quoteItemsResponse &&
        quoteItemsResponse.items &&
        quoteItemsResponse.items.length > 0
    ) {
      const normalizeData = quoteItemsResponse.items.map((data) => {
        return {
          quotesItemsID: data?.pk_quote_item_id || -1,
          categoryID: data?.product_data?.product_category?.pk_product_category_id || -1,
          categoryName: data?.product_data?.product_category?.category_name || "",
          productID: data?.product_data?.pk_product_id || -1,
          itemNumber: data?.item_number || "",
          itemName: data?.item_name || "",
          itemDescription: data?.item_description || "",
          images: [] as ExtendedFile[], // Explicitly type this as ExtendedFile[]
          imagesLoaded: false,
          packagingID: data?.packaging_data.pk_packaging_id || -1,
          packagingName: data?.packaging_data.packaging || "",
          trimID: data?.trims_data?.pk_trim_id || -1,
          trimName: data?.trims_data?.trim || "",
          yarnID: data?.yarn_data?.pk_yarn_id || -1,
          yarnName: `${data?.yarn_data?.color_code || ""} - ${data?.yarn_data?.yarn_color || ""}`,
          quantity: data?.quantity || 0,
          unitPrice: Number(data?.unit_price) || 0, // Ensure this is a number
          taxRate: Number(data?.tax_rate) || 0.08, // Ensure this is a number
          total: Number(data?.line_total) || 0, // Ensure this is a number
          actionCreate: false,
          actionModify: false,
          actionEdited: false,
          errorState: [] as string[], // Explicitly type this as string[]
          modifyList: [] as string[], // Explicitly type this as string[]
        };
      });

      setQuotesItems(normalizeData as QuoteItemsType[]); // Type assertion to ensure compatibility
    }
  }, [quoteItemsResponse]);

  React.useEffect(() => {
    if (quotesItems && quotesItems.length > 0 && currentImageFetchIndex < quotesItems.length) {
      const currentItem = quotesItems[currentImageFetchIndex];
      if (currentItem?.quotesItemsID && currentItem.quotesItemsID > 0) {
        setFKQuotesItemID(currentItem.quotesItemsID);
      }
    }
  }, [quotesItems, currentImageFetchIndex]);

  React.useEffect(() => {
    // Skip if no valid quote item ID
    if (fkQuotesItemID <= 0) return;

    // Check if we have data and it's not empty
    if (dataQuotesItemsImage?.items?.length) {
      // Reset retry count for this item when we get data
      setRetryCount(prev => ({ ...prev, [fkQuotesItemID]: 0 }));

      // Update the current item with the fetched images
      setQuotesItems(prevItems =>
        prevItems.map(item =>
          item.quotesItemsID === fkQuotesItemID
            ? {
                ...item,
                images: convertImageGalleryToExtendedFile(dataQuotesItemsImage.items),
                imagesLoaded: true
              }
            : item
        )
      );

      // Move to next item after successful fetch
      setTimeout(() => {
        setCurrentImageFetchIndex(prevIndex => {
          if (prevIndex + 1 >= quotesItems.length) {
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 500);
    } else {
      // Handle empty or missing data with retry logic
      const currentRetries = retryCount[fkQuotesItemID] || 0;
      
      if (currentRetries < MAX_RETRIES) {
        // Increment retry count for this item
        setRetryCount(prev => ({
          ...prev,
          [fkQuotesItemID]: currentRetries + 1
        }));

        // Retry after delay
        setTimeout(() => {
          // Trigger refetch - you'll need to implement this based on your data fetching method
          refetchQuotesItemsImage();
        }, RETRY_DELAY);
      } else {
        // Max retries reached, move to next item
        console.warn(`Failed to fetch images for quote item ${fkQuotesItemID} after ${MAX_RETRIES} retries`);
        setCurrentImageFetchIndex(prevIndex => {
          if (prevIndex + 1 >= quotesItems.length) {
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }
    }
  }, [dataQuotesItemsImage, fkQuotesItemID]);

  // Then use it in the useEffect:
  React.useEffect(() => {
    if (fetchedCustomer) {
      setCustomerData(mapToCustomerQuotesTypes(fetchedCustomer));

      if (fetchedCustomer.notes && !modifyNotes) {
        setQuotesNotes(`${fetchedCustomer.notes} ${quote.notes}` || "");
      }
    }
  }, [fetchedCustomer]);

  // Optional: Log customer loading state and errors for debugging
  React.useEffect(() => {
    if (customerError) {
      console.error("Customer fetch error:", customerError);
    }
  }, [customerError]);

  // Add effect to update status when quote changes
  React.useEffect(() => {
    if (quote?.status?.id) {
      setQuoteStatus(quote.status.id);
    }
  }, [quote]);

  React.useEffect(() => {
    if (quotesItems && quotesItems.length > 0) {
      quotesItems
        .filter((item) => !item.quotesItemsID || item.quotesItemsID <= 0)
        .map((data) =>
          setQuotesSummary((prevState) => ({
            ...prevState,
            addedQuantity: prevState.addedQuantity + data.quantity,
            addedUnitPrice: prevState.addedUnitPrice + data.unitPrice,
            addedLineTotal:
              prevState.addedLineTotal + ((data.quantity * data.quantity) * (1 + data.taxRate)),
          }))
        );
    }
  }, [quotesItems]);

  return (
    <div className="min-h-screen text-gray-900 space-y-4">
      {showDeleteConfirm && (
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quote</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete Quote {quote.quote_number}{" "}
                and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  // Prevent the default action to handle the delete ourselves
                  e.preventDefault();
                  confirmDelete().then();
                }}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        {}
                      </circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      >
                        {}
                      </path>
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  "Delete Quote"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <QuotesDetailsHeaders
        status={quoteStatus}
        add={false}
        setStatusChange={(tick) => setStatusChange(tick)}
        setStatus={setQuoteStatus}
        setStatusText={setStatusText}
        modifyFlag={modifyStatus}
        setModifyFlag={setModifyStatus}
        handleUpdateClick={handleUpdateClick}
        handleDeleteClick={() => setShowDeleteConfirm(true)}
        handleConvertToOrderClick={handleConvertToOrderClick}
        handleDuplicateQuote={() => setConfirmDuplicateQuote(true)}
        isSaving={isSaving}
        quoteId={quote.pk_quote_id}
        customerEmail={
          customerData?.contact_primary?.email ||
          quote.customer?.contact_primary?.email
        }
        customerName={`${
          customerData?.contact_primary?.first_name ||
          quote.customer?.contact_primary?.first_name ||
          ""
        } ${
          customerData?.contact_primary?.last_name ||
          quote.customer?.contact_primary?.last_name ||
          ""
        }`.trim()}
        customerId={
          customerData?.pk_customer_id || quote.customer?.pk_customer_id
        }
        serialEncoderData={quote.serial_encoder}
      />

      {/* Quote Info */}
      <InfoBox
        title={`Quote #${quote.quote_number}`}
        subtitle={
        <div className="flex flex-col gap-0 pl-6">
          <div className="flex flex-row gap-x-2">
            <p className="text-sm text-blue-500">Created at {infoBoxFormatDate(quote.created_at)}</p>
            <p className="text-sm text-blue-500">{`|`}</p>
            <p className="text-sm text-blue-500"> Created by {quote.user_owner}</p>
          </div>
          <p className="text-sm text-blue-500 hidden">Updated At {infoBoxFormatDate(quote.updated_at)}</p>
          {quote.serial_encoder.serial_order_id && dataOrderDetails && 
            <Link href={`/crm/orders/${quote.serial_encoder.serial_order_id}`}>
              <p className="text-sm text-blue-500 hover:underline">{`Converted to Order #${dataOrderDetails.order_number}`}</p>
            </Link>
          }
          {quote.serial_encoder.serial_invoice_ids && 
            quote
              .serial_encoder
              .serial_invoice_ids
              .filter((data) => data !== quote.pk_quote_id)
              .length > 0 && (
                <div className="flex flex-col gap-y-0">
                  <p className="text-sm text-blue-500">Converted to Invoices:</p>
                  {quote.serial_encoder.serial_invoice_ids
                    .map((data, index) => (
                      <Link href={`/crm/invoices/${data}`} key={index}>
                        <p className="text-sm text-blue-500 ml-2 hover:underline">Invoice #{data}</p>
                      </Link>
                    ))}
                  </div>
                )
          }
          {quote.serial_encoder.serial_purchase_order_ids && (
            <div className="flex flex-col gap-y-0">
              <p className="text-sm text-blue-500">Converted to Purchase Orders:</p>
              {quote.serial_encoder.serial_purchase_order_ids.map((data, index) => (
                <Link href={`/production/purchase-orders/${data}`} key={index}>
                  <p className="text-sm text-blue-500 ml-2 hover:underline">Purchase Order #{data}</p>
                </Link>
              ))}
            </div>
          )}
        </div>}
      />

      {/* Customer Information */}
      <Customers
        data={customerData}
        setCustomerID={setCurrentCustomerID}
        setModifyFlag={setModifyStatus}
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
        documentNotes={quotesNotes}
        setDocumentNotes={setQuotesNotes}
        setModifyNotes={setModifyNotes}
        setModifyContactBilling={setModifyContactBilling}
        setModifyContactShipping={setModifyContactShipping}
        setModifyAddressBilling={setModifyAddressBilling}
        setModifyAddressShipping={setModifyAddressShipping}
      />

      {/* Quote Items - Now with skeleton loading */}
      {itemsLoading ? (
        <QuoteItemsSkeleton />
      ) : (
        quotesItems && (
            <QuotesItems
                quotesItems={quotesItems}
                setQuotesItems={setQuotesItems}
                setModifyFlag={(tick) => setModifyStatus(tick)}
                setDeletedQuotesItems={setDeletedQuotesItems}
                totalItems={quoteItemsResponse?.meta?.totalItems || 0}
                currentPage={currentPage}
                totalPages={quoteItemsResponse?.meta?.totalPages || 1}
                onPageChange={setCurrentPage}
            />
        )
      )}

      {/* Quote Summary - Now using quoteSummary state instead of summary */}
      <ItemsSummary
        data={dataQuotesSummary}
        refetch={refetchQuotesSummary}
        addedQuantity={quotesSummary.addedQuantity}
        addedUnitPrice={quotesSummary.addedUnitPrice}
        addedTaxRate={quotesSummary.addedTaxRate}
        addedLineTotal={quotesSummary.addedLineTotal}
        paid={quotesSummary.paid}
      />

      <ActivityHistory
        documentID={quote.pk_quote_id}
        toggleRefetch={toggleRefetch}
      />

      {confirmDuplicateQuote && (
        <AlertDialog open={confirmDuplicateQuote} onOpenChange={setConfirmDuplicateQuote}>
        {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Duplicate Quote #${quote.quote_number}`}</AlertDialogTitle>
            <AlertDialogDescription>
              It will create a new quote with the same items and details as the original quote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDuplicateQuote(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateQuote}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </div>
  );
};

export default QuoteDetails;
