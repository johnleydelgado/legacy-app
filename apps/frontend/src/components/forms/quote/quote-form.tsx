// "use client";
//
// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import {
//   Mail,
//   Printer,
//   Download,
//   User,
//   MapPin,
//   FileText,
//   ShoppingCart,
//   Plus,
//   ChevronDown,
// } from "lucide-react";
//
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { QuoteForm, CreateQuotePayload } from "@/types/quote";
// import { CustomerWithContacts } from "@/types/customer";
// import { QuoteHeaderActions } from "./quote-header-actions";
// import { CustomerSelectionSection } from "./customer-selection-section";
// import { CustomerInfoSection } from "./customer-info-section";
// import { QuoteItemsSection } from "./quote-items-section";
// import { QuoteSummarySection } from "./quote-summary-section";
// import { useCreateQuote } from "@/hooks/useQuotes";
// import { useCreateQuoteItem } from "@/hooks/useQuoteItems";
// import { CreateQuoteItemRequest } from "@/services/quote-items/types";
// import { mapQuoteItemFormToDto } from "@/lib/mappers/qoute/quote-item-mapping";
//
// interface Props {
//   initial: QuoteForm;
//   customers?: CustomerWithContacts[];
//   onSubmit?: (data: CreateQuotePayload) => void | Promise<void>;
// }
//
// export function QuoteFormUI({ initial, customers = [], onSubmit }: Props) {
//   const [isSubmitting, setIsSubmitting] = React.useState(false);
//   const router = useRouter();
//   const createQuote = useCreateQuote();
//   const createQuoteItem = useCreateQuoteItem();
//
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { isDirty, isValid },
//   } = useForm<QuoteForm>({
//     defaultValues: initial,
//     mode: "onChange",
//   });
//
//   const form = watch();
//
//   const updateField =
//     <K extends keyof QuoteForm>(key: K) =>
//     (value: QuoteForm[K]) =>
//       setValue(key, value as any, { shouldDirty: true });
//
//   const handleFormSubmit = async (data: QuoteForm) => {
//     setIsSubmitting(true);
//     try {
//       // Build quote payload (snake_case, as per backend CreateQuotesDto)
//       const quotePayload = {
//         fkCustomerID: Number(data.customerId),
//         quoteDate: data.quoteDate,
//         expirationDate: data.expirationDate,
//         status: data.status,
//         subtotal: data.subtotal,
//         taxTotal: data.taxTotal,
//         currency: data.currency,
//         notes: data.notes,
//         terms: data.terms,
//         tags: JSON.stringify(data.tags),
//       };
//
//       // Create the quote first
//       const newQuote = await createQuote.mutateAsync(quotePayload);
//
//       // Create quote items (camelCase, as per backend CreateQuotesItemsDto)
//       if (data.items && data.items.length > 0) {
//         const quoteItemsPromises = data.items.map((item) => {
//           const quoteItemPayload = mapQuoteItemFormToDto(
//             item,
//             newQuote.pk_quote_id
//           );
//
//           return createQuoteItem.mutateAsync(quoteItemPayload as any);
//         });
//
//         await Promise.all(quoteItemsPromises);
//       }
//
//       alert("Quote created successfully");
//       router.push("/crm/quotes");
//     } catch (error) {
//       console.error("Error submitting quote:", error);
//       alert("Failed to create quote. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   return (
//     <div className="space-y-6 pb-4">
//       {/* Quote Header with Actions */}
//       <QuoteHeaderActions
//         quoteNumber={form.quoteNumber || "New Quote"}
//         onBack={() => router.push("/crm/quotes")}
//         onSubmit={handleSubmit(handleFormSubmit)}
//       />
//
//       {/* Info Banner */}
//       <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
//         <div className="flex items-center gap-2">
//           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//           <p className="text-sm font-medium text-blue-900">
//             Creating new quote
//           </p>
//         </div>
//         <p className="text-sm text-blue-700 mt-1">
//           Select a customer and add items to your quote. Once saved, the quote
//           will be available in the quotes list.
//         </p>
//       </div>
//
//       <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
//         {/* Quote Title */}
//         <div className="flex items-center gap-3">
//           <h1 className="text-xl font-semibold">New Quote</h1>
//           <Button variant="ghost" size="sm" className="text-muted-foreground">
//             <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </Button>
//         </div>
//
//         {/* Customer Selection */}
//         <CustomerSelectionSection
//           selectedCustomerId={form.customerId}
//           customerName={form.customerName}
//           onCustomerSelect={(
//             customerId: string | number,
//             customerName: string
//           ) => {
//             updateField("customerId")(customerId);
//             updateField("customerName")(customerName);
//           }}
//           onCustomerDataUpdate={(customerData) => {
//             if (customerData.billingAddress) {
//               updateField("billingAddress")(customerData.billingAddress);
//             }
//             if (customerData.shippingAddress) {
//               updateField("shippingAddress")(customerData.shippingAddress);
//             }
//             if (customerData.customerNotes) {
//               updateField("customerNotes")(customerData.customerNotes);
//             }
//           }}
//         />
//
//         {/* Customer Information Sections */}
//         <CustomerInfoSection
//           billingAddress={form.billingAddress}
//           shippingAddress={form.shippingAddress}
//           customerNotes={form.customerNotes}
//           customerId={form.customerId}
//           onUpdateBilling={(address: QuoteForm["billingAddress"]) =>
//             updateField("billingAddress")(address)
//           }
//           onUpdateShipping={(address: QuoteForm["shippingAddress"]) =>
//             updateField("shippingAddress")(address)
//           }
//           onUpdateNotes={(notes: string) => updateField("customerNotes")(notes)}
//         />
//
//         {/* Quote Items */}
//         <QuoteItemsSection
//           items={form.items}
//           selectedCustomerId={
//             form.customerId ? Number(form.customerId) : undefined
//           }
//           onUpdateItems={(items: QuoteForm["items"]) =>
//             updateField("items")(items)
//           }
//           onUpdateTotals={(
//             subtotal: number,
//             taxTotal: number,
//             totalAmount: number
//           ) => {
//             updateField("subtotal")(subtotal);
//             updateField("taxTotal")(taxTotal);
//             updateField("totalAmount")(totalAmount);
//           }}
//         />
//
//         {/* Quote Summary */}
//         <QuoteSummarySection
//           totalQuantity={
//             form.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
//             0
//           }
//           itemTotal={form.subtotal || 0}
//           feesTotal={0} // You can add fees logic here if needed
//           subTotal={form.subtotal || 0}
//           tax={form.taxTotal || 0}
//           totalDue={form.totalAmount || 0}
//           paid={0} // You can add payment tracking here if needed
//           currency={form.currency || "USD"}
//         />
//
//         {/* Hidden form fields for other data */}
//         <input type="hidden" {...register("quoteNumber")} />
//         <input type="hidden" {...register("quoteDate")} />
//         <input type="hidden" {...register("expirationDate")} />
//         <input type="hidden" {...register("status")} />
//         <input type="hidden" {...register("currency")} />
//         <input type="hidden" {...register("notes")} />
//         <input type="hidden" {...register("terms")} />
//       </form>
//     </div>
//   );
// }
