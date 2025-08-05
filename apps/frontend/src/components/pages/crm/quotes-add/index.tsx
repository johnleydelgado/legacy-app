"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {InfoBox} from "../../../custom/info-box";

import moment from "moment";

import {ContactsTypes, Customer as CustomerQuotesTypes,} from "../../../../services/quotes/types";
import {useCustomer} from "@/hooks/useCustomers2";
import {useCreateQuote} from "../../../../hooks/useQuotes";
import {useCreateQuoteItem,} from "../../../../hooks/useQuoteItems";
import QuotesDetailsHeaders from "../quotes-details/sections/headers";
import Customers from "../quotes-details/sections/customers";
import {TableQuotesItems} from "../quotes-details/types";
import {useSelector} from "react-redux";
import {RootState} from "../../../../store";
import {uploadQuoteItemLogoToS3} from "@/utils/quote-items-logo-upload";
import ItemsSummary, {QuotesSummaryTypes} from "../quotes-details/sections/items-summary";
import {useCreateActivityHistory} from "../../../../hooks/useActivityHistory";
import QuotesItems, {QuoteItemsType} from "../quotes-details/sections/quotes-items-2";
import {toast} from "sonner";
import {CreateImageGalleryParams, FKItemType, Type} from "../../../../services/image-gallery/types";
import {useCreateImageGallery} from "../../../../hooks/useImageGallery";
import {uploadSingleImage} from "../quotes-details/helpers-functions/image-helpers";
import { useContactByReference, useContactByType, useContactMutations } from "@/hooks/useContacts";
import { Contact, ContactTypeEnums } from "@/services/contacts/types";
import { Address, AddressTypeEnums } from "@/services/addresses/types";
import { useAddressByForeignKey, useAddressMutations } from "@/hooks/useAddresses";

export default function QuotesAdd() {
  const taxRate = 0.08;

  const router = useRouter();

  const customerID = useSelector(
    (state: RootState) => state.customers.customerID
  );

  const [quotesItems, setQuotesItems] = React.useState<QuoteItemsType[]>([]);

  const [modifyStatus, setModifyStatus] = React.useState(false);
  const [quoteStatus, setQuoteStatus] = React.useState<number>(1);
  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(-1);
  const [isSaving, setIsSaving] = React.useState(false);

  const [customerData, setCustomerData] =
    React.useState<CustomerQuotesTypes | null>(null);

  const [quotesSummary, setQuotesSummary] = React.useState<QuotesSummaryTypes>({
    addedQuantity: 0,
    addedUnitPrice: 0,
    addedTaxRate: 0,
    addedLineTotal: 0,
    paid: 0
  });

  const [contactBilling, setContactBilling] = React.useState<Contact | null>(null);
  const [contactShipping, setContactShipping] = React.useState<Contact | null>(null);

  const [addressBilling, setAddressBilling] = React.useState<Address | null>(null);
  const [addressShipping, setAddressShipping] = React.useState<Address | null>(null);

  const [quotesNotes, setQuotesNotes] = React.useState<string>("");

  // Initialize mutations
  const createQuoteItemMutation = useCreateQuoteItem();

  const { fullname } = useSelector((state: RootState) => state.users);

  // Add the createQuote mutation alongside other mutations
  const createQuoteMutation = useCreateQuote();
  const createActivityHistory = useCreateActivityHistory();
  const { createImage } = useCreateImageGallery();
  const { createContact } = useContactMutations();
  const { createAddress } = useAddressMutations();
  
  // Use the useCustomer hook to fetch customer data
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

  const handleCreatePipeline = async () => {
    try {
      setIsSaving(true);

      const quoteData = {
        customerID: currentCustomerID,
        quoteDate: new Date().toISOString().split("T")[0],
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        statusID: 1,
        subtotal: quotesSummary.addedLineTotal,
        taxTotal: 0.08,
        currency: "USD",
        notes: quotesNotes,
        terms: "",
        tags: "",
        userOwner: fullname || "Undefined User"
      };

      // @ts-ignore
      const createdQuote = await createQuoteMutation.mutateAsync(quoteData);

      await handleContactChange(createdQuote.pk_quote_id, createdQuote.quote_number);
      await handleAddressChange(createdQuote.pk_quote_id, createdQuote.quote_number);

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

        // const quotes_item_numbers = createPromises.map(data => data.item_number);

        // const createActivity = `Create new ${quotes_item_numbers.join(", ")} Quotes Items from Quotes #${createdQuote.quote_number}`

        // toast.success(createActivity);
        // console.log(createActivity);

        // // @ts-ignore
        // await createActivityHistory.mutateAsync({
        //   customerID: currentCustomerID,
        //   status: quoteStatus,
        //   tags: "",
        //   activity: createActivity,
        //   activityType: `Create`,
        //   documentID: createdQuote.pk_quote_id,
        //   documentType: "Quotes",
        //   userOwner: fullname || "Undefined User"
        // });

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
                  documentID: createdQuote.pk_quote_id,
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

        // console.log(`Upload process completed: ${uploadedImages.length} images successfully uploaded`);
        // toast.success(`Uploaded ${uploadedImages.length} images for Quote #${createdQuote.quote_number}`);
      }

      setModifyStatus(false);

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: `Created new Quotes # ${createdQuote.quote_number}`,
        activityType: `Create`,
        documentID: createdQuote.pk_quote_id,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      toast.success(`Quote #${createdQuote.quote_number} successfully created`);
      console.log(`Quote #${createdQuote.quote_number} successfully created`);

      // Redirect to quotes list page after successful creation
      router.push(`/crm/quotes/${createdQuote.pk_quote_id}`);

      return createdQuote;

    } catch (error) {
      toast.error("Failed to create quote and quote items");
      console.error("Failed to create quote and quote items:", error);
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactChange = async (quoteID: number, quoteNumber: string) => {
    if (contactBilling) {
      try {
        await createContact({
          fk_id: quoteID,
          firstname: contactBilling.first_name,
          lastname: contactBilling.last_name,
          email: contactBilling.email,
          phoneNumber: contactBilling.phone_number,
          mobileNumber: contactBilling.mobile_number,
          positionTitle: contactBilling.position_title,
          contactType: ContactTypeEnums.BILLING,
          table: "Quotes"
        });

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: `Set Quotes #${quoteNumber} Billing Contact`,
          activityType: `Set`,
          documentID: quoteID,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });

        // toast.success(`Quote #${quoteNumber} Billing Contact successfully created`);
        console.log(`Quote #${quoteNumber} Billing Contact successfully created`);

      } catch (error) {
        console.error("Failed to create contact:", error);
      }

      return Promise.resolve();
    }

    if (contactShipping) {
      try {
        await createContact({
          fk_id: quoteID,
          firstname: contactShipping.first_name,
          lastname: contactShipping.last_name,
          email: contactShipping.email,
          phoneNumber: contactShipping.phone_number,
          mobileNumber: contactShipping.mobile_number,
          positionTitle: contactShipping.position_title,
          contactType: ContactTypeEnums.SHIPPING,
          table: "Quotes"
        });

        // @ts-ignore
        await createActivityHistory.mutateAsync({
          customerID: currentCustomerID,
          status: quoteStatus,
          tags: "",
          activity: `Set Quotes #${quoteNumber} Shipping Contact`,
          activityType: `Set`,
          documentID: quoteID,
          documentType: "Quotes",
          userOwner: fullname || "Undefined User"
        });

        // toast.success(`Quote #${quoteNumber} Shipping Contact successfully created`);
        console.log(`Quote #${quoteNumber} Shipping Contact successfully created`);

      } catch (error) {
        console.error("Failed to create contact:", error);
      }

      return Promise.resolve();
    }
  }

  const handleAddressChange = async (quoteID: number, quoteNumber: string) => {
    try {
      if (!addressBilling) {
        toast.error("No address billing found");
        console.error("No address billing found");
        return Promise.resolve();
      }

      await createAddress({
        fk_id: quoteID,
        address1: addressBilling.address1,
        address2: addressBilling.address2 || "",
        city: addressBilling.city,
        state: addressBilling.state,
        zip: addressBilling.zip,
        country: addressBilling.country,
        address_type: AddressTypeEnums.BILLING,
        table: "Quotes"
      });

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: `Set Quotes #${quoteNumber} Billing Address`,
        activityType: `Set`,
        documentID: quoteID,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      // toast.success(`Quote #${quoteNumber} Billing Address successfully created`);
      console.log(`Quote #${quoteNumber} Billing Address successfully created`);

      if (!addressShipping) {
        toast.error("No address shipping found");
        console.error("No address shipping found");
        return Promise.resolve();
      }

      await createAddress({
        fk_id: quoteID,
        address1: addressShipping.address1,
        address2: addressShipping.address2 || "",
        city: addressShipping.city,
        state: addressShipping.state,
        zip: addressShipping.zip,
        country: addressShipping.country,
        address_type: AddressTypeEnums.SHIPPING,
        table: "Quotes"
      });

      // @ts-ignore
      await createActivityHistory.mutateAsync({
        customerID: currentCustomerID,
        status: quoteStatus,
        tags: "",
        activity: `Set Quotes #${quoteNumber} Shipping Address`,
        activityType: `Set`,
        documentID: quoteID,
        documentType: "Quotes",
        userOwner: fullname || "Undefined User"
      });

      // toast.success(`Quote #${quoteNumber} Shipping Address successfully created`);
      console.log(`Quote #${quoteNumber} Shipping Address successfully created`);

    } catch (error) {
      console.error("Failed to create address:", error);
    }

    return Promise.resolve();

  }

  // Also update the handleUpdateClick function to handle the async nature properly:
  const handleUpdateClick = React.useCallback(async () => {
    if (!customerData) {
      toast.error("Please Select Customer for Quote");
      return;
    }

    try {
      await handleCreatePipeline();

    } catch (error) {
      // Handle error (show toast, alert, etc.)
      console.error("Error in quote creation process:", error);
    }
  }, [
    quoteStatus,
    currentCustomerID,
    createQuoteMutation, // Add this dependency
    createQuoteItemMutation,
  ]);

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
      setQuotesNotes(fetchedCustomer.notes || "");
      setCustomerData(mapToCustomerQuotesTypes(fetchedCustomer));
    }
  }, [fetchedCustomer]);

  // Optional: Log customer loading state and errors for debugging
  React.useEffect(() => {
    if (customerError) {
      console.error("Customer fetch error:", customerError);
    }
  }, [customerError]);

  React.useEffect(() => {
    if (quotesItems && quotesItems.length > 0) {
      const totalQuantity = quotesItems.reduce(
          (sum, item) => sum + item.quantity, 0);
      const totalUnitPrice = quotesItems.reduce(
          (sum, item) => sum + item.unitPrice, 0);
      const taxRate = 0.08;
      const totalSub = quotesItems.reduce(
          (sum, item) => sum + item.total, 0);

      setQuotesSummary({
        addedTaxRate: taxRate,
        addedQuantity: totalQuantity,
        addedUnitPrice: totalUnitPrice,
        addedLineTotal: totalSub,
        paid: 0
      });
    }
   }, [quotesItems]);

  return (
    <div className="min-h-screen  text-gray-900">
      <QuotesDetailsHeaders
        status={quoteStatus}
        add={true}
        setStatus={setQuoteStatus}
        modifyFlag={modifyStatus}
        setModifyFlag={setModifyStatus}
        handleUpdateClick={handleUpdateClick}
        isSaving={isSaving}
        disableSave={!currentCustomerID || currentCustomerID <= 0}
      />

      <InfoBox
        title="Creating new quote"
        subtitle="Select a customer and add items to your quote. Once saved, the quote will be available in the quotes list."
      />

      {/* Customer Information */}
      <Customers
        data={customerData}
        setCustomerID={setCurrentCustomerID}
        setModifyFlag={setModifyStatus}
        customerLoading={customerLoading}
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
      />

      {/* Quote Items - Now with skeleton loading */}
      <QuotesItems
        quotesItems={quotesItems}
        setQuotesItems={setQuotesItems}
        setModifyFlag={setModifyStatus}
      />

      <ItemsSummary
        addedQuantity={quotesSummary.addedQuantity}
        addedUnitPrice={quotesSummary.addedUnitPrice}
        addedTaxRate={quotesSummary.addedTaxRate}
        addedLineTotal={quotesSummary.addedLineTotal}
        paid={quotesSummary.paid}
      />
    </div>
  );
}
