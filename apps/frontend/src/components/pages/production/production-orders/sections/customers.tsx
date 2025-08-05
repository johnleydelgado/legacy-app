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
import { Customer as CustomerTypes } from "@/services/quotes/types";
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

// TODO: Add contact edit dialog imports when needed

interface ComponentsProps {
  data: CustomerTypes | null;
  customerID: number;
  setCustomerID: React.Dispatch<React.SetStateAction<number>>;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  customerLoading?: boolean;
  setCustomerChange?: (tick: boolean) => void;
}

interface ContactInfo {
  pk_contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
  contact_type: string;
}

const initialContactData: ContactInfo = {
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
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: string;
}

const initialAddressData: AddressInfo = {
  pk_address_id: -1,
  address1: "",
  address2: null,
  city: "",
  state: "",
  zip: "",
  country: "",
  address_type: "",
};

// Simple contact card component
const ContactCard: React.FC<{
  title: string;
  contact: ContactInfo;
  address: AddressInfo;
  onEdit: () => void;
  loading?: boolean;
}> = ({ title, contact, address, onEdit, loading = false }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <Button variant="ghost" size="sm" onClick={onEdit} disabled={loading}>
        <Edit className="h-4 w-4" />
      </Button>
    </div>
    
    <div className="space-y-2 text-sm">
      {contact.first_name || contact.last_name ? (
        <p className="font-medium">
          {`${contact.first_name} ${contact.last_name}`.trim()}
        </p>
      ) : null}
      
      {contact.email && <p className="text-gray-600">{contact.email}</p>}
      
      {contact.phone_number && (
        <p className="text-gray-600">Phone: {contact.phone_number}</p>
      )}
      
      {contact.mobile_number && (
        <p className="text-gray-600">Mobile: {contact.mobile_number}</p>
      )}
      
      {address.address1 && (
        <div className="text-gray-600">
          <p>{address.address1}</p>
          {address.address2 && <p>{address.address2}</p>}
          <p>
            {address.city}, {address.state} {address.zip}
          </p>
          {address.country && <p>{address.country}</p>}
        </div>
      )}
    </div>
  </div>
);

const Customers = ({
  data,
  customerID,
  setCustomerID,
  setModifyFlag,
  customerLoading,
  setCustomerChange,
}: ComponentsProps) => {
  const [selectCustomer, setSelectCustomer] = React.useState<boolean>(false);
  
  const [billingContact, setBillingContact] = React.useState<ContactInfo>(initialContactData);
  const [shippingContact, setShippingContact] = React.useState<ContactInfo>(initialContactData);
  const [notesData, setNotesData] = React.useState<string>("");

  // Address states
  const [billingAddress, setBillingAddress] = React.useState<AddressInfo>(initialAddressData);
  const [shippingAddress, setShippingAddress] = React.useState<AddressInfo>(initialAddressData);

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

  // Fetch customer contacts by reference
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
    setSelectCustomer(false);
  };

  // Update local states when data changes
  React.useEffect(() => {
    if (dataContactCustomerBilling) {
      setBillingContact(dataContactCustomerBilling);
    }
  }, [dataContactCustomerBilling]);

  React.useEffect(() => {
    if (dataContactCustomerShipping) {
      setShippingContact(dataContactCustomerShipping);
    }
  }, [dataContactCustomerShipping]);

  React.useEffect(() => {
    if (dataCustomerAddressBilling) {
      setBillingAddress(dataCustomerAddressBilling);
    }
  }, [dataCustomerAddressBilling]);

  React.useEffect(() => {
    if (dataCustomerAddressShipping) {
      setShippingAddress(dataCustomerAddressShipping);
    }
  }, [dataCustomerAddressShipping]);

  React.useEffect(() => {
    if (data?.notes) {
      setNotesData(data.notes);
    }
  }, [data?.notes]);

  if (customerLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <p className="text-sm text-muted-foreground">Loading customer details...</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="flex-1 space-y-3 text-sm text-gray-700">
              {/* Customer name and basic info */}
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {customerName || "Unknown Customer"}
                </p>
                <p className="text-gray-500">Premium Customer</p>
              </div>

              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User size={14} className="mt-px text-gray-400" />
                  <div>
                    <span className="font-medium">{contactsName || "No contact name"}</span>
                    <p className="text-xs text-gray-500">Primary Contact</p>
                  </div>
                </div>

                {/* Email */}
                {contactsEmail && (
                  <div className="flex items-start gap-2">
                    <Mail size={14} className="mt-px text-gray-400" />
                    <span>{contactsEmail}</span>
                  </div>
                )}

                {/* Phone */}
                {data?.contact_primary?.phone_number && (
                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 mt-px text-gray-400">📞</div>
                    <span>{data.contact_primary.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Customer Notes */}
              {customerNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Notes:</p>
                  <p className="text-sm text-blue-800">{customerNotes}</p>
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
              Select a customer to begin creating your production order
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


      {/* Customer Selection Dialog */}
      <CustomerSelectDialog
        open={selectCustomer}
        onOpenChange={setSelectCustomer}
        onSelectCustomer={handleCustomerSelect}
      />

      {/* TODO: Add Contact Edit Dialogs when needed */}
    </div>
  );
};

export default Customers;