"use client";

import * as React from 'react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Mail, 
  Calendar,
  DollarSign,
  Search,
  Filter
} from "lucide-react";

import { useDashboardCustomers } from "@/hooks/useDashboard";

const CustomersList = () => {
    const { data: customersData, isLoading, isError, error } = useDashboardCustomers();
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedTab, setSelectedTab] = React.useState("all");

    // Filter customers based on search term
    const filteredActivities = React.useMemo(() => {
        if (!customersData?.customerActivities) return [];
        
        return customersData.customerActivities.filter(customer =>
            customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customersData?.customerActivities, searchTerm]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCustomerInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Loading skeleton for metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2" />
                                <div className="h-3 bg-muted rounded animate-pulse w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                {/* Loading skeleton for table */}
                <Card>
                    <CardHeader>
                        <div className="h-6 bg-muted rounded animate-pulse w-48" />
                        <div className="h-4 bg-muted rounded animate-pulse w-96" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded animate-pulse w-32" />
                                        <div className="h-3 bg-muted rounded animate-pulse w-48" />
                                    </div>
                                    <div className="h-4 bg-muted rounded animate-pulse w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Customer Data</CardTitle>
                    <CardDescription>
                        {error?.message || 'Failed to load customer information'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!customersData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>No customer data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Customer Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customersData.totalCustomers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered customers
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customersData.activeCustomers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((customersData.activeCustomers / customersData.totalCustomers) * 100).toFixed(1)}% of total
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{customersData.newThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            New registrations
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Management Interface */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{customersData.title}</CardTitle>
                            <CardDescription>{customersData.description}</CardDescription>
                        </div>
                        <Button className="hidden">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="all">All Customers</TabsTrigger>
                                <TabsTrigger value="top">Top Customers</TabsTrigger>
                            </TabsList>
                            
                            <div className="flex items-center space-x-2 hidden">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search customers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-64"
                                    />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="all" className="space-y-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Order</TableHead>
                                            <TableHead>Total Orders</TableHead>
                                            <TableHead>Total Spent</TableHead>
                                            <TableHead>Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredActivities.slice(0, 10).map((customer) => (
                                            <TableRow key={`${customer.customerId}-${customer.customerEmail}`}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                                                            <AvatarFallback>
                                                                {getCustomerInitials(customer.customerName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{customer.customerName}</div>
                                                            <div className="text-sm text-muted-foreground flex items-center">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {customer.customerEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(customer.status)}>
                                                        {customer.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {customer.lastOrderDate ? (
                                                        <div className="flex items-center text-sm">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(customer.lastOrderDate)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">No orders</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{customer.totalOrders}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        {formatCurrency(customer.totalSpent)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(customer.createdAt)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {filteredActivities.length > 10 && (
                                <div className="flex justify-center">
                                    <Button variant="outline">
                                        Load More Customers
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="top" className="space-y-4">
                            <div className="grid gap-4">
                                {customersData.topCustomers.slice(0, 10).map((customer, index) => (
                                    <Card key={`${customer.customerId}-${customer.customerEmail}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                                                            <AvatarFallback>
                                                                {getCustomerInitials(customer.customerName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <Badge 
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
                                                            variant={index < 3 ? "default" : "secondary"}
                                                        >
                                                            {index + 1}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{customer.customerName}</h3>
                                                        <p className="text-sm text-muted-foreground flex items-center">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            {customer.customerEmail}
                                                        </p>
                                                        {customer.lastOrderDate && (
                                                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                Last order: {formatDate(customer.lastOrderDate)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">
                                                        {formatCurrency(customer.totalSpent)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {customer.totalOrders} orders
                                                    </div>
                                                    <Badge className={getStatusColor(customer.status)}>
                                                        {customer.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomersList;
