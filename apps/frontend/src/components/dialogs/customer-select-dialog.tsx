"use client";

import * as React from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerWithContacts } from "@/types/customer";
import {
  useCustomersWithContacts,
  useCustomersWithContactsOptimized,
} from "@/hooks/useCustomers";

// Rename to avoid conflicts with imported types
interface SelectedCustomer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
}

interface CustomerSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSelectCustomer: (customer: SelectedCustomer) => void;
  onSelectCustomer: (id: number) => void;
}

export function CustomerSelectDialog({
  open,
  onOpenChange,
  onSelectCustomer,
}: CustomerSelectDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Use the hook with correct object parameter
  const {
    data: customersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomersWithContactsOptimized();

  const customers = customersResponse || [];

  // Filter customers based on search term
  const filteredCustomers = React.useMemo(() => {
    if (!Array.isArray(customers)) return [];
    if (!searchTerm.trim()) return customers;
    const search = searchTerm.toLowerCase();
    return customers.filter((customer) => {
      const primaryContact =
        customer.contacts?.find(
          (contact: { contact_type: string }) =>
            contact.contact_type === "PRIMARY"
        ) || customer.contacts?.[0];
      const contactPerson = primaryContact
        ? `${primaryContact.first_name} ${primaryContact.last_name}`.trim()
        : "";
      const email = primaryContact?.email || customer.email || "";
      return (
        customer.name.toLowerCase().includes(search) ||
        contactPerson.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search)
      );
    });
  }, [customers, searchTerm]);

  // Reset search when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  const handleSelectCustomer = (customer: any) => {
    // Find primary contact for display
    const primaryContact =
      customer.contacts?.find(
        (contact: { contact_type: string }) =>
          contact.contact_type === "PRIMARY"
      ) || customer.contacts?.[0];
    const contactPerson = primaryContact
      ? `${primaryContact.first_name} ${primaryContact.last_name}`.trim()
      : "No contact";
    // Convert to the expected SelectedCustomer format
    const customerForCallback: SelectedCustomer = {
      id: customer.pk_customer_id.toString(),
      name: customer.name,
      contactPerson,
      email: primaryContact?.email || customer.email || "",
    };
    onSelectCustomer(customer.pk_customer_id);
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Select Customer
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Select Customer
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground mb-2">
                Failed to load customers
              </p>
              <p className="text-sm text-red-600 mb-4">
                {error?.message || "An error occurred"}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Select Customer
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(80vh-180px)]">
          <div className="p-4 space-y-2">
            {filteredCustomers.length === 0 && !isLoading ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm.trim() ? (
                  "No customers found matching your search"
                ) : customers.length === 0 ? (
                  <div className="space-y-4">
                    <p>
                      No customers available. Try refreshing or check your
                      connection.
                    </p>
                    <Button
                      onClick={() => {
                        refetch();
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </Button>
                  </div>
                ) : (
                  "No results"
                )}
              </div>
            ) : (
              <>
                {filteredCustomers.map((customer) => {
                  const primaryContact =
                    customer.contacts?.find(
                      (contact: { contact_type: string }) =>
                        contact.contact_type === "PRIMARY"
                    ) || customer.contacts?.[0];
                  const contactPerson = primaryContact
                    ? `${primaryContact.first_name} ${primaryContact.last_name}`.trim()
                    : "No contact";
                  return (
                    <div
                      key={customer.pk_customer_id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors duration-150 group"
                    >
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 truncate">
                          {customer.name}
                        </h3>
                        <div className="mt-1 text-sm text-gray-600 group-hover:text-blue-700 flex items-center min-w-0">
                          <span className="font-medium truncate flex-shrink-0">
                            {contactPerson}
                          </span>
                          <span className="mx-2 flex-shrink-0">•</span>
                          <span className="truncate">
                            {primaryContact?.email ||
                              customer.email ||
                              "No email"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
