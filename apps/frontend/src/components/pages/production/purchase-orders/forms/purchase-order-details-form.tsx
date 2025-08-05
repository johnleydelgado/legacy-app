'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, MapPin, AlertTriangle } from 'lucide-react';

// Import the type from parent component
import { PurchaseOrderData } from '../add';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllLocationTypes } from '@/hooks/useLocationTypes';
import { PurchaseOrderPriority } from '@/services/purchase-orders/types';

// Form schema
const formSchema = z.object({
    clientName: z.string().min(2, {
      message: "Client name must be at least 2 characters.",
    }),
    clientDescription: z.string().min(10, {
      message: "Client description must be at least 10 characters.",
    }),
    quoteApproveDate: z.date({
      required_error: "Quote approve date is required.",
    }),
    pdSignedDate: z.date({
      required_error: "PD signed date is required.",
    }),
    shippingDate: z.date({
      required_error: "Shipping date is required.",
    }),
    totalQuantity: z.number().min(1, {
      message: "Total quantity must be at least 1.",
    }),
    userOwner: z.string().min(2, {
      message: "User owner must be at least 2 characters.",
    }),
    locationTypeId: z.number().min(1, {
      message: "Location type is required.",
    }),
    priority: z.nativeEnum(PurchaseOrderPriority, {
      required_error: "Priority is required.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface PurchaseOrderDetailsFormProps {
    purchaseOrderData: PurchaseOrderData;
    setPurchaseOrderData: React.Dispatch<React.SetStateAction<PurchaseOrderData>>;
    setModifyFlag?: (modifyFlag: boolean) => void;
}

const PurchaseOrderDetailsForm = ({ purchaseOrderData, setPurchaseOrderData, setModifyFlag }: PurchaseOrderDetailsFormProps) => {
    const [quoteApproveDateOpen, setQuoteApproveDateOpen] = React.useState(false);
    const [pdSignedDateOpen, setPdSignedDateOpen] = React.useState(false);
    const [shippingDateOpen, setShippingDateOpen] = React.useState(false);

    const { data: locationTypes, isLoading: locationTypesLoading } = useAllLocationTypes();

    // Helper functions to convert between string and Date
    const stringToDate = (dateString: string): Date | undefined => {
        if (!dateString) return undefined;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? undefined : date;
    };

    const dateToString = (date: Date | undefined): string => {
        if (!date) return '';
        // Use local date components instead of UTC to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Priority styling helper
    const getPriorityColor = (priority: PurchaseOrderPriority) => {
        switch (priority) {
            case PurchaseOrderPriority.URGENT:
                return 'bg-red-600 text-white';
            case PurchaseOrderPriority.HIGH:
                return 'bg-orange-600 text-white';
            case PurchaseOrderPriority.NORMAL:
                return 'bg-green-600 text-white';
            case PurchaseOrderPriority.LOW:
                return 'bg-gray-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    // Priority text formatting helper
    const formatPriorityText = (priority: PurchaseOrderPriority) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: purchaseOrderData.clientName,
            clientDescription: purchaseOrderData.clientDescription,
            quoteApproveDate: stringToDate(purchaseOrderData.quoteApproveDate),
            pdSignedDate: stringToDate(purchaseOrderData.pdSignedDate),
            shippingDate: stringToDate(purchaseOrderData.shippingDate),
            totalQuantity: purchaseOrderData.totalQuantity,
            userOwner: purchaseOrderData.userOwner,
            locationTypeId: purchaseOrderData.locationTypeId || 2,
            priority: purchaseOrderData.priority || PurchaseOrderPriority.NORMAL,
        },
    });

    // Update parent state function - memoized to prevent unnecessary re-renders
    const updateParentState = React.useCallback((field: keyof FormValues, value: any) => {
        if (setModifyFlag) {
            setModifyFlag(true);
        }
        
        setPurchaseOrderData(prev => {
            const updatedData: PurchaseOrderData = { ...prev };
            
            switch (field) {
                case 'quoteApproveDate':
                    updatedData.quoteApproveDate = dateToString(value as Date);
                    break;
                case 'pdSignedDate':
                    updatedData.pdSignedDate = dateToString(value as Date);
                    break;
                case 'shippingDate':
                    updatedData.shippingDate = dateToString(value as Date);
                    break;
                case 'clientName':
                    updatedData.clientName = value || '';
                    break;
                case 'clientDescription':
                    updatedData.clientDescription = value || '';
                    break;
                case 'userOwner':
                    updatedData.userOwner = value || '';
                    break;
                case 'totalQuantity':
                    updatedData.totalQuantity = value || 0;
                    break;
                case 'locationTypeId':
                    updatedData.locationTypeId = value || 0;
                    break;
                case 'priority':
                    updatedData.priority = value || PurchaseOrderPriority.NORMAL;
                    break;
            }
            
            return updatedData;
        });
    }, [setPurchaseOrderData, dateToString]);


    React.useEffect(() => {
        if (purchaseOrderData) {
            form.reset({
                clientName: purchaseOrderData.clientName,
                clientDescription: purchaseOrderData.clientDescription,
                quoteApproveDate: stringToDate(purchaseOrderData.quoteApproveDate),
                pdSignedDate: stringToDate(purchaseOrderData.pdSignedDate),
                shippingDate: stringToDate(purchaseOrderData.shippingDate),
                totalQuantity: purchaseOrderData.totalQuantity,
                userOwner: purchaseOrderData.userOwner,
                locationTypeId: purchaseOrderData.locationTypeId || 2,
                priority: purchaseOrderData.priority || PurchaseOrderPriority.NORMAL,
            });
        }
    }, [purchaseOrderData, form]);

    return (
        <Form {...form}>
            <div className="flex flex-row gap-x-4 flex-wrap">
                <div className="w-[30%] grow space-y-2">
                    {/* Client Name */}
                    <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client Name</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Enter client name" 
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            updateParentState('clientName', e.target.value);
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Client Description */}
                    <FormField
                        control={form.control}
                        name="clientDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client Description</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Enter client description" 
                                        className="resize-none h-[100px]"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            updateParentState('clientDescription', e.target.value);
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    
                </div>
                <div className="w-[30%] grow space-y-2">
                    {/* Quote Approve Date */}
                    <FormField
                        control={form.control}
                        name="quoteApproveDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Quote Approve Date</FormLabel>
                                <Popover open={quoteApproveDateOpen} onOpenChange={setQuoteApproveDateOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between font-normal"
                                            >
                                                {field.value ? field.value.toLocaleDateString() : "Select date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                updateParentState('quoteApproveDate', date);
                                                setQuoteApproveDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* PD Signed Date */}
                    <FormField
                        control={form.control}
                        name="pdSignedDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>PD Signed Date</FormLabel>
                                <Popover open={pdSignedDateOpen} onOpenChange={setPdSignedDateOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between font-normal"
                                            >
                                                {field.value ? field.value.toLocaleDateString() : "Select date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                updateParentState('pdSignedDate', date);
                                                setPdSignedDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Shipping Date */}
                    <FormField
                        control={form.control}
                        name="shippingDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Shipping Date</FormLabel>
                                <Popover open={shippingDateOpen} onOpenChange={setShippingDateOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between font-normal"
                                            >
                                                {field.value ? field.value.toLocaleDateString() : "Select date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                updateParentState('shippingDate', date);
                                                setShippingDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="w-[30%] grow space-y-2">
                    <div className="flex flex-row gap-x-2 w-full">
                        {/* Location Type */}
                        <FormField
                            control={form.control}
                            name="locationTypeId"
                            render={({ field }) => {
                                const selectedLocation = locationTypes?.find(location => location.pk_location_type_id === field.value);
                                
                                return (
                                    <FormItem className="flex-1">
                                        <FormLabel className="flex items-center gap-2">
                                            Location Type
                                        </FormLabel>
                                        <Select
                                            value={field.value ? field.value.toString() : ""}
                                            onValueChange={(value) => {
                                                const numValue = Number(value);
                                                field.onChange(numValue);
                                                updateParentState('locationTypeId', numValue);
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select location type">
                                                        {selectedLocation && (
                                                            <div 
                                                                className="flex items-center gap-2 text-white px-2 py-1 rounded" 
                                                                style={{ backgroundColor: selectedLocation.color }}
                                                            >
                                                                {selectedLocation.name}
                                                            </div>
                                                        )}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {locationTypes?.map((location) => (
                                                    <SelectItem 
                                                        key={location.pk_location_type_id} 
                                                        value={location.pk_location_type_id.toString()}
                                                    >
                                                        <div className="flex items-center gap-2 text-white px-2 py-1 rounded" style={{ backgroundColor: location.color }}>
                                                            {location.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>{}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {/* Priority */}
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="flex items-center gap-2">
                                        Priority
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value as PurchaseOrderPriority);
                                            updateParentState('priority', value as PurchaseOrderPriority);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select priority">
                                                    {field.value && (
                                                        <div className={`flex items-center gap-2 px-2 py-1 rounded ${getPriorityColor(field.value)}`}>
                                                            {formatPriorityText(field.value)}
                                                        </div>
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(PurchaseOrderPriority).map((priority) => (
                                                <SelectItem key={priority} value={priority}>
                                                    <div className={`flex items-center gap-2 px-2 py-1 rounded ${getPriorityColor(priority)}`}>
                                                        {formatPriorityText(priority)}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>{}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* User Owner */}
                    <FormField
                        control={form.control}
                        name="userOwner"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>User Owner</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Enter user owner" 
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            updateParentState('userOwner', e.target.value);
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Total Quantity */}
                    <FormField
                        control={form.control}
                        name="totalQuantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Quantity</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder="Enter total quantity" 
                                        {...field}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            field.onChange(value);
                                            updateParentState('totalQuantity', value);
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>{}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </Form>
    );
};

export default PurchaseOrderDetailsForm;
