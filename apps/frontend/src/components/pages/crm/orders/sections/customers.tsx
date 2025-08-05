"use client";

import * as React from "react";
import {
  AlertCircle,
  Edit,
  SquarePen,
  User,
  X,
  Loader2,
} from "lucide-react";
import { Customer as CustomerQuotesTypes } from "@/services/quotes/types";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../ui/tooltip";
import { Address } from "../../../../../services/addresses/types";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CustomerSelectDialog } from "@/components/dialogs/customer-select-dialog";
import {
  ContactEditDialog,
  ContactFormData,
} from "@/components/dialogs/contact-edit-dialog";
import { ContactCard } from "./contact-card";
import { Contact, ContactTypeEnums } from "@/services/contacts/types";

interface ComponentsProps {
  data: CustomerQuotesTypes | null;
  setCustomerID: React.Dispatch<React.SetStateAction<number>>;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  customerLoading?: boolean;
  setCustomerChange?: (tick: boolean) => void;
  contactBilling: Contact | null;
  setContactBilling: React.Dispatch<React.SetStateAction<Contact | null>>;
  setModifyContactBilling?: React.Dispatch<React.SetStateAction<boolean>>;
  contactShipping: Contact | null;
  setContactShipping: React.Dispatch<React.SetStateAction<Contact | null>>;
  setModifyContactShipping?: React.Dispatch<React.SetStateAction<boolean>>;
  addressBilling: Address | null;
  setAddressBilling: React.Dispatch<React.SetStateAction<Address | null>>;
  setModifyAddressBilling?: React.Dispatch<React.SetStateAction<boolean>>;
  addressShipping: Address | null;
  setAddressShipping: React.Dispatch<React.SetStateAction<Address | null>>;
  setModifyAddressShipping?: React.Dispatch<React.SetStateAction<boolean>>;
  documentNotes: string;
  setDocumentNotes: React.Dispatch<React.SetStateAction<string>>;
  setModifyNotes?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Customers = ({
  data,
  setCustomerID,
  setModifyFlag,
  customerLoading,
  setCustomerChange,
  contactBilling,
  setContactBilling,
  setModifyContactBilling,
  contactShipping,
  setContactShipping,
  setModifyContactShipping,
  addressBilling,
  setAddressBilling,
  setModifyAddressBilling,
  addressShipping,
  setAddressShipping,
  setModifyAddressShipping,
  documentNotes: quotesNotes,
  setDocumentNotes: setQuotesNotes,
  setModifyNotes,
}: ComponentsProps) => {
  const [selectCustomer, setSelectCustomer] = React.useState<boolean>(false);
  const [editBilling, setEditBilling] = React.useState(false);
  const [editShipping, setEditShipping] = React.useState(false);
  const [editNotes, setEditNotes] = React.useState(false);
  const [editContacts, setEditContacts] = React.useState(false);

  // modal control
  const [billingModalOpen, setBillingModalOpen] = React.useState(false);
  const [shippingModalOpen, setShippingModalOpen] = React.useState(false);

  // Derived display helpers
  const customerName = data?.name || "";
  const contactsName = `${data?.contact_primary?.first_name || ""} ${
    data?.contact_primary?.last_name || ""
  }`.trim();
  const contactsEmail = data?.contact_primary?.email || "";

  // Handle customer selection
  const handleCustomerSelect = (customerId: number) => {
    setCustomerID(customerId);
    setModifyFlag(true);

    if (setCustomerChange) setCustomerChange(true);

    setTimeout(() => {
      setSelectCustomer(false);
    }, 500);
  };

  const handleSaveNotes = async () => {
    if (setModifyNotes) setModifyNotes(true);
    if (setModifyFlag) setModifyFlag(true);
    setEditNotes(false);
  };

  // ---- Modal Save Handlers ----
  const handleBillingModalSave = async (form: ContactFormData) => {
    if (!contactBilling) {
      console.error("No contact billing found");
      return;
    }

    setContactBilling({
      ...contactBilling,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone_number: form.phone_number,
      mobile_number: form.mobile_number,
      position_title: form.position_title,
      contact_type: ContactTypeEnums.BILLING
    });

    if (!addressBilling) {
      console.error("No address billing found");
      return;
    }

    setAddressBilling({
      ...addressBilling,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    });

    if (setModifyAddressBilling) setModifyAddressBilling(true);
    if (setModifyContactBilling) setModifyContactBilling(true);
    if (setModifyFlag) setModifyFlag(true);
  };

  const handleShippingModalSave = async (form: ContactFormData) => {
    if (!contactShipping) {
      console.error("No contact shipping found");
      return;
    }

    setContactShipping({
      ...contactShipping,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone_number: form.phone_number,
      mobile_number: form.mobile_number,
      position_title: form.position_title,
      contact_type: ContactTypeEnums.SHIPPING
    });

    if (!addressShipping) {
      console.error("No address shipping found");
      return;
    }

    setAddressShipping({
      ...addressShipping,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    });     

    if (setModifyAddressShipping) setModifyAddressShipping(true);
    if (setModifyContactShipping) setModifyContactShipping(true);
    if (setModifyFlag) setModifyFlag(true);
  };

  return (
    <div className="p-4 border border-gray-200 bg-white rounded-md mt-4">
      <Card className="bg-white border border-gray-200 text-gray-900 shadow-sm w-full rounded-md py-4">
        {/* header: icon + label share the same baseline */}
        <CardHeader className="border-b border-gray-100 px-6 h-10">
          <div className="flex items-center gap-2 h-full">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">
              Customer Information
            </span>
          </div>
        </CardHeader>

        {/* body */}
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4">
          <div>
            {customerLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">
                  Loading customer information...
                </span>
              </div>
            ) : data ? (
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 rounded-full p-2 mr-2">
                  <User className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {customerName || "Unknown Customer"}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    Contact: {contactsName}
                    {contactsEmail && (
                      <>
                        <span className="mx-1">•</span>
                        {contactsEmail}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No customer selected</p>
            )}
          </div>

          <Button
            type="button"
            className="flex items-center h-10 gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            onClick={() => setSelectCustomer(true)}
            disabled={customerLoading}
          >
            {customerLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
            Change Customer
          </Button>
        </CardContent>
      </Card>

      <CustomerSelectDialog
        open={selectCustomer}
        onOpenChange={setSelectCustomer}
        onSelectCustomer={handleCustomerSelect}
      />

      {/* Billing Contact Modal */}
      {billingModalOpen && 
        <ContactEditDialog
          open={billingModalOpen}
          onOpenChange={setBillingModalOpen}
          loading={customerLoading}
          title="Edit Billing Contact"
          initialData={{
            first_name: contactBilling?.first_name || "",
            last_name: contactBilling?.last_name || "",
            email: contactBilling?.email || "",
            position_title: contactBilling?.position_title || "",
            phone_number: contactBilling?.phone_number || "",
            mobile_number: contactBilling?.mobile_number || "",

            address1: addressBilling?.address1 || "",
            address2: addressBilling?.address2 || "",
            city: addressBilling?.city || "",
            state: addressBilling?.state || "",
            zip: addressBilling?.zip || "",
            country: addressBilling?.country || "",
          }}
          onSave={handleBillingModalSave}
        />
      }

      {/* Shipping Contact Modal */}
      {shippingModalOpen && 
        <ContactEditDialog
          open={shippingModalOpen}
          onOpenChange={setShippingModalOpen}
          loading={customerLoading}
          title="Edit Shipping Contact"
          initialData={{
            first_name: contactShipping?.first_name || "",
            last_name: contactShipping?.last_name || "",
            email: contactShipping?.email || "",
            position_title: contactShipping?.position_title || "",
            phone_number: contactShipping?.phone_number || "",
            mobile_number: contactShipping?.mobile_number || "",

            address1: addressShipping?.address1 || "",
            address2: addressShipping?.address2 || "",
            city: addressShipping?.city || "",
            state: addressShipping?.state || "",
            zip: addressShipping?.zip || "",
            country: addressShipping?.country || "",
          }}
          onSave={handleShippingModalSave}
        />
      }

      {/* Rest of your component remains the same */}
      <div className="flex flex-col w-full gap-6 mt-4 md:flex-row md:gap-8">
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-full md:w-1/3 gap-[5px]">
          <div className="flex flex-row border-b border-gray-200 pb-2 w-full mb-2">
            <p className="text-sm font-semibold">Billing Contact</p>
          </div>
          {customerLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            !editBilling && (
              <>
                {contactBilling && addressBilling ? (
                  <ContactCard
                    contact={contactBilling}
                    address={addressBilling}
                    loading={customerLoading || false}
                    editing={editBilling}
                    onToggleEdit={() => setBillingModalOpen(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No billing contact available
                  </p>
                )}
              </>
            )
          )}
        </div>
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-full md:w-1/3 gap-[5px]">
          <div className="flex flex-row border-b border-gray-200 pb-2 w-full mb-2">
            <p className="text-sm font-semibold">Shipping Contact</p>
          </div>
          {customerLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            !editShipping && (
              <>
                {contactShipping && addressShipping ? (
                  <ContactCard
                    contact={contactShipping}
                    address={addressShipping}
                    loading={customerLoading || false}
                    editing={editShipping}
                    onToggleEdit={() => setShippingModalOpen(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No shipping contact available
                  </p>
                )}
              </>
            )
          )}
        </div>
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-full md:w-1/3 gap-[5px]">
          <div className="flex flex-row w-full border-b border-gray-200 mb-2 justify-between">
            <p className="text-sm font-semibold">Notes</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setEditNotes(!editNotes)}
                  disabled={customerLoading}
                >
                  {customerLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : !editNotes ? (
                    <SquarePen />
                  ) : (
                    <X />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {customerLoading ? (
                  <p>Loading...</p>
                ) : !editNotes ? (
                  <p>Edit Notes</p>
                ) : (
                  <p>Cancel Edit</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="bg-white rounded-lg">
            {customerLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : !editNotes ? (
              quotesNotes ? (
                quotesNotes.split(",").map((note, index) => (
                  <p key={index} className="text-gray-700 text-sm">
                    {note.trim()}
                    {index < quotesNotes.split(",").length - 1 ? "," : ""}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No notes available. Click edit to add notes.
                </p>  
              )
            ) : (
              <div className="flex flex-col" style={{ rowGap: "10px" }}>
                <textarea
                  value={quotesNotes}
                  onChange={(e) => setQuotesNotes(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Enter customer notes..."
                />
                <div className="flex flex-row justify-end w-full">
                  <Button
                    className="cursor-pointer"
                    style={{
                      backgroundColor: "oklch(54.6% .245 262.881)",
                      width: "20%",
                    }}
                    onClick={handleSaveNotes}
                  >
                    {"Save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
