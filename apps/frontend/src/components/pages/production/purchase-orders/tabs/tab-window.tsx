'use client';

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TAB_ITEMS, TAB_ITEMS_LABELS } from "./constants";
import VendorContent from "./vendor-content";
import { Customer } from "@/services/customers/types";
import { Vendor } from "@/services/vendors/types";
import FactoryContent from "./factory-content";
import { Factory } from "@/services/factories/types";
import { PurchaseOrderData } from "../add";
import { ContactAddressFormValues } from "../forms/contact-address-form";

interface TabWindowProps {  
    selectedCustomer: Customer | null;
    selectedVendor: Vendor | null;
    selectedFactory: Factory | null;
    purchaseOrderData: PurchaseOrderData;
    setPurchaseOrderData: React.Dispatch<React.SetStateAction<PurchaseOrderData>>;
    billingValues: ContactAddressFormValues;
    setBillingValues: React.Dispatch<React.SetStateAction<ContactAddressFormValues>>;
    shippingValues: ContactAddressFormValues;
    setShippingValues: React.Dispatch<React.SetStateAction<ContactAddressFormValues>>;
    notes: string;
    setNotes: React.Dispatch<React.SetStateAction<string>>;
    addMode?: boolean;
}

const TabWindow = ({ 
    selectedCustomer, 
    selectedVendor, 
    selectedFactory, 
    purchaseOrderData, 
    setPurchaseOrderData,
    billingValues,
    setBillingValues,
    shippingValues,
    setShippingValues,
    notes,
    setNotes,
    addMode = true
}: TabWindowProps) => {
    return (
        <div className="flex w-full flex-col gap-6">
            <Tabs defaultValue={TAB_ITEMS.PO_SUPPLIER}>
                <TabsList>
                    <TabsTrigger value={TAB_ITEMS.PO_SUPPLIER}>{TAB_ITEMS_LABELS[TAB_ITEMS.PO_SUPPLIER]}</TabsTrigger>
                    <TabsTrigger value={TAB_ITEMS.PO_PRODUCTION}>{TAB_ITEMS_LABELS[TAB_ITEMS.PO_PRODUCTION]}</TabsTrigger>
                </TabsList>
                <TabsContent value={TAB_ITEMS.PO_SUPPLIER}>
                    <Card className="border-none shadow-none p-0" style={{gap: '5px'}}>
                        <CardHeader>
                            <CardTitle>{}</CardTitle>
                            <CardDescription>{}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 px-0" >
                            <VendorContent 
                                addMode={addMode}
                                customerID={selectedCustomer?.pk_customer_id || -1}
                                purchaseOrderData={purchaseOrderData}
                                setPurchaseOrderData={setPurchaseOrderData}
                                billingValues={billingValues}
                                setBillingValues={setBillingValues}
                                shippingValues={shippingValues}
                                setShippingValues={setShippingValues}
                                notes={notes}
                                setNotes={setNotes}
                            />
                        </CardContent>
                        <CardFooter>{}</CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value={TAB_ITEMS.PO_PRODUCTION}>
                    <Card className="border-none shadow-none p-0" style={{gap: '5px'}}>
                        <CardHeader>
                            <CardTitle>{}</CardTitle>
                            <CardDescription>{}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 px-0">
                            <FactoryContent     
                                addMode={addMode}
                                customerID={selectedCustomer?.pk_customer_id || -1} 
                                factoryID={selectedFactory?.pk_factories_id || -1} 
                                purchaseOrderData={purchaseOrderData}
                                setPurchaseOrderData={setPurchaseOrderData}
                            />
                        </CardContent>
                        <CardFooter>{}</CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default TabWindow;
