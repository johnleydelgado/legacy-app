'use client';

import * as React from "react";
import { Customer } from "@/services/customers/types";
import { Vendor } from "@/services/vendors/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact, Dot, EditIcon, Factory, Globe, InfoIcon, Mail, MapPin, Phone, Smartphone, Store, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useVendor } from "@/hooks/useVendors2";
import { useAddressByForeignKey } from "@/hooks/useAddresses";
import { useContactByReference } from "@/hooks/useContacts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContactAddressForm, ContactAddressFormValues, defaultFormValues } from "../forms/contact-address-form";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useFactory } from "@/hooks/useFactories";
import { PurchaseOrderData } from "../add";
import PurchaseOrderDetailsForm from "../forms/purchase-order-details-form";

interface FactoryContentProps {
    addMode?: boolean;
    customerID: number;
    factoryID: number;
    purchaseOrderData: PurchaseOrderData;
    setPurchaseOrderData: React.Dispatch<React.SetStateAction<PurchaseOrderData>>;
}

const FactoryContent = ({ 
    addMode = true, 
    customerID, 
    factoryID, 
    purchaseOrderData, 
    setPurchaseOrderData 
}: FactoryContentProps) => {
    const [isBillingInfoLoading, setIsBillingInfoLoading] = React.useState(false);
    const [isShippingInfoLoading, setIsShippingInfoLoading] = React.useState(false);
    const [isNotesLoading, setIsNotesLoading] = React.useState(false);

    const [editBillingInfo, setEditBillingInfo] = React.useState(false);
    const [editShippingInfo, setEditShippingInfo] = React.useState(false);
    const [editNotes, setEditNotes] = React.useState(false);

    const [billingValues, setBillingValues] = React.useState<ContactAddressFormValues>(defaultFormValues as ContactAddressFormValues);
    const [shippingValues, setShippingValues] = React.useState<ContactAddressFormValues>(defaultFormValues as ContactAddressFormValues);
    const [notes, setNotes] = React.useState('');

    const { data: factoryData } = useFactory(factoryID);
    const { data: factoryBillingAddress } = useAddressByForeignKey({ fk_id: factoryID, table: 'Factories', address_type: 'BILLING' });
    const { data: factoryShippingAddress } = useAddressByForeignKey({ fk_id: factoryID, table: 'Factories', address_type: 'SHIPPING' });

    const { data: customerContact } = useContactByReference(customerID, 'Customers', 'PRIMARY');
    const { data: customerBillingAddress } = useAddressByForeignKey({ fk_id: customerID, table: 'Customers', address_type: 'BILLING' });
    const { data: customerShippingAddress } = useAddressByForeignKey({ fk_id: customerID, table: 'Customers', address_type: 'SHIPPING' });
    
    const handleBillingSubmit = async (data: ContactAddressFormValues) => {
        setIsBillingInfoLoading(true);
        
        // Simulate API call
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Show success message
          toast.success("Contact and address information saved successfully!", {
            description: `Contact: ${data.contactFirstname} ${data.contactLastname}`,
          });
          
          console.log("Form data:", data);
        } catch (error) {
          toast.error("Failed to save contact information");
          console.error("Error:", error);
        } finally {
          setIsBillingInfoLoading(false);
        }
    };

    const handleShippingSubmit = async (data: ContactAddressFormValues) => {
        setIsShippingInfoLoading(true);
        
        // Simulate API call
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Show success message
          toast.success("Contact and address information saved successfully!", {
            description: `Contact: ${data.contactFirstname} ${data.contactLastname}`,
          });
          
          console.log("Form data:", data);
        } catch (error) {
          toast.error("Failed to save contact information");
          console.error("Error:", error);
        } finally {
          setIsBillingInfoLoading(false);
        }
    };

    React.useEffect(() => {
        if (customerContact) {
            setBillingValues({
                contactFirstname: customerContact.first_name,
                contactLastname: customerContact.last_name,
                contactEmail: customerContact.email,
                contactPhoneNumber: customerContact.phone_number,
                contactMobileNumber: customerContact.mobile_number,
                contactPositionTitle: customerContact.position_title || '',
                addressLine1: customerBillingAddress?.address1 || '',
                city: customerBillingAddress?.city || '',
                state: customerBillingAddress?.state || '',
                country: customerBillingAddress?.country || '',
                zip: customerBillingAddress?.zip || '',
            });
        }
    }, [customerContact, customerBillingAddress, customerID]);

    React.useEffect(() => {
        if (customerContact) {
            setShippingValues({
                contactFirstname: customerContact.first_name,
                contactLastname: customerContact.last_name,
                contactEmail: customerContact.email,
                contactPhoneNumber: customerContact.phone_number,
                contactMobileNumber: customerContact.mobile_number,
                contactPositionTitle: customerContact.position_title || '',
                addressLine1: customerShippingAddress?.address1 || '',
                city: customerShippingAddress?.city || '',
                state: customerShippingAddress?.state || '',
                country: customerShippingAddress?.country || '',
                zip: customerShippingAddress?.zip || '',
            });
        }
    }, [customerContact, customerShippingAddress, customerID]);

    return (
        <div className="space-y-4 min-h-[300px]">
            <Card className="rounded-md" style={{gap: '5px'}}>
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-row gap-2 justify-between">
                            <div className="flex flex-row gap-2 items-center">
                                <div className="bg-purple-100 rounded-full p-2">
                                    <Factory className="w-4 h-4 text-purple-600" />
                                </div>
                                <p className="text-sm text-gray-800">Factory Information</p>
                            </div>
                            {factoryData?.status && (
                                <Badge className={`text-xs rounded-xl ${factoryData?.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                    {factoryData?.status || '---'}
                                </Badge>
                            )}        
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {factoryData ? (
                        <div className="space-y-2 px-10">
                            <div className="flex flex-row gap-1 items-center">
                                <p className="text-sm text-gray-800 font-medium">{factoryData?.name || '---'}</p>
                                <Separator orientation="vertical" className="text-gray-700 mx-4" style={{height: '20px'}} />
                                <p className="text-sm text-gray-500">{factoryData?.factories_type?.name || '---'}</p>
                                <Dot className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-500">{factoryData?.factories_service?.name || '---'}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-2 items-center">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        {factoryData?.website_url ? (
                                            <a href={factoryData.website_url} target="_blank" rel="noopener noreferrer" 
                                               className="text-sm text-blue-600 hover:underline">
                                                {factoryData.website_url}
                                            </a>
                                        ) : (
                                            <p className="text-sm">---</p>
                                        )}
                                    </div>
                                    <div className="flex flex-row gap-2 items-start">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <div className="flex flex-col max-w-[300px]">
                                            <p className="text-sm text-gray-500">{factoryBillingAddress?.address1 || '---'}</p>
                                            <p className="text-sm text-gray-500">{`${factoryBillingAddress?.city || ''}, ${factoryBillingAddress?.state || ''}`}</p>
                                            <p className="text-sm text-gray-500">{`${factoryBillingAddress?.country || '---'}, ${factoryBillingAddress?.zip || ''}`}</p>
                                        </div>
                                    </div>
                                </div>
                                {factoryData?.contact && (
                                    <div className="flex flex-col gap-2 items-start">
                                        <div className="flex flex-row gap-2 items-center">
                                            <Contact className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm text-gray-700">{factoryData.contact.first_name} {factoryData.contact.last_name}</p>
                                            {factoryData.contact.position_title && (
                                                <p className="text-gray-500 text-sm">{factoryData.contact.position_title}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm text-gray-500">{factoryData.contact.email || '---'}</p>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm text-gray-500">{factoryData.contact.phone_number || '---'}</p>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <Smartphone className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm text-gray-500">{factoryData.contact.mobile_number || '---'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : 
                        <div className="flex flex-col items-center justify-center">
                            <Factory className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 mb-3">
                                No factory selected
                            </p>
                        </div>
                    }
                </CardContent>
            </Card>
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
                           haveDefaultData={customerContact ? true : false}
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
                           haveDefaultData={customerContact ? true : false}
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
                                <p className="text-sm text-gray-900 font-semibold">Production Notes</p>
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
                           onChange={(e) => setNotes(e.target.value)}
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

export default FactoryContent;
