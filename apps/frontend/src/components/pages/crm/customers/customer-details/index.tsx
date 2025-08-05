// components/CustomerDetailStaticWithRadixTabs.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { BackHeader } from "@/components/ui/back-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/sheets/delete-confirmation-sheet";
import { useCustomerDetails, useCustomerMutations } from "@/hooks/useCustomers";
import { headerTitle } from "@/constants/HeaderTitle";
import { toast } from "sonner";

// ─── IMPORT YOUR RADIX-BASED TABS PRIMITIVES ─────────────────────────────────────
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // adjust this path if yours is different

import {
  Calendar,
  DollarSign,
  LineChart,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { MetricCard } from "../metrict-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductMetricCard } from "@/components/pages/production/product/product-metric-card";
import { OrdersTable } from "./orders-table";
import { CustomerContactInfo } from "./customer-contact-info";
import { ContactsTable } from "./contacts-table";
import { QuotesTable } from "./quotes-table";
import { useQuotesByCustomerId } from "@/hooks/useQuotes";
import { useCustomer } from "../../../../../hooks/useCustomers";
import * as React from "react";

import type { Customer } from "@/services/customers/types";

import type {
  CustomerWithContacts,
  Contact as LegacyContact,
  Address as LegacyAddress,
} from "@/types/customer";
import {
  setActiveCustomerID,
  setActiveCustomerTab,
} from "../../../../../features/customers/customersSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveQuotesID,
  setActiveQuotesNumber,
} from "../../../../../features/quotes/quotesSlice";
import { useCustomerKPI } from "../../../../../hooks/useOrders";
import { Skeleton } from "../../../../ui/skeleton";
import { InvoicesTable } from "./invoices-table";
import {
  setActiveOrdersID,
  setActiveOrdersNumber,
} from "../../../../../features/orders/ordersSlice";
import ActivityHistory from "./activity-history";
import { RootState } from "../../../../../store";
import { FilesTableWithSearch } from "./files-table-with-search";

type Order = {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  currency: string;
  status: "PROCESSING" | "COMPLETED" | "CANCELLED" | "ON_HOLD";
};

// Convert Customer to CustomerWithContacts format
function convertCustomerToLegacyFormat(
  customer: Customer
): CustomerWithContacts {
  // Map service contacts to legacy contact format
  const legacyContacts: LegacyContact[] = (customer?.contacts || []).map(
    (contact) => ({
      pk_contact_id: contact?.pk_contact_id,
      fk_id: customer?.pk_customer_id,
      first_name: contact?.first_name,
      last_name: contact?.last_name,
      email: contact?.email,
      phone_number: contact?.phone_number || null,
      mobile_number: contact?.mobile_number || null,
      position_title: contact?.position_title || null,
      contact_type: (contact?.contact_type || "OTHER") as
        | "PRIMARY"
        | "BILLING"
        | "SHIPPING"
        | "OTHER",
      table: "Customers",
      created_at: customer?.created_at,
      updated_at: customer?.updated_at || customer?.created_at,
    })
  );

  // Map service addresses to legacy address format
  const legacyAddresses: LegacyAddress[] = (customer?.addresses || []).map(
    (address) => ({
      pk_address_id: address.pk_address_id,
      fk_id: customer?.pk_customer_id,
      address1: address?.address1,
      address2: address?.address2 || "",
      city: address?.city,
      state: address?.state,
      zip: address?.zip,
      country: address?.country,
      address_type: address?.address_type,
      table: "Customers",
    })
  );

  return {
    pk_customer_id: customer?.pk_customer_id || -1,
    fk_organization_id: customer?.fk_organization_id || -1,
    name: customer?.name || "",
    email: customer?.email,
    phone_number: customer?.phone_number || null,
    mobile_number: customer?.mobile_number || null,
    website_url: customer?.website_url || null,
    billing_address: customer?.billing_address || null,
    shipping_address: customer?.shipping_address || null,
    city: customer?.city || null,
    state: customer?.state || null,
    postal_code: customer?.postal_code || null,
    country: customer?.country || null,
    industry: customer?.industry || null,
    customer_type:
      customer?.customer_type === "CUSTOMER"
        ? "CLIENT"
        : (customer?.customer_type as "LEAD" | "PROSPECT"),
    status: customer?.status as "ACTIVE" | "INACTIVE",
    source: customer?.source || null,
    converted_at: customer?.converted_at || null,
    notes: customer?.notes || null,
    vat_number: customer?.vat_number || null,
    tax_id: customer?.tax_id || null,
    tags: customer?.tags || null,
    created_at: customer?.created_at,
    updated_at: customer?.updated_at || null,
    contacts: legacyContacts,
    addresses: legacyAddresses,
  };
}

export function CustomerDetail() {
  // ✅ ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, BEFORE ANY CONDITIONAL LOGIC
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const customerId = Number(params.customerId);

  const { data: customer, isLoading, error } = useCustomerDetails(customerId);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { deleteCustomer } = useCustomerMutations();

  const customerActiveTab = useSelector(
    (state: RootState) => state.customers.customerActiveTab
  );

  // Fetch quotes for this customer
  const {
    data: quotesResponse,
    isLoading: quotesLoading,
    error: quotesError,
    refetch: quotesRefetch,
  } = useQuotesByCustomerId(Number(customerId), { page: 1, limit: 10 });

  const {
    data: dataCustomerKPI,
    isLoading: isLoadingCustomerKPI,
    error: errorCustomerKPI,
    refetch: refetchCustomerKPI,
  } = useCustomerKPI(customerId);

  quotesRefetch().then();
  refetchCustomerKPI().then();

  // ✅ MOVED THIS HOOK TO THE TOP - BEFORE ANY EARLY RETURNS
  const [activeTab, setActiveTab] = useState<string>(
    customerActiveTab.length > 0 ? customerActiveTab : "quotes"
  );

  // Now we can safely do early returns after ALL hooks have been called
  const { list } = headerTitle.crmCustomers;
  const quotes = quotesResponse?.items || [];

  // Early return for loading state – render skeletons inside page layout
  if (isLoading) {
    return (
      <div className="space-y-6 px-6 pb-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-[200px] w-full" />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Left column skeleton for Contact Info */}
          <CustomerContactInfo
            isLoading
            customer={{
              id: "-1",
              name: "",
              email: "",
              phone: "",
            }}
          />

          {/* Right column skeleton */}
          <div className="lg:col-span-4 space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[300px] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error && !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-destructive">
          Error: {error?.message || "Customer not found"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Early return if customer is still undefined
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-destructive">Customer not found</p>
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Now we can safely convert the customer
  const legacyCustomer = convertCustomerToLegacyFormat(customer);

  async function handleConfirmDelete() {
    try {
      await deleteCustomer.mutateAsync(Number(customerId));
      toast.success("Customer deleted successfully");
      router.push(list.href);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      toast.error("Failed to delete customer");
    } finally {
      setIsSheetOpen(false);
    }
  }

  /** ────────── 1. STATIC DATA ───────────────────────────────────────────────── */

  // Get primary contact
  const primaryContact = Array.isArray(legacyCustomer.contacts)
    ? legacyCustomer.contacts.find(
        (contact) => contact.contact_type === "PRIMARY"
      )
    : undefined;

  const billingAddress = Array.isArray(legacyCustomer.addresses)
    ? legacyCustomer.addresses.find(
        (address) => address.address_type === "BILLING"
      )
    : undefined;

  /** ────────── 3. CLIENT-STATE FOR RADIX TABS ───────────────────────────────── */

  // Radix Tabs use string values on each <TabsTrigger value="…">.
  // These "tab IDs" must match the value attribute on each <TabsTrigger>
  const allTabs: { id: string; label: string }[] = [
    { id: "quotes", label: "Quotes" },
    { id: "orders", label: "Orders" },
    { id: "invoices", label: "Invoices" },
    { id: "contacts", label: "Contacts" },
    { id: "activity", label: "Activity" },
    { id: "files", label: "Files" },
  ];

  /** ────────── 5. RENDER THE LAYOUT ───────────────────────────────────────────── */

  const handleAddQuoteClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(customerId));
    router.push("/crm/quotes/add");
  };

  const handleAddOrderClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(customerId));

    // @ts-ignore
    dispatch(setActiveQuotesID(-1));

    // @ts-ignore
    dispatch(setActiveQuotesNumber(""));
    router.push("/crm/orders/add");
  };

  const handleAddInvoiceClick = () => {
    // @ts-ignore
    dispatch(setActiveCustomerID(customerId));

    // @ts-ignore
    dispatch(setActiveQuotesID(-1));

    // @ts-ignore
    dispatch(setActiveOrdersID(-1));

    // @ts-ignore
    dispatch(setActiveOrdersNumber(""));

    router.push("/crm/invoices/add");
  };

  return (
    <div className="space-y-6 px-6 pb-6">
      {/* confirmation dialog */}
      <DeleteConfirmationDialog
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Delete Customer?"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        onDelete={handleConfirmDelete}
        onCancel={() => setIsSheetOpen(false)}
      />

      {/* ─── Top Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <BackHeader href="/crm/customers" title={legacyCustomer.name} />
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Customer ID: {legacyCustomer.pk_customer_id}</span>
            <StatusBadge status={legacyCustomer.status} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <p className="text-xs text-slate-400 mr-4">
            Last updated:{" "}
            {new Date(
              legacyCustomer.updated_at || legacyCustomer.created_at
            ).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          {/* <Button size="sm" variant="outline">
                    Edit
                </Button> */}
          <Button size="sm" variant="outline">
            Payment Request
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsSheetOpen(true)}
            disabled={deleteCustomer.isPending}
          >
            {deleteCustomer.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* ─── Metric Cards ────────────────────────────────────────────────────────── */}
      {isLoadingCustomerKPI ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-[200px] w-[25%]" />
          <Skeleton className="h-[200px] w-[25%]" />
          <Skeleton className="h-[200px] w-[25%]" />
          <Skeleton className="h-[200px] w-[25%]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProductMetricCard
            title="Total Orders"
            value={dataCustomerKPI?.orderCount || 0}
            helper=""
            icon={Calendar}
            variant="blue"
          />
          <ProductMetricCard
            title="Total Spent"
            value={`$${(dataCustomerKPI?.totalAmount || 0).toFixed(2)}`}
            helper=""
            icon={DollarSign}
            variant="green"
          />
          <ProductMetricCard
            title="Last Order"
            value={
              dataCustomerKPI?.lastOrder?.orderDate
                ? new Date(
                    dataCustomerKPI.lastOrder.orderDate
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
            helper=""
            icon={Calendar}
            variant="violet"
          />
          <ProductMetricCard
            title="Avg. Order Value"
            value={`$${(dataCustomerKPI?.averageOrderValue || 0).toFixed(2)}`}
            helper=""
            icon={LineChart}
            variant="red"
          />
        </div>
      )}

      {/* ─── Main Grid: Left (Contact Info + Notes) + Right (Radix Tabs & Content) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* ─── Left Column ───────────────────────────────────────────────────────── */}

        {/*  region Customer Contact Info*/}
        <CustomerContactInfo
          isLoading={isLoading}
          customer={{
            id: legacyCustomer.pk_customer_id.toString(),
            name: primaryContact
              ? `${primaryContact.first_name} ${primaryContact.last_name}`
              : legacyCustomer.name,
            email: primaryContact?.email || legacyCustomer.email,
            phone:
              primaryContact?.phone_number || legacyCustomer.phone_number || "",
            website: legacyCustomer.website_url || undefined,
            address: billingAddress?.address1 || undefined,
            city: billingAddress?.city || undefined,
            state: billingAddress?.state || undefined,
            zip: billingAddress?.zip || undefined,
            country: billingAddress?.country || undefined,
            notes: legacyCustomer.notes || undefined,
            positionTitle: primaryContact?.position_title || undefined,
          }}
        />
        {/*endregion*/}

        {/* ─── Right Column ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          {/* ─ Radix Tabs Root ───────────────────────────────────────────── */}
          <Tabs
            value={activeTab}
            onValueChange={(e) => {
              setActiveTab(e);
              // @ts-ignore
              dispatch(setActiveCustomerTab(e));
            }}
            className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-2 shadow-sm"
          >
            <TabsList className="flex flex-wrap justify-between border-b w-full">
              {allTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="quotes">
              <div className="overflow-auto">
                {quotesError ? (
                  <div className="p-4 text-red-500">
                    Error loading quotes: {quotesError.message}
                  </div>
                ) : (
                  <QuotesTable
                    quotes={quotes}
                    isLoading={quotesLoading}
                    onAddQuoteClick={handleAddQuoteClick}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="orders">
              <div className="overflow-auto">
                <OrdersTable
                  customerId={customerId}
                  onAddOrderClick={handleAddOrderClick}
                />
              </div>
            </TabsContent>
            <TabsContent value="invoices">
              <div className="overflow-auto">
                <InvoicesTable
                  customerId={customerId}
                  onAddInvoiceClick={handleAddInvoiceClick}
                />
              </div>
            </TabsContent>
            <TabsContent value="contacts">
              <div className="overflow-auto">
                <ContactsTable
                  contacts={
                    Array.isArray(legacyCustomer.contacts)
                      ? legacyCustomer.contacts.map((c) => ({
                          ...c,
                          position_title: c.position_title ?? undefined,
                          phone_number: c.phone_number ?? undefined,
                        }))
                      : []
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <ActivityHistory customerID={customerId} />
            </TabsContent>
            <TabsContent value="files">
              <FilesTableWithSearch customerId={customerId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
