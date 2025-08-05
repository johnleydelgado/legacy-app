'use client';
import { Vendor } from "@/services/vendors/types";
import * as React from "react";
import { useState } from "react";
import { 
  Calendar, 
  DollarSign, 
  LineChart, 
  Mail, 
  Phone, 
  User, 
  Building, 
  Tag, 
  CheckCircle,
  Upload,
  Star,
  FileText,
  Clock,
  CreditCard,
  Package,
  TrendingUp,
  AlertTriangle,
  Download,
  Users,
  UserCheck,
  UserX,
  Pencil,
  PencilLine,
  ShoppingCart
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Header from "../sections/header";
import KpiCard from "../sections/kpiCards";
import { FaMobile } from "react-icons/fa";
import { useAddressByForeignKey } from "@/hooks/useAddresses";
import { useRouter } from "next/navigation";
import { useDeleteVendor, useVendorIndividualKpis } from "@/hooks/useVendors2";
import { toast } from "sonner";

interface VendorDetailsProps {
    vendorData: Vendor;
    vendorId: number;
}

const VendorDetails = ({ vendorData, vendorId }: VendorDetailsProps) => {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState("contracts");

    const { data: billingAddressData } = useAddressByForeignKey({
        fk_id: vendorId,
        table: 'Vendors',
        address_type: 'BILLING'
    });

    const { data: shippingAddressData } = useAddressByForeignKey({
        fk_id: vendorId,
        table: 'Vendors',
        address_type: 'SHIPPING'
    });

    const { data: vendorIndividualKpis } = useVendorIndividualKpis(vendorId);

    const { mutateAsync: deleteVendor } = useDeleteVendor();

    // Mock data for demonstration - replace with actual data from your API
    const mockComplianceDocuments = [
        {
            id: 1,
            name: "Business License",
            expiryDate: "Dec 31, 2024",
            status: "Valid"
        },
        {
            id: 2,
            name: "Insurance Certificate", 
            expiryDate: "Jun 15, 2024",
            status: "Expiring Soon"
        }
    ];

    const mockInvoices = [
        {
            id: "INV-2023-056",
            issueDate: "Nov 15, 2023",
            dueDate: "Dec 15, 2023",
            amount: 4250.00,
            status: "Pending"
        },
        {
            id: "INV-2023-042",
            issueDate: "Oct 1, 2023", 
            dueDate: "Oct 31, 2023",
            amount: 3750.00,
            status: "Paid"
        }
    ];

    const mockPurchaseOrders = [
        {
            id: "PO-2023-089",
            created: "Nov 5, 2023",
            due: "Dec 5, 2023",
            items: "Office Chairs (20), Desks (10)",
            amount: 8250.00,
            status: "In Progress"
        },
        {
            id: "PO-2023-076",
            created: "Oct 12, 2023",
            due: "Nov 12, 2023", 
            items: "Printer Paper (100), Toner Cartridges (15)",
            amount: 4120.00,
            status: "Completed"
        }
    ];

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; bg: string }> = {
            'Active': { color: 'text-green-700', bg: 'bg-green-100' },
            'ACTIVE': { color: 'text-green-700', bg: 'bg-green-100' },
            'Blocked': { color: 'text-red-700', bg: 'bg-red-100' },
            'BLOCKED': { color: 'text-red-700', bg: 'bg-red-100' },
            'Valid': { color: 'text-green-700', bg: 'bg-green-100' },
            'Expiring Soon': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
            'Pending': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
            'Paid': { color: 'text-green-700', bg: 'bg-green-100' },
            'In Progress': { color: 'text-blue-700', bg: 'bg-blue-100' },
            'Completed': { color: 'text-green-700', bg: 'bg-green-100' }
        };

        const config = statusConfig[status] || { color: 'text-gray-700', bg: 'bg-gray-100' };
        
        return (
            <Badge className={`${config.bg} ${config.color} border-0 font-medium`}>
                {status}
            </Badge>
        );
    };

    const handleDelete = () => {
        try {
            deleteVendor(vendorId);
            toast.success(`Vendor ${vendorData.name} deleted successfully`);

            router.back();

        } catch (error) {
            toast.error(`Failed to delete vendor ${vendorData.name}`, {
                description: "Please try again later",
            });
        }
    }

    const handlePaymentRequest = () => {
        console.log('payment request');
    }

    return (
        <div className="w-full max-w-full mx-auto bg-white min-h-screen space-y-4">
            <Header detailsPage={true} onDelete={handleDelete} onPaymentRequest={handlePaymentRequest} vendor={vendorData} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total Products"
                    value={vendorIndividualKpis?.total_products || 0}
                    icon={Package}
                    growthRate={0}
                    isLoading={false}
                />
                <KpiCard
                    title="Total Revenue"
                    value={vendorIndividualKpis?.total_revenue || 0}
                    icon={DollarSign}
                    isLoading={false}
                />
                <KpiCard
                    title="Order Count"
                    value={vendorIndividualKpis?.order_count || 0}
                    icon={ShoppingCart}
                    isLoading={false}
                />
                <KpiCard
                    title="Average Order Value"
                    value={vendorIndividualKpis?.average_order_value || 0}
                    icon={DollarSign}
                    isLoading={false}
                />            
            </div>

            <div className="flex flex-row gap-4">
                <Card className="bg-white border shadow-sm w-[30%]">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div className="flex flex-row gap-0 items-center justify-between w-full">
                            <CardTitle>
                                Vendor Information
                            </CardTitle>
                            <Button variant="outline" className="p-2 cursor-pointer" onClick={() => router.push(`/production/vendors/${vendorId}/edit`)}>
                                <PencilLine className="w-4 h-4" />
                                Edit
                            </Button> 
                        </div>  
                    </CardHeader>
                    <CardContent>
                        {(vendorData.contact && typeof vendorData.contact.first_name === 'string' || typeof vendorData.contact.last_name === 'string' && 
                        typeof vendorData.contact.position_title === 'string' || typeof vendorData.contact.email === 'string' || typeof vendorData.contact.phone_number === 'string' || typeof vendorData.contact.mobile_number === 'string' &&
                        billingAddressData?.address1 || billingAddressData?.city || billingAddressData?.state || billingAddressData?.zip || billingAddressData?.country) ?
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row gap-2 items-center">
                                    <User className="w-6 h-6 text-gray-500" />
                                    <p className="text-gray-500 text-sm font-light">{`${vendorData.contact.first_name} ${vendorData.contact.last_name}`}</p>
                                </div>
                                <p className="ml-8 text-gray-400 text-sm font-light">{vendorData.contact.position_title}</p>
                                <div className="flex flex-row gap-2 items-center">
                                    <Mail className="w-6 h-6 text-gray-500" />
                                    <p className="text-gray-500 text-sm font-light">{vendorData.contact.email}</p>
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <Phone className="w-6 h-6 text-gray-500" />
                                    <p className="text-gray-500 text-sm font-light">{vendorData.contact.phone_number}</p>
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <FaMobile className="w-6 h-6 text-gray-500" />
                                    <p className="text-gray-500 text-sm font-light">{vendorData.contact.mobile_number}</p>
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <Building className="w-6 h-6 text-gray-500" />
                                    <div className="flex flex-col gap-0">
                                        <p className="text-gray-500 text-xs font-light text-wrap w-[250px]">{billingAddressData?.address1 || ""}</p>
                                        <p className="text-gray-500 text-xs font-light">{billingAddressData?.city || ""}, {billingAddressData?.state || ""}</p>
                                        <p className="text-gray-500 text-xs font-light">{billingAddressData?.zip || ""}, {billingAddressData?.country || ""}</p>
                                    </div>
                                </div>
                            </div>
                            : 
                            <div className="flex flex-col gap-2">
                                <p className="text-gray-500 text-sm font-light">No Contact Information</p>
                            </div>
                        }
                    </CardContent>
                </Card>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[50%] grow">
                    <TabsList className="grid grid-cols-6 w-full bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger 
                            value="contracts"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                            <FileText className="w-4 h-4" />
                            Contracts
                        </TabsTrigger>
                        <TabsTrigger 
                            value="performance"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger 
                            value="compliance"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Compliance
                        </TabsTrigger>
                        <TabsTrigger 
                            value="payments"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                            <CreditCard className="w-4 h-4" />
                            Payments
                        </TabsTrigger>
                        <TabsTrigger 
                            value="procurement"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                            <Package className="w-4 h-4" />
                            Procurement
                        </TabsTrigger>
                    </TabsList>

                    {/* Contracts Tab */}
                    <TabsContent value="contracts" className="mt-6">
                        <Card className="bg-white border shadow-sm">
                            <CardHeader className="border-b border-gray-200">
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Contract Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Contract
                                    </Button>
                                    <p className="text-gray-600 mt-4">
                                        Manage contracts, set expiration dates, and add tags.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="mt-6">
                        <Card className="bg-white border shadow-sm">
                            <CardHeader className="border-b border-gray-200">
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Performance Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8">
                                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                        <Star className="w-4 h-4 mr-2" />
                                        Evaluate Vendor
                                    </Button>
                                    <p className="text-gray-600 mt-4">
                                        Track performance scores and view summary dashboard.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Compliance Tab */}
                    <TabsContent value="compliance" className="mt-6">
                        <Card className="bg-white border shadow-sm">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                        Compliance Monitoring
                                    </CardTitle>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Compliance Status</label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-green-700 font-medium">Compliant</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Compliance Documents</label>
                                    <div className="space-y-3">
                                        {mockComplianceDocuments.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{doc.name}</p>
                                                        <p className="text-sm text-gray-600">Expires: {doc.expiryDate}</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(doc.status)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-6">
                        <Card className="bg-white border shadow-sm">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                        Payment & Invoice Management
                                    </CardTitle>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Record Payment
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Payment Summary</label>
                                    <p className="text-sm text-gray-600 mb-4">Net 30 payment terms</p>
                                    
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-blue-600">OUTSTANDING</p>
                                            <p className="text-2xl font-bold text-blue-600">$12,450.00</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-green-600">PAID (YTD)</p>
                                            <p className="text-2xl font-bold text-green-600">$48,320.75</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-purple-600">INVOICES</p>
                                            <p className="text-2xl font-bold text-purple-600">24</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Recent Invoices</label>
                                    <div className="space-y-3">
                                        {mockInvoices.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{invoice.id}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Issued: {invoice.issueDate} • Due: {invoice.dueDate}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(invoice.status)}
                                                    <span className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Procurement Tab */}
                    <TabsContent value="procurement" className="mt-6">
                        <Card className="bg-white border shadow-sm">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                        Procurement & Deliverables Tracking
                                    </CardTitle>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Package className="w-4 h-4 mr-2" />
                                        Create PO
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Purchase Orders</label>
                                    <div className="space-y-3">
                                        {mockPurchaseOrders.map((po) => (
                                            <div key={po.id} className="p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium text-gray-900">{po.id}</p>
                                                    <div className="flex items-center gap-3">
                                                        {getStatusBadge(po.status)}
                                                        <span className="font-semibold text-gray-900">${po.amount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Created: {po.created} • Due: {po.due}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    Items: {po.items}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Deliverables Status</label>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900">Office Chairs Delivery</span>
                                            <span className="text-sm text-gray-600">Due Dec 5, 2023</span>
                                        </div>
                                        <Progress value={75} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default VendorDetails;
