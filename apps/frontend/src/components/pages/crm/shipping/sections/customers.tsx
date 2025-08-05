"use client";

import * as React from "react";
import {
  Edit,
  SquarePen,
  User,
  X,
  Loader2,
  FileText,
  Truck,
  StickyNote,
  Mail,
} from "lucide-react";
import { Customer as CustomerQuotesTypes } from "@/services/quotes/types";
import { Button } from "@/components/ui/button";

import { useAddressMutations } from "../../../../../hooks/useAddresses";

import { useCustomerMutations } from "../../../../../hooks/useCustomers2";
import {
  useContactMutations,
  useContactByReference,
} from "../../../../../hooks/useContacts";
import { useAddressByForeignKey } from "../../../../../hooks/useAddresses";
import { Contact, ContactTypeEnums } from "@/services/contacts/types";
import { AddressTypeEnums } from "@/services/addresses/types";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CustomerSelectDialog } from "@/components/dialogs/customer-select-dialog";

import {
  ContactEditDialog,
  ContactFormData,
} from "@/components/dialogs/contact-edit-dialog";
import { ContactCard } from "../../quotes-details/sections/contact-card";

interface ComponentsProps {
  data: CustomerQuotesTypes | null;
  customerID: number;
  setCustomerID: React.Dispatch<React.SetStateAction<number>>;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  customerLoading?: boolean;
  setCustomerChange?: (tick: boolean) => void;
}

interface AddressTypes {
  pk_contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
  contact_type: string;
}

const initialContactData = {
  pk_contact_id: -1,
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  mobile_number: "",
  position_title: "",
  contact_type: "",
};

// Address data shape and initial state
interface AddressInfo {
  pk_address_id: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: string;
}

const initialAddressData: AddressInfo = {
  pk_address_id: -1,
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  address_type: "",
};

const Customers = ({
  data,
  customerID,
  setCustomerID,
  setModifyFlag,
  customerLoading,
  setCustomerChange,
}: ComponentsProps) => {
  const [selectCustomer, setSelectCustomer] = React.useState<boolean>(false);

  const [editBilling, setEditBilling] = React.useState(false);
  const [editShipping, setEditShipping] = React.useState(false);
  const [editNotes, setEditNotes] = React.useState(false);
  const [editContacts, setEditContacts] = React.useState(false);

  // New state for selected customer
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<
    number | null
  >(null);

  const [billingContact, setBillingContact] =
    React.useState<AddressTypes>(initialContactData);

  const [shippingContact, setShippingContact] =
    React.useState<AddressTypes>(initialContactData);

  const [notesData, setNotesData] = React.useState<string>("");

  // Address states
  const [billingAddress, setBillingAddress] =
    React.useState<AddressInfo>(initialAddressData);

  const [shippingAddress, setShippingAddress] =
    React.useState<AddressInfo>(initialAddressData);

  // modal control
  const [billingModalOpen, setBillingModalOpen] = React.useState(false);
  const [shippingModalOpen, setShippingModalOpen] = React.useState(false);

  // Derived display helpers
  const customerName = data?.name || "";
  const contactsName = `${data?.contact_primary?.first_name || ""} ${
    data?.contact_primary?.last_name || ""
  }`.trim();
  const contactsEmail = data?.contact_primary?.email || "";

  const customerNotes = data?.notes || "";

  const {
    createAddress,
    updateAddress,
    loading: addressLoading,
    error: addressError,
  } = useAddressMutations();

  const {
    updateCustomerNotes,
    updateCustomer,
    loading: notesLoading,
    error: notesError,
  } = useCustomerMutations();

  const {
    createContact,
    updateContact,
    loading: contactLoading,
    error: contactError,
  } = useContactMutations();

  // Fetch customer contacts by reference (similar to orders implementation)
  const { data: dataContactCustomerPrimary } = useContactByReference(
    customerID,
    "Customers",
    ContactTypeEnums.PRIMARY
  );

  const { data: dataContactCustomerBilling } = useContactByReference(
    customerID,
    "Customers",
    ContactTypeEnums.BILLING
  );

  const { data: dataContactCustomerShipping } = useContactByReference(
    customerID,
    "Customers",
    ContactTypeEnums.SHIPPING
  );

  // Fetch customer addresses by reference
  const { data: dataCustomerAddressBilling } = useAddressByForeignKey({
    fk_id: customerID,
    table: "Customers",
    address_type: AddressTypeEnums.BILLING,
  });

  const { data: dataCustomerAddressShipping } = useAddressByForeignKey({
    fk_id: customerID,
    table: "Customers",
    address_type: AddressTypeEnums.SHIPPING,
  });

  // Handle customer selection
  const handleCustomerSelect = (customerId: number) => {
    setCustomerID(customerId);
    setModifyFlag(true);

    if (setCustomerChange) setCustomerChange(true);

    setTimeout(() => {
      setSelectCustomer(false);
    }, 500);
  };

  const handleSaveBilling = async (contactToUpdate: any) => {
    if (
      !contactToUpdate.pk_contact_id ||
      contactToUpdate.pk_contact_id === -1
    ) {
      // Create new billing contact
      const createData = {
        fk_id: data?.pk_customer_id || 1,
        first_name: contactToUpdate.first_name,
        last_name: contactToUpdate.last_name,
        email: contactToUpdate.email,
        phone_number: contactToUpdate.phone_number,
        mobile_number: contactToUpdate.mobile_number,
        position_title: contactToUpdate.position_title,
        contact_type: "BILLING",
        table: "Customers",
      };

      try {
        const result = await handleCreateContact(createData);
        if (result?.pk_contact_id) {
          setBillingContact((prev) => ({
            ...prev,
            pk_contact_id: result.pk_contact_id,
          }));
        }
        setEditBilling(false);
        setModifyFlag(true);
      } catch (error) {
        console.error("Error creating billing contact:", error);
      }
    } else {
      // Update existing billing contact
      try {
        await handleSaveContacts(contactToUpdate);
        setEditBilling(false);
        setModifyFlag(true);
      } catch (error) {
        console.error("Error updating billing contact:", error);
      }
    }
  };

  const handleSaveShipping = async (contactToUpdate: any) => {
    if (
      !contactToUpdate.pk_contact_id ||
      contactToUpdate.pk_contact_id === -1
    ) {
      // Create new shipping contact
      const createData = {
        fk_id: data?.pk_customer_id || 1,
        first_name: contactToUpdate.first_name,
        last_name: contactToUpdate.last_name,
        email: contactToUpdate.email,
        phone_number: contactToUpdate.phone_number,
        mobile_number: contactToUpdate.mobile_number,
        position_title: contactToUpdate.position_title,
        contact_type: "SHIPPING",
        table: "Customers",
      };

      try {
        const result = await handleCreateContact(createData);
        if (result?.pk_contact_id) {
          setShippingContact((prev) => ({
            ...prev,
            pk_contact_id: result.pk_contact_id,
          }));
        }
        setEditShipping(false);
        setModifyFlag(true);
      } catch (error) {
        console.error("Error creating shipping contact:", error);
      }
    } else {
      // Update existing shipping contact
      try {
        await handleSaveContacts(contactToUpdate);
        setEditShipping(false);
        setModifyFlag(true);
      } catch (error) {
        console.error("Error updating shipping contact:", error);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!data?.pk_customer_id) {
      console.error("No customer ID found");
      return;
    }

    const result = await updateCustomerNotes(data.pk_customer_id, notesData);

    if (result) {
      setNotesData(notesData);
      setEditNotes(false);
      console.log("Customer notes updated successfully");
    }
  };

  const handleCreateContact = async (contactData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    mobile_number: string;
    position_title: string;
    contact_type: string;
  }) => {
    if (!data?.pk_customer_id) {
      console.error("No customer ID found");
      return;
    }

    const createPayload = {
      fk_id: data.pk_customer_id,
      firstname: contactData.first_name,
      lastname: contactData.last_name,
      email: contactData.email,
      phoneNumber: contactData.phone_number,
      mobileNumber: contactData.mobile_number,
      positionTitle: contactData.position_title,
      contactType: contactData.contact_type,
      table: "Customers",
    };

    try {
      const result = await createContact(createPayload);
      console.log("Contact created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  };

  const handleSaveContacts = async (updatedContact: any) => {
    if (!data?.pk_customer_id) {
      console.error("No customer ID found");
      return;
    }

    try {
      // Make sure we have a valid contact ID
      if (!updatedContact.pk_contact_id) {
        throw new Error("Invalid contact ID");
      }

      const updateData = {
        firstname: updatedContact.first_name,
        lastname: updatedContact.last_name,
        email: updatedContact.email,
        phoneNumber: updatedContact.phone_number || "",
        mobileNumber: updatedContact.mobile_number || "",
        positionTitle: updatedContact.position_title || "",
        contactType: updatedContact.contact_type || "PRIMARY",
      };

      const result = await updateContact({
        id: updatedContact.pk_contact_id,
        data: updateData,
      });

      if (result) {
        // Map the response back to our local format
        const updatedLocalContact = {
          pk_contact_id: result.pk_contact_id,
          first_name: result.first_name,
          last_name: result.last_name,
          email: result.email,
          phone_number: result.phone_number,
          mobile_number: result.mobile_number,
          position_title: result.position_title,
          contact_type: result.contact_type,
        };

        // Update local state with the new data
        if (updatedContact.contact_type === "BILLING") {
          setBillingContact(updatedLocalContact);
        } else if (updatedContact.contact_type === "SHIPPING") {
          setShippingContact(updatedLocalContact);
        }

        // Trigger a modification flag update to refresh the parent data
        setModifyFlag(true);

        // Close the edit mode
        setEditContacts(false);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  };

  // ---- Modal Save Handlers ----
  const handleBillingModalSave = async (form: ContactFormData) => {
    // Create the updated contact data
    const updatedBillingContact = {
      ...billingContact,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone_number: form.phone_number,
      mobile_number: form.mobile_number,
      position_title: form.position_title,
      contact_type: "BILLING",
    };

    // Save the contact first
    await handleSaveBilling(updatedBillingContact);

    // Create the updated address data
    const updatedAddress = {
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    };

    try {
      // Update the address
      if (
        !billingAddress.pk_address_id ||
        billingAddress.pk_address_id === -1
      ) {
        const result = await createAddress({
          fk_id: data?.pk_customer_id || 1,
          ...updatedAddress,
          address_type: "BILLING",
          table: "Customers",
        });

        // Update billing address state with new ID and data
        if (result?.pk_address_id) {
          setBillingAddress({
            ...updatedAddress,
            pk_address_id: result.pk_address_id,
            address_type: "BILLING",
          });
        }
      } else {
        await updateAddress({
          id: billingAddress.pk_address_id,
          data: updatedAddress,
        });

        // Update billing address state with new data
        setBillingAddress({
          ...billingAddress,
          ...updatedAddress,
        });
      }

      // Update states after successful save
      setBillingContact(updatedBillingContact);
      setModifyFlag(true);
      setBillingModalOpen(false);
    } catch (error) {
      console.error("Error updating billing address:", error);
    }
  };

  const handleShippingModalSave = async (form: ContactFormData) => {
    // Create the updated contact data
    const updatedShippingContact = {
      ...shippingContact,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone_number: form.phone_number,
      mobile_number: form.mobile_number,
      position_title: form.position_title,
      contact_type: "SHIPPING",
    };

    // Save the contact first
    await handleSaveShipping(updatedShippingContact);

    // Create the updated address data
    const updatedAddress = {
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    };

    try {
      // Update the address
      if (
        !shippingAddress.pk_address_id ||
        shippingAddress.pk_address_id === -1
      ) {
        const result = await createAddress({
          fk_id: data?.pk_customer_id || 1,
          ...updatedAddress,
          address_type: "SHIPPING",
          table: "Customers",
        });

        // Update shipping address state with new ID and data
        if (result?.pk_address_id) {
          setShippingAddress({
            ...updatedAddress,
            pk_address_id: result.pk_address_id,
            address_type: "SHIPPING",
          });
        }
      } else {
        await updateAddress({
          id: shippingAddress.pk_address_id,
          data: updatedAddress,
        });

        // Update shipping address state with new data
        setShippingAddress({
          ...shippingAddress,
          ...updatedAddress,
        });
      }

      // Update states after successful save
      setShippingContact(updatedShippingContact);
      setModifyFlag(true);
      setShippingModalOpen(false);
    } catch (error) {
      console.error("Error updating shipping address:", error);
    }
  };

  React.useEffect(() => {
    if (data) {
      // Handle contacts - check if it's an array or object
      let billingContacts: any = null;
      let shippingContacts: any = null;

      if (Array.isArray(data.contacts)) {
        // First try to find specific BILLING contact
        billingContacts = data.contacts.find(
          (contact) => contact.contact_type === "BILLING"
        );
        // If no BILLING contact found, use PRIMARY as fallback
        if (!billingContacts) {
          billingContacts = data.contacts.find(
            (contact) => contact.contact_type === "PRIMARY"
          );
        }

        // First try to find specific SHIPPING contact
        shippingContacts = data.contacts.find(
          (contact) => contact.contact_type === "SHIPPING"
        );
        // If no SHIPPING contact found, use PRIMARY as fallback
        if (!shippingContacts) {
          shippingContacts = data.contacts.find(
            (contact) => contact.contact_type === "PRIMARY"
          );
        }
      } else {
        // If contacts is a single object, check if it has contact_type property
        if (
          data.contacts &&
          typeof data.contacts === "object" &&
          "contact_type" in data.contacts
        ) {
          const contactsObj = data.contacts as any;
          // For single contact object, apply same priority logic
          if (contactsObj.contact_type === "BILLING") {
            billingContacts = contactsObj;
          } else if (contactsObj.contact_type === "SHIPPING") {
            shippingContacts = contactsObj;
          } else if (contactsObj.contact_type === "PRIMARY") {
            // Use PRIMARY as fallback for both if specific types not found
            if (!billingContacts) billingContacts = contactsObj;
            if (!shippingContacts) shippingContacts = contactsObj;
          }
        }
      }

      // Set billing data
      if (billingContacts) {
        setBillingContact({
          pk_contact_id: billingContacts.pk_contact_id || -1,
          first_name: billingContacts.first_name || "",
          last_name: billingContacts.last_name || "",
          email: billingContacts.email || "",
          phone_number: billingContacts.phone_number || "",
          mobile_number: billingContacts.mobile_number || "",
          position_title: billingContacts.position_title || "",
          contact_type: billingContacts.contact_type || "PRIMARY",
        });
      } else {
        setBillingContact(initialContactData);
      }

      // Set shipping data
      if (shippingContacts) {
        setShippingContact({
          pk_contact_id: shippingContacts.pk_contact_id || -1,
          first_name: shippingContacts.first_name || "",
          last_name: shippingContacts.last_name || "",
          email: shippingContacts.email || "",
          phone_number: shippingContacts.phone_number || "",
          mobile_number: shippingContacts.mobile_number || "",
          position_title: shippingContacts.position_title || "",
          contact_type: shippingContacts.contact_type || "PRIMARY",
        });
      } else {
        setShippingContact(initialContactData);
      }

      // ------------------- Address handling ------------------- //
      let billingAddr: any = null;
      let shippingAddr: any = null;

      if (Array.isArray(data.addresses)) {
        billingAddr = data.addresses.find(
          (addr) => addr.address_type === "BILLING"
        );
        shippingAddr = data.addresses.find(
          (addr) => addr.address_type === "SHIPPING"
        );
      } else if (
        data.addresses &&
        typeof data.addresses === "object" &&
        "address_type" in data.addresses
      ) {
        const addrObj = data.addresses as any;
        if (addrObj.address_type === "BILLING") billingAddr = addrObj;
        else if (addrObj.address_type === "SHIPPING") shippingAddr = addrObj;
        else {
          // Fallback use single address for both
          billingAddr = addrObj;
          shippingAddr = addrObj;
        }
      }

      // Set billing address state
      if (billingAddr) {
        setBillingAddress({
          pk_address_id: billingAddr.pk_address_id || -1,
          address1: billingAddr.address1 || "",
          address2: billingAddr.address2 || "",
          city: billingAddr.city || "",
          state: billingAddr.state || "",
          zip: billingAddr.zip || "",
          country: billingAddr.country || "",
          address_type: billingAddr.address_type || "BILLING",
        });
      } else {
        setBillingAddress(initialAddressData);
      }

      // Set shipping address state
      if (shippingAddr) {
        setShippingAddress({
          pk_address_id: shippingAddr.pk_address_id || -1,
          address1: shippingAddr.address1 || "",
          address2: shippingAddr.address2 || "",
          city: shippingAddr.city || "",
          state: shippingAddr.state || "",
          zip: shippingAddr.zip || "",
          country: shippingAddr.country || "",
          address_type: shippingAddr.address_type || "SHIPPING",
        });
      } else {
        setShippingAddress(initialAddressData);
      }

      // Set notes data
      if (customerNotes && customerNotes.length > 0) {
        setNotesData(customerNotes);
      }
    }
  }, [data, customerNotes]);

  // Update contacts when customer data or fetched contacts change (similar to orders implementation)
  React.useEffect(() => {
    if (dataContactCustomerBilling) {
      setBillingContact({
        pk_contact_id: dataContactCustomerBilling.pk_contact_id || -1,
        first_name: dataContactCustomerBilling.first_name || "",
        last_name: dataContactCustomerBilling.last_name || "",
        email: dataContactCustomerBilling.email || "",
        phone_number: dataContactCustomerBilling.phone_number || "",
        mobile_number: dataContactCustomerBilling.mobile_number || "",
        position_title: dataContactCustomerBilling.position_title || "",
        contact_type: dataContactCustomerBilling.contact_type || "BILLING",
      });
    } else if (dataContactCustomerPrimary) {
      setBillingContact({
        pk_contact_id: dataContactCustomerPrimary.pk_contact_id || -1,
        first_name: dataContactCustomerPrimary.first_name || "",
        last_name: dataContactCustomerPrimary.last_name || "",
        email: dataContactCustomerPrimary.email || "",
        phone_number: dataContactCustomerPrimary.phone_number || "",
        mobile_number: dataContactCustomerPrimary.mobile_number || "",
        position_title: dataContactCustomerPrimary.position_title || "",
        contact_type: "BILLING",
      });
    }

    if (dataContactCustomerShipping) {
      setShippingContact({
        pk_contact_id: dataContactCustomerShipping.pk_contact_id || -1,
        first_name: dataContactCustomerShipping.first_name || "",
        last_name: dataContactCustomerShipping.last_name || "",
        email: dataContactCustomerShipping.email || "",
        phone_number: dataContactCustomerShipping.phone_number || "",
        mobile_number: dataContactCustomerShipping.mobile_number || "",
        position_title: dataContactCustomerShipping.position_title || "",
        contact_type: dataContactCustomerShipping.contact_type || "SHIPPING",
      });
    } else if (dataContactCustomerPrimary) {
      setShippingContact({
        pk_contact_id: dataContactCustomerPrimary.pk_contact_id || -1,
        first_name: dataContactCustomerPrimary.first_name || "",
        last_name: dataContactCustomerPrimary.last_name || "",
        email: dataContactCustomerPrimary.email || "",
        phone_number: dataContactCustomerPrimary.phone_number || "",
        mobile_number: dataContactCustomerPrimary.mobile_number || "",
        position_title: dataContactCustomerPrimary.position_title || "",
        contact_type: "SHIPPING",
      });
    }
  }, [
    dataContactCustomerPrimary,
    dataContactCustomerBilling,
    dataContactCustomerShipping,
    customerID,
  ]);

  // Update addresses when customer data or fetched addresses change
  React.useEffect(() => {
    if (dataCustomerAddressBilling) {
      setBillingAddress({
        pk_address_id: dataCustomerAddressBilling.pk_address_id || -1,
        address1: dataCustomerAddressBilling.address1 || "",
        address2: dataCustomerAddressBilling.address2 || "",
        city: dataCustomerAddressBilling.city || "",
        state: dataCustomerAddressBilling.state || "",
        zip: dataCustomerAddressBilling.zip || "",
        country: dataCustomerAddressBilling.country || "",
        address_type: dataCustomerAddressBilling.address_type || "BILLING",
      });
    }

    if (dataCustomerAddressShipping) {
      setShippingAddress({
        pk_address_id: dataCustomerAddressShipping.pk_address_id || -1,
        address1: dataCustomerAddressShipping.address1 || "",
        address2: dataCustomerAddressShipping.address2 || "",
        city: dataCustomerAddressShipping.city || "",
        state: dataCustomerAddressShipping.state || "",
        zip: dataCustomerAddressShipping.zip || "",
        country: dataCustomerAddressShipping.country || "",
        address_type: dataCustomerAddressShipping.address_type || "SHIPPING",
      });
    }
  }, [dataCustomerAddressBilling, dataCustomerAddressShipping]);

  return (
    <div className="flex flex-col gap-4">
      {/* Customer Information Card - Top Wide Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        {/* header: icon + label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-100 rounded-full p-2">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">
            Customer Information
          </h2>
        </div>

        {/* body */}
        {customerLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">
                Loading customer information...
              </span>
            </div>
          </div>
        ) : data ? (
          <div className="flex gap-4">
            {/* Customer Avatar/Logo */}
            <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>

            {/* Customer details */}
            <div className="space-y-2 text-sm text-gray-700">
              {/* Customer name + tagline */}
              <div>
                <p className="font-semibold text-gray-900">
                  {customerName || "Unknown Customer"}
                </p>
                <p className="text-gray-500">Premium Customer</p>
              </div>

              {/* Contact info */}
              <div className="flex items-start gap-2">
                <User size={14} className="mt-px text-gray-400" />
                <span>{contactsName || "No contact name"}</span>
              </div>

              {/* Email */}
              {contactsEmail && (
                <div className="flex items-start gap-2">
                  <Mail size={14} className="mt-px text-gray-400" />
                  <span>{contactsEmail}</span>
                </div>
              )}

              {/* Change Customer Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-xs"
                  onClick={() => setSelectCustomer(true)}
                  disabled={customerLoading}
                  size="sm"
                >
                  <Edit className="h-3 w-3" />
                  Change Customer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-gray-50 rounded-full p-3 mx-auto w-fit mb-2">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              No customer selected
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Select a customer to begin creating your shipment
            </p>
            <Button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-xs"
              onClick={() => setSelectCustomer(true)}
              disabled={customerLoading}
              size="sm"
            >
              <Edit className="h-3 w-3" />
              Select Customer
            </Button>
          </div>
        )}
      </div>

      {/* Three Card Layout: Billing Contact, Shipping Contact, and Notes - All Equal Width */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Billing Contact Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 rounded-full p-2">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Billing Contact
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 ml-auto"
              onClick={() => setBillingModalOpen(true)}
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          </div>

          {customerLoading ? (
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
          ) : (dataContactCustomerBilling || dataContactCustomerPrimary) &&
            dataCustomerAddressBilling ? (
            <div className="space-y-4 text-sm">
              {/* Name and Title - Close together */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 text-base">
                  {`${
                    dataContactCustomerBilling?.first_name ||
                    dataContactCustomerPrimary?.first_name ||
                    ""
                  } ${
                    dataContactCustomerBilling?.last_name ||
                    dataContactCustomerPrimary?.last_name ||
                    ""
                  }`.trim() || "N/A"}
                </p>
                <p className="text-gray-600">
                  {dataContactCustomerBilling?.position_title ||
                    dataContactCustomerPrimary?.position_title ||
                    "N/A"}
                </p>
              </div>

              {/* Company */}
              <div className="space-y-1">
                <p className="text-gray-600">{customerName || "N/A"}</p>
                <p className="text-gray-600">
                  {`${dataCustomerAddressBilling.address1 || ""} ${
                    dataCustomerAddressBilling.address2
                      ? `, ${dataCustomerAddressBilling.address2}`
                      : ""
                  }`.trim() || "N/A"}
                  {dataCustomerAddressBilling.city &&
                    `, ${dataCustomerAddressBilling.city}`}
                  {dataCustomerAddressBilling.state &&
                    `, ${dataCustomerAddressBilling.state}`}
                  {dataCustomerAddressBilling.zip &&
                    `, ${dataCustomerAddressBilling.zip}`}
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <p className="text-gray-600">
                  Phone:{" "}
                  {dataContactCustomerBilling?.phone_number ||
                    dataContactCustomerPrimary?.phone_number ||
                    "N/A"}
                </p>
                <p className="text-gray-600">
                  Email:{" "}
                  {dataContactCustomerBilling?.email ||
                    dataContactCustomerPrimary?.email ||
                    "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-gray-500">
              No billing contact available
            </p>
          )}
        </div>

        {/* Shipping Contact Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 rounded-full p-2">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Shipping Contact
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 ml-auto"
              onClick={() => setShippingModalOpen(true)}
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          </div>

          {customerLoading ? (
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
          ) : (dataContactCustomerShipping || dataContactCustomerPrimary) &&
            dataCustomerAddressShipping ? (
            <div className="space-y-4 text-sm">
              {/* Name and Title - Close together */}
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 text-base">
                  {`${
                    dataContactCustomerShipping?.first_name ||
                    dataContactCustomerPrimary?.first_name ||
                    ""
                  } ${
                    dataContactCustomerShipping?.last_name ||
                    dataContactCustomerPrimary?.last_name ||
                    ""
                  }`.trim() || "N/A"}
                </p>
                <p className="text-gray-600">
                  {dataContactCustomerShipping?.position_title ||
                    dataContactCustomerPrimary?.position_title ||
                    "N/A"}
                </p>
              </div>

              {/* Company */}
              <div className="space-y-1">
                <p className="text-gray-600">{customerName || "N/A"}</p>
                <p className="text-gray-600">
                  {`${dataCustomerAddressShipping.address1 || ""} ${
                    dataCustomerAddressShipping.address2
                      ? `, ${dataCustomerAddressShipping.address2}`
                      : ""
                  }`.trim() || "N/A"}
                  {dataCustomerAddressShipping.city &&
                    `, ${dataCustomerAddressShipping.city}`}
                  {dataCustomerAddressShipping.state &&
                    `, ${dataCustomerAddressShipping.state}`}
                  {dataCustomerAddressShipping.zip &&
                    `, ${dataCustomerAddressShipping.zip}`}
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <p className="text-gray-600">
                  Phone:{" "}
                  {dataContactCustomerShipping?.phone_number ||
                    dataContactCustomerPrimary?.phone_number ||
                    "N/A"}
                </p>
                <p className="text-gray-600">
                  Email:{" "}
                  {dataContactCustomerShipping?.email ||
                    dataContactCustomerPrimary?.email ||
                    "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-gray-500">
              No shipping contact available
            </p>
          )}
        </div>

        {/* Customer Notes Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <StickyNote className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Customer Notes
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 ml-auto"
              onClick={() => setEditNotes(!editNotes)}
            >
              {editNotes ? (
                <X className="h-4 w-4" />
              ) : (
                <SquarePen className="h-4 w-4" />
              )}
            </Button>
          </div>

          {customerLoading ? (
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
          ) : !editNotes ? (
            notesData ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-gray-700">{notesData}</p>
              </div>
            ) : (
              <p className="text-xs italic text-gray-500">
                No notes available. Click edit to add notes.
              </p>
            )
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="min-h-[80px] w-full border rounded-md p-2 text-sm"
                value={notesData}
                onChange={(e) => setNotesData(e.target.value)}
                placeholder="Enter shipping notes..."
              />
              <Button
                size="sm"
                className="self-end"
                disabled={notesLoading}
                onClick={handleSaveNotes}
              >
                {notesLoading ? "Saving…" : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CustomerSelectDialog
        open={selectCustomer}
        onOpenChange={setSelectCustomer}
        onSelectCustomer={handleCustomerSelect}
      />

      {/* Billing Contact Modal */}
      <ContactEditDialog
        open={billingModalOpen}
        onOpenChange={setBillingModalOpen}
        loading={contactLoading}
        title="Edit Billing Contact"
        initialData={{
          first_name: billingContact.first_name,
          last_name: billingContact.last_name,
          email: billingContact.email,
          position_title: billingContact.position_title,
          phone_number: billingContact.phone_number,
          mobile_number: billingContact.mobile_number,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          city: billingAddress.city,
          state: billingAddress.state,
          zip: billingAddress.zip,
          country: billingAddress.country,
        }}
        onSave={handleBillingModalSave}
      />

      {/* Shipping Contact Modal */}
      <ContactEditDialog
        open={shippingModalOpen}
        onOpenChange={setShippingModalOpen}
        loading={contactLoading}
        title="Edit Shipping Contact"
        initialData={{
          first_name: shippingContact.first_name,
          last_name: shippingContact.last_name,
          email: shippingContact.email,
          position_title: shippingContact.position_title,
          phone_number: shippingContact.phone_number,
          mobile_number: shippingContact.mobile_number,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        }}
        onSave={handleShippingModalSave}
      />
    </div>
  );
};

export default Customers;
