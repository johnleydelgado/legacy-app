'use client';

import * as React from 'react';
import {Invoice as InvoiceTypes} from "../../../../../services/invoices/types";
import InvoiceDetailsHeaders from "../sections/headers";
import {InfoBox} from "../../../../custom/info-box";
import Customers from "../sections/customers";
import {ContactsTypes, Customer as CustomerQuotesTypes} from "../../../../../services/quotes/types";
import {useCustomer} from "../../../../../hooks/useCustomers2";
import InvoiceItems, {InvoiceItemsTypes} from "../sections/invoice-items";
import ItemsSummary, {InvoicesSummaryTypes} from "../sections/items-summary";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel, AlertDialogAction
} from "../../../../ui/alert-dialog";
import {toast} from "sonner";
import {useDeleteInvoice, useUpdateInvoice} from "../../../../../hooks/useInvoices";
import {useRouter} from "next/navigation";
import {useInvoiceItemMutations, useInvoiceItemsByInvoiceId} from "../../../../../hooks/useInvoicesItems";
import InvoiceDetailsInfo from "../sections/invoice-details-info";
import {InvoiceDetailsTypes} from "../add";
import ActivityHistory from "../sections/activity-history";
import {useCreateActivityHistory} from "../../../../../hooks/useActivityHistory";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../store";
import {infoBoxFormatDate, updateDataFormatDate} from "../../../../../helpers/date-formatter";
import { Contact, ContactTypeEnums } from '@/services/contacts/types';
import { Address, AddressTypeEnums } from '@/services/addresses/types';
import { useContactByReference, useContactMutations } from '@/hooks/useContacts';
import { useAddressByForeignKey, useAddressMutations } from '@/hooks/useAddresses';
import Link from 'next/link';
import { useQuote } from '@/hooks/useQuotes';
import { useOrder } from '@/hooks/useOrders';  

interface ComponentsProps {
    invoiceData: InvoiceTypes;
}

const InvoiceDetails = ({ invoiceData }: ComponentsProps) => {
    const router = useRouter();

    // Initialize with the actual status from invoiceData if available
    const [invoiceStatus, setInvoiceStatus] = React.useState<number>(
        invoiceData?.status?.id || 12
    );
    const [modifyFlag, setModifyFlag] = React.useState<boolean>(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const [customerData, setCustomerData] =
        React.useState<CustomerQuotesTypes | null>(null);
    const [currentCustomerID, setCurrentCustomerID] = React.useState(-1);
    const [customerChange, setCustomerChange] = React.useState<boolean>(false);
    
    const [contactBilling, setContactBilling] = React.useState<Contact | null>(null);
    const [modifyContactBilling, setModifyContactBilling] = React.useState<boolean>(false);
    
    const [contactShipping, setContactShipping] = React.useState<Contact | null>(null);
    const [modifyContactShipping, setModifyContactShipping] = React.useState<boolean>(false);
    
    const [addressBilling, setAddressBilling] = React.useState<Address | null>(null);
    const [modifyAddressBilling, setModifyAddressBilling] = React.useState<boolean>(false);
    
    const [addressShipping, setAddressShipping] = React.useState<Address | null>(null);
    const [modifyAddressShipping, setModifyAddressShipping] = React.useState<boolean>(false);
    
    const [invoiceNotes, setInvoiceNotes] = React.useState("");
    const [modifyNotes, setModifyNotes] = React.useState<boolean>(false);
    
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [deletedInvoiceItems, setDeletedInvoiceItems] = React.useState<number[]>([]);

    const [statusChange, setStatusChange] = React.useState<boolean>(false);
    const [statusText, setStatusText] = React.useState<string>("");
    const [toggleRefetch, setToggleRefetch] = React.useState<boolean>(false);

    const [invoiceItems, setInvoiceItems] = React.useState<InvoiceItemsTypes[]>([]);

    const [invoiceSummary, setInvoiceSummary] = React.useState<InvoicesSummaryTypes>({
        addedQuantity: 0,
        addedUnitPrice: 0,
        addedTaxRate: 0,
        addedLineTotal: 0,
        paid: 0
    });

    const [invoiceDetailsData, setInvoiceDetailsData] = React.useState<InvoiceDetailsTypes>({
        invoiceDate: new Date(),
        terms: "",
        dueDate: new Date(),
    });

    const ordersNumber = useSelector((state: RootState) => state.orders.ordersNumber);
    const { fullname } = useSelector((state: RootState) => state.users);

    const customersID = invoiceData?.customer_data?.id || -1;
    const ordersID = invoiceData?.order?.id || -1;
    const notes = invoiceData?.notes || "";
    const terms = invoiceData?.terms || "1";
    const invoiceDate = invoiceData?.invoice_date || new Date();
    const dueDate = invoiceData?.due_date || new Date();

    const { data: dataQuoteDetails } = useQuote(invoiceData?.serial_encoder?.quote_id || 0);
    const { data: dataOrderDetails } = useOrder(invoiceData?.serial_encoder?.order_id || 0);

    const {
        customer: fetchedCustomer,
        loading: customerLoading,
        error: customerError,
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
        data: dataContactInvoicesBilling
    } = useContactByReference(
        invoiceData.pk_invoice_id, 
        "Invoices", 
        ContactTypeEnums.BILLING
    );

    const {
        data: dataContactInvoicesShipping
    } = useContactByReference(
        invoiceData.pk_invoice_id, 
        "Invoices", 
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

    const { data: dataInvoicesAddressBilling } = useAddressByForeignKey({
        fk_id: invoiceData.pk_invoice_id,
        table: "Invoices",
        address_type: AddressTypeEnums.BILLING
    });

    const { data: dataInvoicesAddressShipping } = useAddressByForeignKey({
        fk_id: invoiceData.pk_invoice_id,
        table: "Invoices",
        address_type: AddressTypeEnums.SHIPPING
    });

    const {
        invoiceItems: dataInvoicesItems,
        meta: metaInvoicesItems,
        loading: loadingInvoicesItems,
        error: errorInvoiceItems,
        refresh: refreshInvoiceItems
    } = useInvoiceItemsByInvoiceId(invoiceData.pk_invoice_id);

    const { deleteInvoice } = useDeleteInvoice();
    const { updateInvoice } = useUpdateInvoice();
    const {
        createInvoiceItem,
        updateInvoiceItem,
        deleteInvoiceItem
    } = useInvoiceItemMutations();
    const createActivityHistory = useCreateActivityHistory();

    const { createContact, updateContact } = useContactMutations();
    const { createAddress, updateAddress } = useAddressMutations();
    
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

    const handleDeleteInvoice = async () => {
        try {
            setIsDeleting(true);
            await deleteInvoice(invoiceData.pk_invoice_id);

            // @ts-ignore
            await createActivityHistory.mutateAsync({
                customerID: currentCustomerID,
                status: invoiceStatus,
                tags: "",
                activity: `Delete Invoice #${invoiceData.invoice_number} from customer ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
                activityType: `Delete`,
                documentID: invoiceData.pk_invoice_id,
                documentType: "Invoices",
                userOwner: fullname || "Undefined User",
            });

            toast.success("Invoice deleted successfully");
            router.back();

        } catch (error) {
            console.error("Failed to delete order:", error);
            toast.error("Failed to delete order. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    const createInvoiceItemsPipeline = () => {
        const createInvoiceItems = invoiceItems
            .filter(data => data.invoiceItemsID === -1)
            .map(async (data, _) => {
                return createInvoiceItem({
                    invoiceID: invoiceData.pk_invoice_id,
                    productID: data.productID,
                    itemName: data.itemName,
                    itemDescription: data.itemDescription,
                    quantity: data.quantity,
                    unitPrice: data.unitPrice,
                    taxRate: data.taxRate,
                });
            });

        if (createInvoiceItems.length > 0) {
            return Promise.all(createInvoiceItems)
                .then(() => {
                    // @ts-ignore
                    return createActivityHistory.mutateAsync({
                        customerID: currentCustomerID,
                        status: invoiceStatus,
                        tags: "",
                        activity: `Created ${createInvoiceItems.length} Invoice Items from Invoice #${invoiceData.invoice_number}`,
                        activityType: `Create`,
                        documentID: invoiceData.pk_invoice_id,
                        documentType: "Invoices",
                        userOwner: fullname || "Undefined User",
                    })
                        .then(() => {
                            console.log("New invoice items created successfully");
                            // toast.success("Invoice items created successfully");
                        });
                })
                .catch((error) => {
                    console.error("Failed to create new invoice items:", error);
                    toast.error("Failed to create new invoice items");
                    throw error; // Re-throw to propagate error up
                });
        }

        return Promise.resolve(); // Return resolved promise when nothing to create
    }

    const updateInvoiceItemsPipeline = () => {
        const updateInvoiceItems = invoiceItems
            .filter(data => data.invoiceItemsID > 0 && data.actionEdited)
            .map(async (data, _) => {
                return updateInvoiceItem(data.invoiceItemsID, {
                    productID: data.productID,
                    itemName: data.itemName,
                    itemDescription: data.itemDescription,
                    quantity: data.quantity,
                    unitPrice: data.unitPrice,
                    taxRate: data.taxRate,
                });
            });

        if (updateInvoiceItems.length > 0) {
            return Promise.all(updateInvoiceItems)
                .then(() => {
                    console.log("Updating invoice items successfully");

                    // @ts-ignore
                    return createActivityHistory.mutateAsync({
                        customerID: currentCustomerID,
                        status: invoiceStatus,
                        tags: "",
                        activity: `Updated ${updateInvoiceItems.length} Invoice Items from Invoice #${invoiceData.invoice_number}`,
                        activityType: `Update`,
                        documentID: invoiceData.pk_invoice_id,
                        documentType: "Invoices",
                        userOwner: fullname || "Undefined User",
                    })
                        .then(() => {
                            // toast.success("Invoice items updated successfully");
                            console.log("Invoice items updated successfully");
                        });
                })
                .catch((error) => {
                    console.error("Failed to update invoice items:", error);
                    toast.error("Failed to update invoice items");
                    throw error; // Re-throw to propagate error up
                });
        }
        return Promise.resolve(); // Return resolved promise when nothing to update
    }

    const deleteInvoiceItemsPipeline = () => {
        const deletingInvoiceItems = deletedInvoiceItems
            .map((data, _) => {
                return deleteInvoiceItem(data);
            });

        if (deletingInvoiceItems.length > 0) {
            return Promise.all(deletingInvoiceItems)
                .then(() => {
                    console.log(`Deleted ${deletedInvoiceItems.length} invoice items successfully`);

                    // @ts-ignore
                    return createActivityHistory.mutateAsync({
                        customerID: currentCustomerID,
                        status: invoiceStatus,
                        tags: "",
                        activity: `Delete ${deletingInvoiceItems.length} Invoice Items from Invoice #${invoiceData.invoice_number}`,
                        activityType: `Delete`,
                        documentID: invoiceData.pk_invoice_id,
                        documentType: "Invoices",
                        userOwner: fullname || "Undefined User",
                    })
                        .then(() => {
                            // toast.success(`${deletedInvoiceItems.length} Invoice items deleted successfully`);
                            console.log(`${deletedInvoiceItems.length} Invoice items deleted successfully`);
                        });
                })
                .catch((error) => {
                    console.error(`Failed to delete ${deletedInvoiceItems.length} invoice items:`, error);
                    toast.error(`Failed to delete ${deletedInvoiceItems.length} invoice items`);
                    throw error; // Re-throw to propagate error up
                });
        }
        return Promise.resolve(); // Return resolved promise when nothing to delete
    }

    const handleBillingChange = async () => {
        try {
          if (!modifyContactBilling && !modifyAddressBilling) return;
    
          let setContactResponse = null;
          let setAddressResponse = null;
    
          if (dataContactInvoicesBilling && modifyContactBilling) {
            setContactResponse = await updateContact({
              id: dataContactInvoicesBilling.pk_contact_id,
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
          } else if (!dataContactInvoicesBilling && modifyContactBilling) {
            setContactResponse = await createContact({
              fk_id: invoiceData.pk_invoice_id,
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
            const activity = `Set Orders #${invoiceData.invoice_number} billing contact to ${contactBilling?.first_name} ${contactBilling?.last_name}`;
    
            // toast.success(activity);
            console.log(activity);
    
            // @ts-ignore
            await createActivityHistory.mutateAsync({
              customerID: currentCustomerID,
              status: invoiceStatus,
              tags: "",
              activity: activity,
              activityType: `Set`,
              documentID: invoiceData.pk_invoice_id,
              documentType: "Invoices",
              userOwner: fullname || "Undefined User",
            });
          } else {
            toast.error("Failed to update billing contact. Please try again.");
            console.error("Failed to update billing contact. Please try again.");
          }
    
          if (dataInvoicesAddressBilling && modifyAddressBilling) {
            setAddressResponse = await updateAddress({
              id: dataInvoicesAddressBilling.pk_address_id,
              data: {
                address1: addressShipping?.address1 || "",
                city: addressShipping?.city || "",  
                state: addressShipping?.state || "",
                zip: addressShipping?.zip || "",
                country: addressShipping?.country || "",
                address_type: "BILLING",
              }
            });
          } else if (!dataInvoicesAddressBilling && modifyAddressBilling) {
            setAddressResponse = await createAddress({
              fk_id: invoiceData.pk_invoice_id,
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
            const activity = `Set Invoice #${invoiceData.invoice_number} billing address to ${addressBilling?.address1} ${addressBilling?.city} ${addressBilling?.state} ${addressBilling?.zip} ${addressBilling?.country}`;
    
            // toast.success(activity);
            console.log(activity);
    
            // @ts-ignore
            await createActivityHistory.mutateAsync({ 
              customerID: currentCustomerID,
              status: invoiceStatus,
              tags: "",
              activity: activity,
              activityType: `Set`,
              documentID: invoiceData.pk_invoice_id,
              documentType: "Invoices",
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
    
        if (dataContactInvoicesShipping && modifyContactShipping) {
          setContactResponse = await updateContact({
            id: dataContactInvoicesShipping.pk_contact_id,
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
        } else if (!dataContactInvoicesShipping && modifyContactShipping) {
          setContactResponse = await createContact({
            fk_id: invoiceData.pk_invoice_id,
            firstname: contactShipping?.first_name || "", 
            lastname: contactShipping?.last_name || "",
            email: contactShipping?.email || "",
            phoneNumber: contactShipping?.phone_number || "",
            mobileNumber: contactShipping?.mobile_number || "",
            positionTitle: contactShipping?.position_title || "",
            contactType: "SHIPPING",
            table: "Invoices"
          });
        }
    
        if (setContactResponse) {
          const activity = `Set Invoice #${invoiceData.invoice_number} shipping contact to ${contactShipping?.first_name} ${contactShipping?.last_name}`;
    
          // toast.success(activity);
          console.log(activity);
    
          // @ts-ignore
          await createActivityHistory.mutateAsync({
            customerID: currentCustomerID,
            status: invoiceStatus,
            tags: "",
            activity: activity,
            activityType: `Set`,
            documentID: invoiceData.pk_invoice_id,
            documentType: "Invoices",
            userOwner: fullname || "Undefined User",
          });
        } else {
          toast.error("Failed to update shipping contact. Please try again.");
          console.error("Failed to update shipping contact. Please try again.");
        }
    
        if (dataInvoicesAddressShipping && modifyAddressShipping) {
            setAddressResponse = await updateAddress({
              id: dataInvoicesAddressShipping.pk_address_id,
              data: {
                address1: addressShipping?.address1 || "",
                city: addressShipping?.city || "",
                state: addressShipping?.state || "",
                zip: addressShipping?.zip || "",
                country: addressShipping?.country || "",
                address_type: "SHIPPING",
              }
            });
        } else if (!dataInvoicesAddressShipping && modifyAddressShipping) {
          setAddressResponse = await createAddress({
            fk_id: invoiceData.pk_invoice_id,
            address1: addressShipping?.address1 || "",
            city: addressShipping?.city || "",
            state: addressShipping?.state || "",
            zip: addressShipping?.zip || "",
            country: addressShipping?.country || "",
            address_type: "SHIPPING",
            table: "Invoices"
          });
        }
    
        if (setAddressResponse) {
          const activity = `Set Invoice #${invoiceData.invoice_number} shipping address to ${addressShipping?.address1} ${addressShipping?.city} ${addressShipping?.state} ${addressShipping?.zip} ${addressShipping?.country}`;
    
          // toast.success(activity);
          console.log(activity);
    
          // @ts-ignore
          await createActivityHistory.mutateAsync({
            customerID: currentCustomerID,
            status: invoiceStatus,
            tags: "",
            activity: activity,
            activityType: `Set`,
            documentID: invoiceData.pk_invoice_id,
            documentType: "Invoices",
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

    const handleUpdateInvoice = async () => {
        if (!modifyFlag) return; // Early return if no modifications

        try {
            setIsSaving(true);

            // Execute all operations in sequence and properly await them
            await createInvoiceItemsPipeline();
            await updateInvoiceItemsPipeline();
            await deleteInvoiceItemsPipeline();

            await handleBillingChange();
            await handleShippingChange();

            const totalSub = invoiceItems.reduce((sum, item) => sum + item.total, 0);

            const updateData = {
                customerID: currentCustomerID,
                statusID: invoiceStatus,
                invoiceDate: updateDataFormatDate(invoiceDetailsData.invoiceDate), // Format as YYYY-MM-DD
                terms: invoiceDetailsData.terms,
                dueDate: updateDataFormatDate(invoiceDetailsData.dueDate), // Format as YYYY-MM-DD
                taxTotal: 0.08,
                subTotal: totalSub,
                currency: "USD",
                notes: invoiceNotes, // Include notes from state
                tags: "[]", // Include notes from state
                userOwner: fullname || "Undefined User",
            };

            const result = await updateInvoice(invoiceData.pk_invoice_id, updateData);

            if (statusChange) {
                // @ts-ignore
                await createActivityHistory.mutateAsync({
                    customerID: currentCustomerID,
                    status: invoiceStatus,
                    tags: "",
                    activity: `Update Invoice #${result.invoice_number} to ${statusText} status`,
                    activityType: `Update`,
                    documentID: invoiceData.pk_invoice_id,
                    documentType: "Invoices",
                    userOwner: fullname || "Undefined User",
                });

                setStatusChange(false);
            }

            if (customerChange) {
                // @ts-ignore
                await createActivityHistory.mutateAsync({
                    customerID: currentCustomerID,
                    status: invoiceStatus,
                    tags: "",
                    activity: `Update Invoice #${invoiceData.invoice_number} customer to ID #${customerData?.pk_customer_id} - ${customerData?.name}`,
                    activityType: `Update`,
                    documentID: invoiceData.pk_invoice_id,
                    documentType: "Invoices",
                    userOwner: fullname || "Undefined User",
                });

                setCustomerChange(false);
            }

            // Now that all operations are complete, toggle the refetch state ONCE
            setToggleRefetch(prevState => !prevState);

            toast.success(`Invoice # ${result.invoice_number} updated successfully`);
            setModifyFlag(false); // Reset modify flag since changes are saved

            return result;
        } catch (error) {
            console.error("Failed to update invoice:", error);
            toast.error("Failed to update invoice. Please try again.");
        } finally {
            setIsSaving(false); // Always reset saving state
        }
    }

    // Load initial data from invoiceData
    React.useEffect(() => {
        if (invoiceData) {
            if (customersID > 0) setCurrentCustomerID(customersID);
            if (notes.length > 0) setInvoiceNotes(notes);
            if (terms !== "1") setInvoiceDetailsData(prevState => ({...prevState, terms}));

            if (invoiceData?.invoice_date) setInvoiceDetailsData(prevState => ({
                ...prevState,
                invoiceDate: new Date(invoiceData.invoice_date)
            }));
            if (invoiceData?.due_date) setInvoiceDetailsData(prevState => ({
                ...prevState,
                dueDate: new Date(invoiceData.due_date)
            }));
        }
    }, [invoiceData, customersID, notes]);

    // Set customer data when fetchedCustomer changes
    React.useEffect(() => {
        if (fetchedCustomer) {
            setCustomerData(mapToCustomerQuotesTypes(fetchedCustomer));
            setCurrentCustomerID(fetchedCustomer.pk_customer_id);

            if (fetchedCustomer.notes && !modifyNotes) {
                setInvoiceNotes(`${fetchedCustomer.notes} ${invoiceData.notes}` || "");
            }
        }
    }, [fetchedCustomer]);

    React.useEffect(() => {
        console.log("contactShipping:", contactShipping);
        console.log("dataContactInvoicesShipping:", dataContactInvoicesShipping);
    }, [contactShipping, dataContactInvoicesShipping]);

    React.useEffect(() => {  
        if (dataContactInvoicesBilling && !modifyContactBilling) {
          setContactBilling(dataContactInvoicesBilling);
          
        } else if (dataContactCustomerBilling && modifyContactBilling) {
          setContactBilling(dataContactCustomerBilling);
    
        } else {
          setContactBilling(dataContactCustomerPrimary || null);
        }
    
        if (dataContactInvoicesShipping && !modifyContactShipping) {
          setContactShipping(dataContactInvoicesShipping);
    
        } else if (dataContactCustomerShipping && modifyContactShipping) {
          setContactShipping(dataContactCustomerShipping);
    
        } else {
          setContactShipping(dataContactCustomerPrimary || null);
        }
    
      }, [
        dataContactCustomerPrimary,
        dataContactCustomerBilling,
        dataContactCustomerShipping,
        dataContactInvoicesBilling,
        dataContactInvoicesShipping,
        currentCustomerID
      ]);
    
      React.useEffect(() => {
        if (dataInvoicesAddressBilling && !modifyAddressBilling) {
          setAddressBilling(dataInvoicesAddressBilling);
        } else if (dataCustomerAddressBilling && modifyAddressBilling) {
          setAddressBilling(dataCustomerAddressBilling);
        }
    
        if (dataInvoicesAddressShipping && !modifyAddressShipping) {
          setAddressShipping(dataInvoicesAddressShipping);
        } else if (dataCustomerAddressShipping && modifyAddressShipping) {
          setAddressShipping(dataCustomerAddressShipping);
        }
      }, [
        dataCustomerAddressBilling, 
        dataInvoicesAddressBilling, 
        dataCustomerAddressShipping,
        dataInvoicesAddressShipping
      ]);

    // Process dataInvoicesItems once when it loads
    React.useEffect(() => {
        if (dataInvoicesItems && dataInvoicesItems.length > 0) {
            const normalizeData = dataInvoicesItems.map((data) => {
                return {
                    invoiceItemsID: data.pk_invoice_items_id,
                    categoryID: data.category_data.id,
                    categoryName: data.category_data.category_name,
                    productID: data.products_data.id,
                    itemNumber: data.item_number,
                    itemName: data.item_name,
                    itemDescription: data.item_description,
                    quantity: data.quantity,
                    unitPrice: parseFloat(`${data.unit_price}`),
                    taxRate: 0.08,
                    total: parseFloat(`${data.line_total}`),
                    actionCreate: false,
                    actionModify: false,
                    actionEdited: false,
                    errorState: []
                }
            });

            // Only update if there's an actual change to prevent loops
            setInvoiceItems(normalizeData);
        }
    }, [dataInvoicesItems]);

    // Calculate summary from invoiceItems
    React.useEffect(() => {
        if (invoiceItems && invoiceItems.length > 0) {
            const totalQuantity = invoiceItems.reduce(
                (sum, item) => sum + item.quantity, 0);
            const totalUnitPrice = invoiceItems.reduce(
                (sum, item) => sum + item.unitPrice, 0);
            const taxRate = invoiceItems[0].taxRate;
            const totalSub = invoiceItems.reduce((sum, item) => sum + item.total, 0);

            // Use functional update to ensure we're not depending on previous state
            setInvoiceSummary({
                addedQuantity: totalQuantity,
                addedUnitPrice: totalUnitPrice,
                addedTaxRate: taxRate,
                addedLineTotal: totalSub,
                paid: 0,
            });
        }
    }, [invoiceItems]);

    return (
        <div className="flex flex-col gap-y-6 p-4">
            <InvoiceDetailsHeaders
                status={invoiceStatus}
                setStatus={setInvoiceStatus}
                modifyFlag={modifyFlag}
                setModifyFlag={setModifyFlag}
                handleDeleteOrder={() => setShowDeleteDialog(true) }
                handleUpdateClick={handleUpdateInvoice}
                add={false}
                isSaving={isSaving}
                setStatusChange={setStatusChange}
                setStatusText={setStatusText}
            />

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog &&
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete order #{invoiceData.invoice_number} and remove all associated order items from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteInvoice}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            }

            <InfoBox
                title={`Invoice # ${invoiceData.invoice_number} ${ordersNumber.length > 1 ? `from Order #${ordersNumber}` : ''}`}
                subtitle={
                  <div className="flex flex-col gap-0 pl-6 gap-y-0">
                    <div className="flex flex-row gap-x-2">
                        <p className="text-sm text-blue-500">Created at {infoBoxFormatDate(invoiceData.created_at)}</p>
                        <p className="text-sm text-blue-500">{`|`}</p>
                        <p className="text-sm text-blue-500"> Created by {invoiceData.user_owner}</p>
                    </div>
                    {invoiceData.serial_encoder.quote_id && dataQuoteDetails && (
                      <Link href={`/crm/quotes/${invoiceData.serial_encoder.quote_id}`}>
                        <p className="text-sm text-blue-500">From Quote # {dataQuoteDetails.quote_number}</p>
                      </Link>
                    )}
                    {invoiceData.serial_encoder.order_id && dataOrderDetails && (
                      <Link href={`/crm/orders/${invoiceData.serial_encoder.order_id}`}>
                        <p className="text-sm text-blue-500">From Order # {dataOrderDetails.order_number}</p>
                      </Link>
                    )}
                    {invoiceData.serial_encoder.invoice_ids && 
                        invoiceData
                            .serial_encoder
                            .invoice_ids
                            .filter((data) => data !== invoiceData.pk_invoice_id)
                            .length > 0 && (
                      <div className="flex flex-col gap-y-0">
                        <p className="text-sm text-blue-500">Other Invoices:</p>
                        {invoiceData.serial_encoder.invoice_ids
                          .filter((data) => data !== invoiceData.pk_invoice_id)
                          .map((data, index) => (
                            <Link href={`/crm/invoices/${data}`} key={index}>
                              <p className="text-sm text-blue-500 ml-2">Invoice #{data}</p>
                            </Link>
                        ))}
                      </div>
                    )}
                    {invoiceData.serial_encoder.purchase_order_ids && (
                      <div className="flex flex-col gap-y-0">
                        <p className="text-sm text-blue-500">Other Purchase Orders:</p>
                        {invoiceData.serial_encoder.purchase_order_ids.map((data, index) => (
                          <Link href={`/production/purchase-orders/${data}`} key={index}>
                            <p className="text-sm text-blue-500 ml-2">Purchase Order #{data}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                }
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
                documentNotes={invoiceNotes}
                setDocumentNotes={setInvoiceNotes}
                setModifyNotes={setModifyNotes}
                setModifyContactBilling={setModifyContactBilling}
                setModifyContactShipping={setModifyContactShipping}
                setModifyAddressBilling={setModifyAddressBilling}
                setModifyAddressShipping={setModifyAddressShipping}
            />

            <InvoiceDetailsInfo
                invoiceDate={invoiceDetailsData.invoiceDate}
                setInvoiceDate={(e) => setInvoiceDetailsData(prevState => ({ ...prevState, invoiceDate: e }))}
                terms={invoiceDetailsData.terms}
                setTerms={(e) => setInvoiceDetailsData(prevState => ({ ...prevState, terms: e }))}
                dueDate={invoiceDetailsData.dueDate}
                setDueDate={(e) => setInvoiceDetailsData(prevState => ({ ...prevState, dueDate: e }))}
                setModifyFlag={setModifyFlag}
            />

            <InvoiceItems
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                setModifyFlag={setModifyFlag}
                setDeletedInvoiceItems={setDeletedInvoiceItems}
            />

            <ItemsSummary invoiceSummary={invoiceSummary} />

            <ActivityHistory
                documentID={invoiceData.pk_invoice_id}
                toggleRefetch={toggleRefetch}
            />
        </div>
    )
}

export default InvoiceDetails;
