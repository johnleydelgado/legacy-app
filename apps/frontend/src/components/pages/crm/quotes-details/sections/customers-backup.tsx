"use client";

import * as React from "react";
import {
  AlertCircle,
  Dot,
  Edit,
  Mail,
  Phone,
  SquarePen,
  TabletSmartphone,
  User,
  X,
} from "lucide-react";
import { Customer as CustomerQuotesTypes } from "@/services/quotes/types";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../ui/tooltip";
import { Input } from "../../../../ui/input";
import { useAddressMutations } from "../../../../../hooks/useAddresses";
import {
  CreateAddressDto,
  UpdateAddressDto,
} from "../../../../../services/addresses/types";
import {
  useCustomerMutations,
  useVirtualizedInfiniteCustomers,
} from "../../../../../hooks/useCustomers2";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../ui/alert-dialog";

interface ComponentsProps {
  data: CustomerQuotesTypes | null;
  customerID: number;
  setCustomerID: React.Dispatch<React.SetStateAction<number>>;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AddressTypes {
  id: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const initialAddressData = {
  id: -1,
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

const Customers = ({
  data,
  customerID,
  setCustomerID,
  setModifyFlag,
}: ComponentsProps) => {
  const [selectCustomer, setSelectCustomer] = React.useState<boolean>(false);
  const [editBilling, setEditBilling] = React.useState(false);
  const [editShipping, setEditShipping] = React.useState(false);
  const [editNotes, setEditNotes] = React.useState(false);

  // New state for selected customer
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<
    number | null
  >(null);

  const [billingData, setBillingData] =
    React.useState<AddressTypes>(initialAddressData);

  const [shippingData, setShippingData] =
    React.useState<AddressTypes>(initialAddressData);

  const [notesData, setNotesData] = React.useState<string>("");

  const customerName = data?.name || "";
  const contactsName = `${data?.contact_primary?.first_name || ""} ${
    data?.contact_primary?.last_name || ""
  }`.trim();
  const contactsEmail = data?.contact_primary?.email || "";
  const contactsPhone = data?.contact_primary?.phone_number || "";
  const contactsMobile = data?.contact_primary?.mobile_number || "";

  const customerNotes = data?.notes || "";

  const {
    createAddress,
    updateAddress,
    loading: updateLoading,
    error: updateError,
  } = useAddressMutations();

  const {
    updateCustomerNotes,
    loading: notesLoading,
    error: notesError,
  } = useCustomerMutations();

  // Handle customer selection
  const handleCustomerSelect = (customerId: number) => {
    setCustomerID(customerId);
    setModifyFlag(true);
    setTimeout(() => {
      setSelectCustomer(false);
    }, 500);
  };

  const handleSaveBilling = async () => {
    if (!billingData.id || billingData.id === -1) {
      // Create new billing address
      const createData: CreateAddressDto = {
        fk_id: data?.pk_customer_id || 1,
        address1: billingData.address1,
        address2: billingData.address2,
        city: billingData.city,
        state: billingData.state,
        zip: billingData.zip,
        country: billingData.country,
        address_type: "BILLING",
        table: "Customers",
      };

      const result = await createAddress(createData);

      if (result) {
        setBillingData((prev) => ({ ...prev, id: result.pk_address_id }));
        setEditBilling(false);
        console.log("Billing address created successfully");
      }
    } else {
      const updateData: UpdateAddressDto = {
        address1: billingData.address1,
        address2: billingData.address2,
        city: billingData.city,
        state: billingData.state,
        zip: billingData.zip,
        country: billingData.country,
        address_type: "BILLING",
      };

      const result = await updateAddress({
        id: billingData.id,
        data: updateData,
      });

      if (result) {
        setEditBilling(false);
        console.log("Billing address updated successfully");
      }
    }
  };

  const handleSaveShipping = async () => {
    if (!shippingData.id || shippingData.id === -1) {
      // Create new shipping address
      const createData: CreateAddressDto = {
        fk_id: data?.pk_customer_id || 1,
        address1: shippingData.address1,
        address2: shippingData.address2,
        city: shippingData.city,
        state: shippingData.state,
        zip: shippingData.zip,
        country: shippingData.country,
        address_type: "SHIPPING",
        table: "Customers",
      };

      const result = await createAddress(createData);

      if (result) {
        setShippingData((prev) => ({ ...prev, id: result.pk_address_id }));
        setEditShipping(false);
        console.log("Shipping address created successfully");
      }
    }

    const updateData: UpdateAddressDto = {
      address1: shippingData.address1,
      address2: shippingData.address2,
      city: shippingData.city,
      state: shippingData.state,
      zip: shippingData.zip,
      country: shippingData.country,
      address_type: "SHIPPING",
    };

    const result = await updateAddress({
      id: shippingData.id,
      data: updateData,
    });

    if (result) {
      setEditShipping(false);
      console.log("Shipping address updated successfully");
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

  const {
    visibleCustomers, // Only customers currently in viewport
    totalHeight, // Total height of all items
    offsetY, // Offset for positioning
    handleScroll,
    ...rest
  } = useVirtualizedInfiniteCustomers({ pageSize: 10 });

  React.useEffect(() => {
    if (data) {
      // Handle addresses - check if it's an array or object
      let billingAddress: any = null;
      let shippingAddress: any = null;

      if (data.addresses) {
        // Check if addresses is an array
        if (Array.isArray(data.addresses)) {
          billingAddress = data.addresses.find(
            (addr) => addr.address_type === "BILLING"
          );
          shippingAddress = data.addresses.find(
            (addr) => addr.address_type === "SHIPPING"
          );
        } else {
          // If addresses is a single object, check if it has address_type property
          if (
            data.addresses &&
            typeof data.addresses === "object" &&
            "address_type" in data.addresses
          ) {
            const addressObj = data.addresses as any; // Type assertion for the single address object
            if (addressObj.address_type === "BILLING") {
              billingAddress = addressObj;
            } else if (addressObj.address_type === "SHIPPING") {
              shippingAddress = addressObj;
            }
          }
        }
      }

      // Set billing data
      if (billingAddress) {
        setBillingData({
          id: billingAddress.pk_address_id || -1,
          address1: billingAddress.address1 || "",
          address2: billingAddress.address2 || "",
          city: billingAddress.city || "",
          state: billingAddress.state || "",
          zip: billingAddress.zip || "",
          country: billingAddress.country || "",
        });
      } else {
        setBillingData(initialAddressData);
      }

      // Set shipping data
      if (shippingAddress) {
        setShippingData({
          id: shippingAddress.pk_address_id || -1,
          address1: shippingAddress.address1 || "",
          address2: shippingAddress.address2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          zip: shippingAddress.zip || "",
          country: shippingAddress.country || "",
        });
      } else {
        setShippingData(initialAddressData);
      }

      // Set notes data
      if (customerNotes && customerNotes.length > 0) {
        setNotesData(customerNotes);
      }
    }
  }, [data, customerNotes]);

  return (
    <div className="p-4 border border-gray-200 bg-white rounded-md mt-4">
      <div className="pb-2 flex items-center gap-2 mb-2 border-b border-gray-200">
        <User className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">
          Customer Information
        </h3>
      </div>

      <div className="bg-gray-50 p-4 mb-6 bg-white">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-3 w-full">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col" style={{ rowGap: "5px", flex: 1 }}>
              <p className="font-medium text-gray-900">
                {customerName || "Unknown Customer"} - {contactsName}
              </p>
              <p className="text-gray-600 text-sm">Contact: {contactsName}</p>
              <p className="text-gray-600 text-sm">Email: {contactsEmail}</p>
              <p className="text-gray-600 text-sm">Phone: {contactsPhone}</p>
              <p className="text-gray-600 text-sm">Mobile: {contactsMobile}</p>
            </div>
            <Button
              className="flex flex-row bg-blue-600 text-white cursor-pointer"
              style={{ columnGap: "10px" }}
              onClick={() => setSelectCustomer(true)}
            >
              <Edit className="h-4 w-4" />
              Change Customer
            </Button>

            {selectCustomer && (
              <AlertDialog
                open={selectCustomer}
                onOpenChange={setSelectCustomer}
              >
                <AlertDialogTrigger asChild>{}</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle
                      className="border-b border-solid flex flex-row w-full justify-between"
                      style={{ paddingBottom: "10px" }}
                    >
                      <p className="text-lg font-semibold">Select Customer</p>
                      <Button
                        variant="ghost"
                        className="cursor-pointer"
                        onClick={() => setSelectCustomer(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <div
                        style={{ height: "300px", overflow: "auto" }}
                        onScroll={handleScroll}
                      >
                        <div
                          style={{ height: totalHeight, position: "relative" }}
                        >
                          <div
                            className="flex flex-col"
                            style={{
                              paddingTop: "10px",
                              paddingRight: "5px",
                              transform: `translateY(${offsetY}px)`,
                              rowGap: "20px",
                            }}
                          >
                            {visibleCustomers.map((customer) => {
                              // Type guard for primary contact
                              const hasPrimaryContact =
                                customer.contact_primary &&
                                typeof customer.contact_primary === "object" &&
                                Object.keys(customer.contact_primary).length !==
                                  0;

                              const primaryContact = hasPrimaryContact
                                ? (customer.contact_primary as any)
                                : null;

                              return (
                                <div
                                  className={`border border-solid rounded-xl p-4 flex flex-col cursor-pointer transition-all duration-200 ${
                                    customerID === customer.pk_customer_id
                                      ? "border-blue-500 bg-blue-50 shadow-md"
                                      : "border-black hover:border-gray-400 hover:bg-gray-50"
                                  }`}
                                  key={customer.pk_customer_id}
                                  style={{ minHeight: "80px", rowGap: "10px" }}
                                  onClick={() =>
                                    handleCustomerSelect(
                                      customer.pk_customer_id
                                    )
                                  }
                                >
                                  <div
                                    className="flex flex-row items-center"
                                    style={{ columnGap: "10px" }}
                                  >
                                    <div
                                      className={`p-4 rounded-full border border-solid ${
                                        customerID === customer.pk_customer_id
                                          ? "border-blue-500 bg-blue-100"
                                          : "border-black"
                                      }`}
                                      style={{ width: "58px" }}
                                    >
                                      <User
                                        color={
                                          selectedCustomerId ===
                                          customer.pk_customer_id
                                            ? "#3b82f6"
                                            : "black"
                                        }
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <p
                                        className={`text-sm font-semibold ${
                                          customerID === customer.pk_customer_id
                                            ? "text-blue-700"
                                            : "text-black"
                                        }`}
                                      >
                                        {customer.name}
                                      </p>
                                      <p className="text-sm font-light text-gray-600">
                                        ID: {customer.pk_customer_id}
                                      </p>
                                    </div>
                                  </div>
                                  {hasPrimaryContact && primaryContact ? (
                                    <div
                                      className="flex flex-col border-b border-solid"
                                      style={{
                                        rowGap: "5px",
                                        paddingBottom: "15px",
                                        paddingLeft: "10px",
                                      }}
                                    >
                                      <div
                                        className="flex flex-row items-center"
                                        style={{ columnGap: "10px" }}
                                      >
                                        <User size={15} />
                                        <p className="text-xs">
                                          {primaryContact.first_name || ""}{" "}
                                          {primaryContact.last_name || ""}
                                        </p>
                                      </div>
                                      <div
                                        className="flex flex-row items-center"
                                        style={{ columnGap: "10px" }}
                                      >
                                        <Mail size={15} />
                                        <p className="text-xs">
                                          {primaryContact.email || ""}
                                        </p>
                                      </div>
                                      <div
                                        className="flex flex-row items-center"
                                        style={{ columnGap: "10px" }}
                                      >
                                        <Phone size={15} />
                                        <p className="text-xs">
                                          {primaryContact.phone_number || ""}
                                        </p>
                                      </div>
                                      <div
                                        className="flex flex-row items-center"
                                        style={{ columnGap: "10px" }}
                                      >
                                        <TabletSmartphone size={15} />
                                        <p className="text-xs">
                                          {primaryContact.mobile_number || ""}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <p
                                      className="text-sm border-b border-solid"
                                      style={{
                                        paddingBottom: "15px",
                                        paddingLeft: "10px",
                                      }}
                                    >
                                      No Primary Contact
                                    </p>
                                  )}
                                  <p className="text-xs">
                                    Notes:{" "}
                                    {customer.notes && customer.notes.length > 0
                                      ? customer.notes
                                      : "No Notes"}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="hidden"
                      onClick={() => {
                        setSelectCustomer(false);
                        setSelectedCustomerId(null);
                      }}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={!selectedCustomerId}
                      className={`hidden ${
                        !selectedCustomerId
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div
        className="flex flex-row w-full mt-4 p-4"
        style={{ columnGap: "30px" }}
      >
        <div className="flex flex-col" style={{ width: "50%", rowGap: "5px" }}>
          <div className="flex flex-row w-full justify-between">
            <p className="text-sm font-semibold">Billing Information</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setEditBilling(!editBilling)}
                >
                  {!editBilling ? <SquarePen /> : <X />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {!editBilling ? (
                  <p>Edit Billing Address</p>
                ) : (
                  <p>Cancel Edit</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
          {!editBilling && (
            <>
              {billingData.address1 ? (
                <>
                  <div
                    className="grid gap-4 w-full"
                    style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                  >
                    <p className="text-sm font-semibold">Address Line 1:</p>
                    <p className="text-sm tracking-tight col-span-3">{`${billingData.address1}, ${billingData.city}, ${billingData.state}, ${billingData.country}, ${billingData.zip}`}</p>
                  </div>
                  <div
                    className={`gap-4 w-full ${
                      billingData.address2 && billingData.address2.length > 0
                        ? "grid"
                        : "hidden"
                    }`}
                    style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                  >
                    <p className="text-sm font-semibold">Address Line 2:</p>
                    <p className="text-sm tracking-tight col-span-3">{`${billingData.address2}, ${billingData.city}, ${billingData.state}, ${billingData.country}, ${billingData.zip}`}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No billing address available
                </p>
              )}
            </>
          )}
          {editBilling && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Address Line 1:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={billingData.address1}
                      onChange={(e) =>
                        setBillingData((prevState) => ({
                          ...prevState,
                          address1: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter address line 1`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Address Line 2:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={billingData.address2}
                      onChange={(e) =>
                        setBillingData((prevState) => ({
                          ...prevState,
                          address2: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter address line 2`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    City:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={billingData.city}
                      onChange={(e) =>
                        setBillingData((prevState) => ({
                          ...prevState,
                          city: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter city`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    State:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={billingData.state}
                      onChange={(e) =>
                        setBillingData((prevState) => ({
                          ...prevState,
                          state: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter state`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Country:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={billingData.country}
                      onChange={(e) =>
                        setBillingData((prevState) => ({
                          ...prevState,
                          country: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter country`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Zip Code:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={billingData.zip}
                      onChange={(e) =>
                        setBillingData((prevState) => ({
                          ...prevState,
                          zip: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter zip code`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-end w-full">
                <Button
                  className="space-y-1 cursor-pointer"
                  style={{
                    backgroundColor: "oklch(54.6% .245 262.881)",
                    marginTop: "10px",
                    width: "20%",
                  }}
                  onClick={handleSaveBilling}
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          )}
        </div>
        Add commentMore actions
        <div className="flex flex-col" style={{ width: "50%", rowGap: "5px" }}>
          <div className="flex flex-row w-full justify-between">
            <p className="text-sm font-semibold">Shipping Information</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setEditShipping(!editShipping)}
                >
                  {!editShipping ? <SquarePen /> : <X />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {!editShipping ? (
                  <p>Edit Shipping Address</p>
                ) : (
                  <p>Cancel Edit</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
          {!editShipping && (
            <>
              {shippingData.address1 ? (
                <>
                  <div
                    className="grid gap-4 w-full"
                    style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                  >
                    <p className="text-sm font-semibold">Address Line 1:</p>
                    <p className="text-sm tracking-tight col-span-3">{`${shippingData.address1}, ${shippingData.city}, ${shippingData.state}, ${shippingData.country}, ${shippingData.zip}`}</p>
                  </div>
                  <div
                    className={`gap-4 w-full ${
                      shippingData.address2 && shippingData.address2.length > 0
                        ? "grid"
                        : "hidden"
                    }`}
                    style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                  >
                    <p className="text-sm font-semibold">Address Line 2:</p>
                    <p className="text-sm tracking-tight col-span-3">{`${shippingData.address2}, ${shippingData.city}, ${shippingData.state}, ${shippingData.country}, ${shippingData.zip}`}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No shipping address available
                </p>
              )}
            </>
          )}
          {editShipping && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Address Line 1:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={shippingData.address1}
                      onChange={(e) =>
                        setShippingData((prevState) => ({
                          ...prevState,
                          address1: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter address line 1`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Address Line 2:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={shippingData.address2}
                      onChange={(e) =>
                        setShippingData((prevState) => ({
                          ...prevState,
                          address2: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter address line 2`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    City:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={shippingData.city}
                      onChange={(e) =>
                        setShippingData((prevState) => ({
                          ...prevState,
                          city: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter city`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    State:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={shippingData.state}
                      onChange={(e) =>
                        setShippingData((prevState) => ({
                          ...prevState,
                          state: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter state`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Country:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={shippingData.country}
                      onChange={(e) =>
                        setShippingData((prevState) => ({
                          ...prevState,
                          country: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter country`}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                    Zip Code:
                  </div>
                  <div className="flex-1 text-right">
                    <Input
                      value={shippingData.zip}
                      onChange={(e) =>
                        setShippingData((prevState) => ({
                          ...prevState,
                          zip: e.target.value,
                        }))
                      }
                      className={`text-right h-8`}
                      placeholder={`Enter zip code`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-end w-full">
                <Button
                  className="space-y-1 cursor-pointer"
                  style={{
                    backgroundColor: "oklch(54.6% .245 262.881)",
                    marginTop: "10px",
                    width: "20%",
                  }}
                  onClick={handleSaveShipping}
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-6 p-4">
        <div className="flex flex-row w-full justify-between">
          <p className="text-sm font-semibold">Notes</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() => setEditNotes(!editNotes)}
              >
                {!editNotes ? <SquarePen /> : <X />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!editNotes ? <p>Edit Notes</p> : <p>Cancel Edit</p>}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {!editNotes ? (
            notesData ? (
              notesData.split(",").map((note, index) => (
                <p key={index} className="text-gray-700 text-sm">
                  {note.trim()}
                  {index < notesData.split(",").length - 1 ? "," : ""}
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
                value={notesData}
                onChange={(e) => setNotesData(e.target.value)}
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Enter customer notes..."
              />
              {notesError && (
                <div className="text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {notesError}
                </div>
              )}
              <div className="flex flex-row justify-end w-full">
                <Button
                  className="cursor-pointer"
                  style={{
                    backgroundColor: "oklch(54.6% .245 262.881)",
                    width: "20%",
                  }}
                  onClick={handleSaveNotes}
                  disabled={notesLoading}
                >
                  {notesLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
