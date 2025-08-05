// CustomerSelect.tsx  ⎯ replaces your previous AlertDialog block
// --------------------------------------------------------------
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, User, Mail, Phone, TabletSmartphone } from "lucide-react";

/* props that live in the parent component */
interface Props {
  /** show / hide dialog */
  selectCustomer: boolean;
  setSelectCustomer: (v: boolean) => void;

  /** currently-selected customer id */
  selectedCustomerId: number | null;
  setSelectedCustomerId: (id: number | null) => void;

  /* --- virtual-scroll state & helpers (unchanged) ------------------- */
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  totalHeight: number;
  offsetY: number;
  visibleCustomers: any[]; // keep your existing type
  customerID: number | null;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleCustomerSelect: (id: number) => void;
}

/* ------------------------------------------------------------------- */
export function CustomerSelectDialog({
  selectCustomer,
  setSelectCustomer,
  selectedCustomerId,
  setSelectedCustomerId,
  searchTerm,
  setSearchTerm,
  totalHeight,
  offsetY,
  visibleCustomers,
  customerID,
  handleScroll,
  handleCustomerSelect,
}: Props) {
  if (!selectCustomer) return null;

  return (
    <Dialog open={selectCustomer} onOpenChange={setSelectCustomer}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0 flex flex-col">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Select Customer
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectCustomer(false)}
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        {/* <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div> */}

        {/* ── Virtualised list ───────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto min-h-0 max-h-[calc(80vh-180px)]"
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div
              className="flex flex-col gap-5 p-4"
              style={{ transform: `translateY(${offsetY}px)` }}
            >
              {visibleCustomers.map((customer) => {
                const hasPrimaryContact =
                  customer.contact_primary &&
                  typeof customer.contact_primary === "object" &&
                  Object.keys(customer.contact_primary).length !== 0;

                const primary = hasPrimaryContact
                  ? (customer.contact_primary as any)
                  : null;

                return (
                  <div
                    key={customer.pk_customer_id}
                    onClick={() =>
                      handleCustomerSelect(customer.pk_customer_id)
                    }
                    className={`rounded-xl border p-4 cursor-pointer transition
                      ${
                        customerID === customer.pk_customer_id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    style={{ minHeight: 80 }}
                  >
                    {/* row 1  – avatar + name + id */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-full border p-4
                          ${
                            customerID === customer.pk_customer_id
                              ? "border-blue-500 bg-blue-100"
                              : "border-gray-300"
                          }`}
                        style={{ width: 58, height: 58 }}
                      >
                        <User
                          color={
                            selectedCustomerId === customer.pk_customer_id
                              ? "#3b82f6"
                              : "black"
                          }
                        />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm font-semibold truncate ${
                            customerID === customer.pk_customer_id
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {customer.name}
                        </span>
                        <span className="text-xs text-gray-600 truncate">
                          ID: {customer.pk_customer_id}
                        </span>
                      </div>
                    </div>

                    {/* row 2  – contacts */}
                    {hasPrimaryContact && primary ? (
                      <div className="flex flex-col gap-1 border-b pb-4 pl-3 mt-3">
                        <Line
                          icon={<User size={15} />}
                          text={`${primary.first_name} ${primary.last_name}`}
                        />
                        <Line icon={<Mail size={15} />} text={primary.email} />
                        <Line
                          icon={<Phone size={15} />}
                          text={primary.phone_number}
                        />
                        <Line
                          icon={<TabletSmartphone size={15} />}
                          text={primary.mobile_number}
                        />
                      </div>
                    ) : (
                      <span className="block border-b pb-4 pl-3 mt-3 text-sm">
                        No Primary Contact
                      </span>
                    )}

                    {/* row 3  – notes */}
                    <span className="block pt-3 text-xs">
                      Notes:{" "}
                      {customer.notes?.length ? customer.notes : "No Notes"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* helper to keep the contact rows tidy */
function Line({ icon, text }: { icon: React.ReactNode; text?: string | null }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {icon}
      <span className="truncate">{text || ""}</span>
    </div>
  );
}
