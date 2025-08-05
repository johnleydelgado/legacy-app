"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  Package,
  Truck,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Factory interface for type safety
export interface FactoryData {
  pk_factories_id: number;
  name: string;
  email: string;
  website_url: string;
  industry: string;
  notes: string;
  status: string;
  user_owner: string;
  service_category?: string;
  location?: string;
  factory_type?: string;
  billing_address?: {
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact_person?: {
    name: string;
    phone: string;
    email: string;
  };
}

// Production Order Data interface - Simplified
export interface ProductionOrderData {
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  shippingMethod: string;
  notes: string;
}

// Form schema - Simplified
const formSchema = z.object({
  orderDate: z.date({
    required_error: "Order date is required.",
  }),
  expectedDeliveryDate: z.date({
    required_error: "Expected delivery date is required.",
  }),
  actualDeliveryDate: z.date().optional(),
  shippingMethod: z.string().min(1, {
    message: "Shipping method is required.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductionOrderDetailsFormProps {
  productionOrderData: ProductionOrderData;
  setProductionOrderData: React.Dispatch<
    React.SetStateAction<ProductionOrderData>
  >;
  factoryData?: FactoryData | null;
}

const ProductionOrderDetailsForm = ({
  productionOrderData,
  setProductionOrderData,
  factoryData,
}: ProductionOrderDetailsFormProps) => {
  const [orderDateOpen, setOrderDateOpen] = React.useState(false);
  const [expectedDeliveryDateOpen, setExpectedDeliveryDateOpen] =
    React.useState(false);
  const [actualDeliveryDateOpen, setActualDeliveryDateOpen] =
    React.useState(false);

  // Helper functions to convert between string and Date
  const stringToDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  const dateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderDate: stringToDate(productionOrderData.orderDate),
      expectedDeliveryDate: stringToDate(
        productionOrderData.expectedDeliveryDate
      ),
      actualDeliveryDate: stringToDate(productionOrderData.actualDeliveryDate),
      shippingMethod: productionOrderData.shippingMethod,
      notes: productionOrderData.notes,
    },
  });

  // Update parent state function - memoized to prevent unnecessary re-renders
  const updateParentState = React.useCallback(
    (field: keyof FormValues, value: any) => {
      setProductionOrderData((prev) => {
        const updatedData: ProductionOrderData = { ...prev };

        switch (field) {
          case "orderDate":
            updatedData.orderDate = dateToString(value as Date);
            break;
          case "expectedDeliveryDate":
            updatedData.expectedDeliveryDate = dateToString(value as Date);
            break;
          case "actualDeliveryDate":
            updatedData.actualDeliveryDate = dateToString(value as Date);
            break;
          case "shippingMethod":
            updatedData.shippingMethod = value || "";
            break;
          case "notes":
            updatedData.notes = value || "";
            break;
        }

        return updatedData;
      });
    },
    [setProductionOrderData, dateToString]
  );

  React.useEffect(() => {
    if (productionOrderData) {
      form.reset({
        orderDate: stringToDate(productionOrderData.orderDate),
        expectedDeliveryDate: stringToDate(
          productionOrderData.expectedDeliveryDate
        ),
        actualDeliveryDate: stringToDate(
          productionOrderData.actualDeliveryDate
        ),
        shippingMethod: productionOrderData.shippingMethod,
        notes: productionOrderData.notes,
      });
    }
  }, [productionOrderData, form]);

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center gap-3 py-6 border-b border-gray-100">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Production Order Details
          </h2>
          <p className="text-gray-600 text-sm">
            Manage order dates, shipping, and additional notes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Factory Billing Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-900 rounded-lg p-2.5">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Billing Information</h3>
                <p className="text-gray-600 text-sm">Factory Details</p>
              </div>
            </div>

            {factoryData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-base mb-1">
                    {factoryData.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {factoryData.service_category || factoryData.industry}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {factoryData.location && (
                      <Badge variant="secondary" className="text-xs">
                        📍 {factoryData.location}
                      </Badge>
                    )}
                    {factoryData.factory_type && (
                      <Badge variant="secondary" className="text-xs">
                        🏭 {factoryData.factory_type}
                      </Badge>
                    )}
                    {factoryData.industry && (
                      <Badge variant="secondary" className="text-xs">
                        🏢 {factoryData.industry}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {factoryData.billing_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <div>{factoryData.billing_address.street1}</div>
                        <div>
                          {factoryData.billing_address.city}, {factoryData.billing_address.state}{" "}
                          {factoryData.billing_address.zip}
                        </div>
                        <div>{factoryData.billing_address.country}</div>
                      </div>
                    </div>
                  )}

                  {factoryData.contact_person?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {factoryData.contact_person.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                      {factoryData.contact_person?.email || factoryData.email}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500 text-sm">No factory selected</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Date */}
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Order Date
                      </FormLabel>
                      <Popover
                        open={orderDateOpen}
                        onOpenChange={setOrderDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal h-11 px-4 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              {field.value ? (
                                <span className="text-gray-900">
                                  {field.value.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  Select order date
                                </span>
                              )}
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              updateParentState("orderDate", date);
                              setOrderDateOpen(false);
                            }}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expected Delivery Date */}
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Expected Delivery Date
                      </FormLabel>
                      <Popover
                        open={expectedDeliveryDateOpen}
                        onOpenChange={setExpectedDeliveryDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal h-11 px-4 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              {field.value ? (
                                <span className="text-gray-900">
                                  {field.value.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  Select expected date
                                </span>
                              )}
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              updateParentState("expectedDeliveryDate", date);
                              setExpectedDeliveryDateOpen(false);
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actual Delivery Date */}
                <FormField
                  control={form.control}
                  name="actualDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Actual Delivery Date
                        <span className="text-gray-500 font-normal ml-1">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Popover
                        open={actualDeliveryDateOpen}
                        onOpenChange={setActualDeliveryDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal h-11 px-4 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              {field.value ? (
                                <span className="text-gray-900">
                                  {field.value.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  Select actual date
                                </span>
                              )}
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              updateParentState("actualDeliveryDate", date);
                              setActualDeliveryDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shipping Method */}
                <FormField
                  control={form.control}
                  name="shippingMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Shipping Method
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          updateParentState("shippingMethod", value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 px-4 rounded-xl border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-colors">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-gray-400" />
                              <SelectValue placeholder="Choose shipping method" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OCEAN" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Ocean Freight
                            </div>
                          </SelectItem>
                          <SelectItem value="AIR" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Air Freight
                            </div>
                          </SelectItem>
                          <SelectItem value="GROUND" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              Ground Transport
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="EXPRESS"
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Express Delivery
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes Section - Full Width */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Production Notes
                        <span className="text-gray-500 font-normal ml-1">
                          (Optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any special instructions, requirements, or notes for this production order..."
                          className="resize-none h-24 rounded-xl border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-colors text-sm leading-relaxed"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updateParentState("notes", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ProductionOrderDetailsForm;
