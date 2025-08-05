'use client';

import * as React from 'react';
import InvoiceDetailsHeaders from "../sections/headers";
import {ContactsTypes, Customer as CustomerQuotesTypes} from "../../../../../services/quotes/types";
import {useCustomer} from "../../../../../hooks/useCustomers2";
import Customers from "../sections/customers";
import {useContactByReference, useContactByType, useContactMutations} from "../../../../../hooks/useContacts";
import InvoiceDetailsInfo from "../sections/invoice-details-info";
import InvoiceItems, {InvoiceItemsTypes} from "../sections/invoice-items";
import ItemsSummary, {InvoicesSummaryTypes} from "../sections/items-summary";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../store";
import {InfoBox} from "../../../../custom/info-box";
import {useInvoiceItemMutations, useInvoiceItemsByInvoiceId} from "../../../../../hooks/useInvoicesItems";
import {useOrderItemsByOrderId} from "../../../../../hooks/useOrdersItems";
import {SelectItem} from "../../../../ui/select";
import {useCreateInvoice} from "../../../../../hooks/useInvoices";
import {uploadQuoteItemLogoToS3} from "../../../../../utils/quote-items-logo-upload";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useCreateActivityHistory} from "../../../../../hooks/useActivityHistory";
import { Contact, ContactTypeEnums } from '@/services/contacts/types';
import { Address, AddressTypeEnums } from '@/services/addresses/types';
import { useAddressByForeignKey, useAddressMutations } from '@/hooks/useAddresses';


export interface InvoiceDetailsTypes {
    invoiceDate: Date,
    terms: string,
    dueDate: Date,
}

export const invoiceTermConstants = [
    {id: 1, name: "Due On Receipt"},
    {id: 2, name: "Net 15"},
    {id: 3, name: "Net 30"},
    {id: 4, name: "Net 45"},
    {id: 5, name: "Net 60"},
]

const InvoicesAdd = () => {
    const router = useRouter();

    const [invoiceStatus, setInvoiceStatus] = React.useState<number>(11);
    const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(-1);
    const [modifyStatus, setModifyStatus] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    const [contactBilling, setContactBilling] = React.useState<Contact | null>(null);
    const [contactShipping, setContactShipping] = React.useState<Contact | null>(null);
    
    const [addressBilling, setAddressBilling] = React.useState<Address | null>(null);
    const [addressShipping, setAddressShipping] = React.useState<Address | null>(null);

    const [invoiceNotes, setInvoiceNotes] = React.useState<string>("");
    const [modifyNotes, setModifyNotes] = React.useState<boolean>(false);

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

    const [invoiceItems, setInvoiceItems] = React.useState<InvoiceItemsTypes[]>([]);

    const customerID = useSelector(
        (state: RootState) => state.customers.customerID
    );

    const [customerData, setCustomerData] =
    React.useState<CustomerQuotesTypes | null>(null);

    const ordersID = useSelector((state: RootState) => state.orders.ordersID);
    const ordersNumber = useSelector((state: RootState) => state.orders.ordersNumber);

    // Use the useCustomer hook to fetch customer data
    const {
        customer: fetchedCustomer,
        loading: customerLoading,
        error: customerError,
    } = useCustomer(currentCustomerID);

    const {
        data: dataContactCustomerPrimary,
    } = useContactByReference(
        currentCustomerID, 
        "Customers", 
        ContactTypeEnums.PRIMARY
    );

    const {
        data: dataContactCustomerBilling,
    } = useContactByReference(
        currentCustomerID, 
        "Customers", 
        ContactTypeEnums.BILLING
    );

    const {
        data: dataContactCustomerShipping,
    } = useContactByReference(
        currentCustomerID, 
        "Customers", 
        ContactTypeEnums.SHIPPING
    );

    const {
        data: dataContactOrdersBilling,
    } = useContactByReference(
        ordersID, 
        "Orders", 
        ContactTypeEnums.BILLING
    );

    const {
        data: dataContactOrdersShipping,
    } = useContactByReference(
        ordersID, 
        "Orders", 
        ContactTypeEnums.SHIPPING
    );

    const {
        data: dataAddressCustomersBilling,
    } = useAddressByForeignKey({
        fk_id: currentCustomerID,
        table: "Customers",
        address_type: AddressTypeEnums.BILLING,
    });
    
    const {
        data: dataAddressCustomersShipping,
    } = useAddressByForeignKey({
        fk_id: currentCustomerID,
        table: "Customers",
        address_type: AddressTypeEnums.SHIPPING,
    });

    const {
        data: dataAddressOrdersBilling,
    } = useAddressByForeignKey({
        fk_id: ordersID,
        table: "Orders",
        address_type: AddressTypeEnums.BILLING,
    });

    const {
        data: dataAddressOrdersShipping,
    } = useAddressByForeignKey({
        fk_id: ordersID,
        table: "Orders",
        address_type: AddressTypeEnums.SHIPPING,
    });

    const {
        data: dataOrderItems,
        loading: loadingOrderItems,
        error: errorOrderItems,
    } = useOrderItemsByOrderId(ordersID);

    const {
        createInvoice,
        loading: createInvoiceLoading,
        error: createInvoiceError,
        createdInvoice
    } = useCreateInvoice();

    const { createInvoiceItem } = useInvoiceItemMutations();
    const createActivityHistory = useCreateActivityHistory();

    const { createContact } = useContactMutations();
    const { createAddress } = useAddressMutations();

    const { fullname } = useSelector((state: RootState) => state.users);

    const handleContactChange = async (invoiceID: number, invoiceNumber: string) => {
        if (contactBilling) {
          try {
            await createContact({
              fk_id: invoiceID,
              firstname: contactBilling.first_name,
              lastname: contactBilling.last_name,
              email: contactBilling.email,
              phoneNumber: contactBilling.phone_number,
              mobileNumber: contactBilling.mobile_number,
              positionTitle: contactBilling.position_title,
              contactType: ContactTypeEnums.BILLING,
              table: "Invoices"
            });
    
            // @ts-ignore
            await createActivityHistory.mutateAsync({
              customerID: currentCustomerID,
              status: invoiceStatus,
              tags: "",
              activity: `Set Invoices #${invoiceNumber} Billing Contact`,
              activityType: `Set`,
              documentID: invoiceID,
              documentType: "Invoices",
              userOwner: fullname || "Undefined User"
            });
    
            // toast.success(`Invoices #${invoiceNumber} Billing Contact successfully created`);
            console.log(`Invoices #${invoiceNumber} Billing Contact successfully created`);
    
          } catch (error) {
            console.error("Failed to create contact:", error);
          }
    
          return Promise.resolve();
        }
    
        if (contactShipping) {
          try {
            await createContact({
              fk_id: invoiceID,
              firstname: contactShipping.first_name,
              lastname: contactShipping.last_name,
              email: contactShipping.email,
              phoneNumber: contactShipping.phone_number,
              mobileNumber: contactShipping.mobile_number,
              positionTitle: contactShipping.position_title,
              contactType: ContactTypeEnums.SHIPPING,
              table: "Invoices"
            });
    
            // @ts-ignore
            await createActivityHistory.mutateAsync({
              customerID: currentCustomerID,
              status: invoiceStatus,
              tags: "",
              activity: `Set Invoices #${invoiceNumber} Shipping Contact`,
              activityType: `Set`,
              documentID: invoiceID,
              documentType: "Invoices",
              userOwner: fullname || "Undefined User"
            });
    
            // toast.success(`Invoices #${invoiceNumber} Shipping Contact successfully created`);
            console.log(`Invoices #${invoiceNumber} Shipping Contact successfully created`);
    
          } catch (error) {
            console.error("Failed to create contact:", error);
          }
    
          return Promise.resolve();
        }
    }
    
    const handleAddressChange = async (invoiceID: number, invoiceNumber: string) => {
        try {
          if (!addressBilling) {
            toast.error("No address billing found");
            console.error("No address billing found");
            return Promise.resolve();
          }

          await createAddress({
            fk_id: invoiceID,
            address1: addressBilling.address1,
            address2: addressBilling.address2 || "",
            city: addressBilling.city,
            state: addressBilling.state,
            zip: addressBilling.zip,
            country: addressBilling.country,
            address_type: AddressTypeEnums.BILLING,
            table: "Invoices"
          });
    
          // @ts-ignore
          await createActivityHistory.mutateAsync({
            customerID: currentCustomerID,
            status: invoiceStatus,
            tags: "",
            activity: `Set Invoices #${invoiceNumber} Billing Address`,
            activityType: `Set`,
            documentID: invoiceID,
            documentType: "Invoices",
            userOwner: fullname || "Undefined User"
          });
    
          // toast.success(`Invoices #${invoiceNumber} Billing Address successfully created`);
          console.log(`Invoices #${invoiceNumber} Billing Address successfully created`);
    
          if (!addressShipping) {
            toast.error("No address shipping found");
            console.error("No address shipping found");
            return Promise.resolve();
          }
    
          await createAddress({
            fk_id: invoiceID,
            address1: addressShipping.address1,
            address2: addressShipping.address2 || "",
            city: addressShipping.city,
            state: addressShipping.state,
            zip: addressShipping.zip,
            country: addressShipping.country,
            address_type: AddressTypeEnums.SHIPPING,
            table: "Invoices"
          });
    
          // @ts-ignore
          await createActivityHistory.mutateAsync({
            customerID: currentCustomerID,
            status: invoiceStatus,
            tags: "",
            activity: `Set Invoices #${invoiceNumber} Shipping Address`,
            activityType: `Set`,
            documentID: invoiceID,
            documentType: "Invoices",
            userOwner: fullname || "Undefined User"
          });
    
          // toast.success(`Invoices #${invoiceNumber} Shipping Address successfully created`);
          console.log(`Invoices #${invoiceNumber} Shipping Address successfully created`);
    
        } catch (error) {
          console.error("Failed to create address:", error);
        }
    
        return Promise.resolve();
    }

    const handleSaveInvoiceClick = async () => {
        if (!customerData) {
            toast.error("Please Select Customer for Invoice");
            return;
        }

        try {
            const formatDate = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setIsSaving(true);

            // Prepare invoice data in the format expected by the API
            const invoiceData = {
                customerID: customerData.pk_customer_id,
                statusID: invoiceStatus,
                orderID: ordersID,
                invoiceDate: formatDate(invoiceDetailsData.invoiceDate),
                dueDate: formatDate(invoiceDetailsData.dueDate),
                subTotal: invoiceSummary.addedLineTotal,
                taxTotal: invoiceSummary.addedTaxRate,
                currency: "USD",
                notes: invoiceNotes,
                terms: invoiceDetailsData.terms,
                userOwner: fullname || "Undefined User",
            };

            // Call the createInvoice function from the hook
            const createdInvoice = await createInvoice(invoiceData);
            const new_invoice_id = createdInvoice.pk_invoice_id;

            if (createdInvoice) {
                let activityText = `Create new Invoice #${createdInvoice.invoice_number}`;

                if (ordersNumber.length > 0) activityText = `${activityText} from Order #${ordersNumber}`;

                // @ts-ignore
                await createActivityHistory.mutateAsync({
                    customerID: currentCustomerID,
                    status: invoiceStatus,
                    tags: "",
                    activity: activityText,
                    activityType: `Create`,
                    documentID: createdInvoice.pk_invoice_id,
                    documentType: "Invoices",
                    userOwner: fullname || "Undefined User",
                });

                await handleContactChange(createdInvoice.pk_invoice_id, createdInvoice.invoice_number);
                await handleAddressChange(createdInvoice.pk_invoice_id, createdInvoice.invoice_number);

                const createInvoiceItems = invoiceItems.map(async (data, index) => {
                    return createInvoiceItem({
                        invoiceID: createdInvoice.pk_invoice_id,
                        productID: data.productID,
                        itemName: data.itemName,
                        itemDescription: data.itemDescription,
                        quantity: data.quantity,
                        unitPrice: data.unitPrice,
                        taxRate: data.taxRate,
                    });
                });

                Promise.all(createInvoiceItems)
                    .then(() => {
                        setIsSaving(false);

                        // @ts-ignore
                        createActivityHistory.mutateAsync({
                            customerID: currentCustomerID,
                            status: invoiceStatus,
                            tags: "",
                            activity: `Create new ${createInvoiceItems.length} Invoices Items from Invoice #${createdInvoice.invoice_number}`,
                            activityType: `Create`,
                            documentID: createdInvoice.pk_invoice_id,
                            documentType: "Invoices",
                            userOwner: fullname || "Undefined User",
                        });

                        console.log("New invoice items created successfully");
                        // toast.success("Invoice items created successfully");
                    })
                    .catch((error) => {
                        setIsSaving(false);
                        console.error("Failed to create new invoice items:", error);
                        toast.error("Failed to create invoice items");
                    });

                if (ordersNumber && ordersNumber.length > 0) {
                    // @ts-ignore
                    await createActivityHistory.mutateAsync({
                        customerID: currentCustomerID,
                        status: invoiceStatus,
                        tags: "",
                        activity: `Invoice #${createdInvoice.invoice_number} created from Order #${ordersNumber}`,
                        activityType: `Create`,
                        documentID: ordersID,
                        documentType: "Orders",
                        userOwner: fullname || "Undefined User",
                    });
                }    
            }

            toast.success(`Invoice ${createdInvoice.pk_invoice_id} items created successfully`);
            console.log("Invoice created successfully:", createdInvoice);

            router.push(`/crm/invoices/${new_invoice_id}`);
        } catch (error) {
            setIsSaving(false);
            console.error("Failed to create invoice:", error);
        }
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

    React.useEffect(() => {
        if(customerID && customerID > 0) {
            setCurrentCustomerID(customerID);
        }
    }, [customerID])

    React.useEffect(() => {
        console.log("contactBilling", contactBilling);
    }, [contactBilling]);

    React.useEffect(() => {
        if (dataContactCustomerBilling) {
            setContactBilling(dataContactCustomerBilling);
        } else {
            setContactBilling(dataContactCustomerPrimary || null);
        }

        if (dataContactCustomerShipping) {
            setContactShipping(dataContactCustomerShipping);
        } else {
            setContactShipping(dataContactCustomerPrimary || null);
        }
    }, [dataContactCustomerPrimary, 
        dataContactCustomerBilling, 
        dataContactCustomerShipping]);

    React.useEffect(() => {
        if (dataAddressCustomersBilling) {
            setAddressBilling(dataAddressCustomersBilling || null);
        }

        if (dataAddressCustomersShipping) {
            setAddressShipping(dataAddressCustomersShipping || null);
        }

    }, [dataAddressCustomersBilling, 
        dataAddressCustomersShipping]);

    React.useEffect(() => {
        if(fetchedCustomer) {
            setCustomerData(mapToCustomerQuotesTypes(fetchedCustomer));

            if (fetchedCustomer.notes && !modifyNotes) {
                setInvoiceNotes(`${fetchedCustomer.notes}` || "");
            }
        }
    }, [fetchedCustomer]);

    React.useEffect(() => {
        if(invoiceItems && invoiceItems.length > 0) {
            const totalQuantity = invoiceItems.reduce(
                (sum, item) => sum + item.quantity, 0);
            const totalUnitPrice = invoiceItems.reduce(
                (sum, item) => sum + item.unitPrice, 0);
            const taxRate = invoiceItems[0].taxRate;
            const totalSub = invoiceItems.reduce((sum, item) => sum + item.total, 0);

            setInvoiceSummary({
                addedQuantity: totalQuantity,
                addedUnitPrice: totalUnitPrice,
                addedTaxRate: taxRate,
                addedLineTotal: totalSub,
                paid: 0,
            })
        }
    }, [invoiceItems]);

    React.useEffect(() => {
        if (dataOrderItems && dataOrderItems.items.length > 0) {
            const normalizeData = dataOrderItems.items.map((data, index) => {
                return {
                    invoiceItemsID: -1,
                    categoryID: data?.products_category_data?.id || -1,
                    categoryName: data?.products_category_data?.name || "",
                    productID: data?.products_data?.id || -1,
                    itemNumber: data?.item_number || "",
                    itemName: data?.item_name || "",
                    itemDescription: data?.item_description || "",
                    quantity: data?.quantity || 0,
                    unitPrice: parseFloat(`${data?.unit_price}`) || 0,
                    taxRate: 0.08,
                    total: parseFloat(`${data?.line_total}`) || 0,
                    actionCreate: false,
                    actionModify: false,
                    actionEdited: false,
                    errorState: [],
                }
            });

            setInvoiceItems(normalizeData)
        }
    }, [dataOrderItems])

    return (
        <div className="flex flex-col gap-y-6 p-4">
            <InvoiceDetailsHeaders
                add={true}
                status={invoiceStatus}
                setStatus={setInvoiceStatus}
                handleUpdateClick={handleSaveInvoiceClick}
                isSaving={isSaving}
            />

            <InfoBox
                title={ordersNumber.length > 0 ? `Create New Invoice from Order # ${ordersNumber}` : `Create New Invoice`}
                subtitle="Select a customer and add items to your invoice. Once saved, the invoice will be available in the invoices list."
            />

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
                documentNotes={invoiceNotes}
                setDocumentNotes={setInvoiceNotes}
                setModifyNotes={setModifyNotes}
            />

            <InvoiceDetailsInfo
                invoiceDate={invoiceDetailsData.invoiceDate}
                setInvoiceDate={(e) => setInvoiceDetailsData(prevState => ({ ...prevState, invoiceDate: e }))}
                terms={invoiceDetailsData.terms}
                setTerms={(e) => setInvoiceDetailsData(prevState => ({ ...prevState, terms: e }))}
                dueDate={invoiceDetailsData.dueDate}
                setDueDate={(e) => setInvoiceDetailsData(prevState => ({ ...prevState, dueDate: e }))}
            />

            <InvoiceItems
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                setModifyFlag={setModifyStatus}
            />

            <ItemsSummary invoiceSummary={invoiceSummary} />
        </div>
    );
}

export default InvoicesAdd;
