'use client';

import * as React from "react";
import { Customer } from "@/services/customers/types";
import { Vendor } from "@/services/vendors/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact, Dot, EditIcon, Globe, InfoIcon, Mail, MapPin, Phone, Smartphone, Store, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useVendor, useVendorProductCategories } from "@/hooks/useVendors2";
import { useAddressByForeignKey } from "@/hooks/useAddresses";
import { useContactByReference } from "@/hooks/useContacts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContactAddressForm, ContactAddressFormValues, defaultFormValues } from "../forms/contact-address-form";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PurchaseOrderData } from "../add";
import PurchaseOrderDetailsForm from "../forms/purchase-order-details-form";

interface VendorContentProps {
    addMode?: boolean;
    customerID: number;
    purchaseOrderData: PurchaseOrderData;
    setPurchaseOrderData: React.Dispatch<React.SetStateAction<PurchaseOrderData>>;
    billingValues: ContactAddressFormValues;
    setBillingValues: React.Dispatch<React.SetStateAction<ContactAddressFormValues>>;
    shippingValues: ContactAddressFormValues;
    setShippingValues: React.Dispatch<React.SetStateAction<ContactAddressFormValues>>;
    notes: string;
    setNotes: React.Dispatch<React.SetStateAction<string>>;
    setModifyFlag?: (modifyFlag: boolean) => void;
    setModifyBillingFlag?: (modifyFlag: boolean) => void;
    setModifyShippingFlag?: (modifyFlag: boolean) => void;
}

const VendorContent = (
    { 
        addMode = true, 
        customerID, 
        purchaseOrderData, 
        setPurchaseOrderData, 
        billingValues, 
        setBillingValues, 
        shippingValues, 
        setShippingValues, 
        notes, 
        setNotes, 
        setModifyFlag,
        setModifyBillingFlag,
        setModifyShippingFlag
    }: VendorContentProps) => {

    const [isBillingInfoLoading, setIsBillingInfoLoading] = React.useState(false);
    const [isShippingInfoLoading, setIsShippingInfoLoading] = React.useState(false);
    
    const [editBillingInfo, setEditBillingInfo] = React.useState(false);
    const [editShippingInfo, setEditShippingInfo] = React.useState(false);
    const [editNotes, setEditNotes] = React.useState(false);

    const { data: customerContact } = useContactByReference(customerID, 'Customers', 'PRIMARY');
    const { data: customerBillingAddress } = useAddressByForeignKey({ fk_id: customerID, table: 'Customers', address_type: 'BILLING' });
    const { data: customerShippingAddress } = useAddressByForeignKey({ fk_id: customerID, table: 'Customers', address_type: 'SHIPPING' });

    const handleBillingSubmit = async (data: ContactAddressFormValues) => {
        setBillingValues(data);
        setEditBillingInfo(false);
        if (setModifyBillingFlag) {
            setModifyBillingFlag(true);
        }
    };

    const handleShippingSubmit = async (data: ContactAddressFormValues) => {
        setShippingValues(data);
        setEditShippingInfo(false);
        if (setModifyShippingFlag) {
            setModifyShippingFlag(true);
        }
    };

    React.useEffect(() => {
        if (customerContact && billingValues === defaultFormValues) {
            setBillingValues({
                ...billingValues,
                contactFirstname: customerContact.first_name,
                contactLastname: customerContact.last_name,
                contactEmail: customerContact.email,
                contactPhoneNumber: customerContact.phone_number,
                contactMobileNumber: customerContact.mobile_number,
                contactPositionTitle: customerContact.position_title,
            });
        }

        if (customerBillingAddress) {
            setBillingValues({
                ...billingValues,
                addressLine1: customerBillingAddress.address1 || '',
                city: customerBillingAddress.city || '',
                state: customerBillingAddress.state || '',
                country: customerBillingAddress.country || '',
                zip: customerBillingAddress.zip || '',
            });
        }
    }, [customerContact, customerBillingAddress, customerID]);

    React.useEffect(() => {
        if (customerContact && shippingValues === defaultFormValues) {
            setShippingValues({
                ...shippingValues,
                contactFirstname: customerContact.first_name,
                contactLastname: customerContact.last_name,
                contactEmail: customerContact.email,
                contactPhoneNumber: customerContact.phone_number,
                contactMobileNumber: customerContact.mobile_number,
                contactPositionTitle: customerContact.position_title,
            });
        }

        if (customerShippingAddress) {
            setShippingValues({
                ...shippingValues,
                addressLine1: customerShippingAddress.address1 || '',
                city: customerShippingAddress.city || '',
                state: customerShippingAddress.state || '',
                country: customerShippingAddress.country || '',
                zip: customerShippingAddress.zip || '',
            });
        }
    }, [customerContact, customerShippingAddress, customerID]);

    return (
        <div className="space-y-4 min-h-[300px]">
            <Card className="rounded-md" style={{gap: '10px'}}>
                <CardHeader>
                    <CardTitle>
                        Purchase Order Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <PurchaseOrderDetailsForm 
                        purchaseOrderData={purchaseOrderData}
                        setPurchaseOrderData={setPurchaseOrderData}
                        setModifyFlag={setModifyFlag}
                    />
                </CardContent>
            </Card>
            <div className="flex flex-row gap-4">
                <Card className="w-1/3 grow" style={{gap: '5px'}}>
                    <CardHeader>
                        <CardTitle className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2 items-center">
                                <InfoIcon className="w-4 h-4 text-blue-500" />
                                <p className="text-sm text-gray-900 font-semibold">Billing Information</p>
                            </div>
                            {!addMode}
                            <Button variant="ghost" size="icon" className="rounded-full cursor-pointer" onClick={() => setEditBillingInfo(!editBillingInfo)}>
                                {editBillingInfo ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <EditIcon className="w-4 h-4" />
                                )}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ContactAddressForm 
                           isLoading={isBillingInfoLoading} 
                           onSubmit={handleBillingSubmit} 
                           defaultValues={billingValues}
                           haveDefaultData={billingValues !== null}
                           isEdit={editBillingInfo}
                           setIsEdit={setEditBillingInfo}
                        />
                    </CardContent>
                </Card>

                <Card className="w-1/3 grow" style={{gap: '5px'}}>
                    <CardHeader>
                        <CardTitle className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2 items-center">
                                <InfoIcon className="w-4 h-4 text-blue-500" />
                                <p className="text-sm text-gray-900 font-semibold">Shipping Information</p>
                            </div>
                            {!addMode}
                            <Button variant="ghost" size="icon" className="rounded-full cursor-pointer" onClick={() => setEditShippingInfo(!editShippingInfo)}>
                                {editShippingInfo ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <EditIcon className="w-4 h-4" />
                                )}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ContactAddressForm 
                           isLoading={isShippingInfoLoading} 
                           onSubmit={handleShippingSubmit} 
                           haveDefaultData={shippingValues !== null}
                           defaultValues={shippingValues}
                           isEdit={editShippingInfo}
                           setIsEdit={setEditShippingInfo}
                        />
                    </CardContent>
                </Card>

                <Card className="w-1/3 grow" style={{gap: '5px'}}>
                    <CardHeader>
                        <CardTitle className="flex flex-row gap-2 items-center justify-between">
                            <div className="flex flex-row gap-2 items-center">
                                <InfoIcon className="w-4 h-4 text-blue-500" />
                                <p className="text-sm text-gray-900 font-semibold">Supplier Notes</p>
                            </div>
                            {!addMode}
                            <Button variant="ghost" size="icon" className="rounded-full cursor-pointer" onClick={() => setEditNotes(!editNotes)}>
                                {editNotes ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <EditIcon className="w-4 h-4" />
                                )}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                           value={notes}
                           onChange={(e) => {
                            setNotes(e.target.value);
                            if (setModifyFlag) {
                                setModifyFlag(true);
                            }
                           }}
                           disabled={!editNotes}
                           placeholder="Enter notes here..."
                           className="resize-none h-[200px]"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default VendorContent;
