"use client";

import * as React from "react";
import { User, Mail, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CustomerSelectDialog } from "@/components/dialogs/customer-select-dialog";
import { useCustomersWithContacts } from "@/hooks/useCustomers";

interface Props {
  selectedCustomerId: string | number;
  customerName?: string;
  onCustomerSelect: (customerId: string | number, customerName: string) => void;
  onCustomerDataUpdate?: (customerData: {
    billingAddress?: any;
    shippingAddress?: any;
    customerNotes?: string;
  }) => void;
}

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
}

export function CustomerSelectionSection({
                                           selectedCustomerId,
                                           customerName,
                                           onCustomerSelect,
                                           onCustomerDataUpdate,
                                         }: Props) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Fix: Use object parameter instead of separate arguments
  const { data: customersResponse } = useCustomersWithContacts({ page: 1, limit: 0 });
  // Fix: Remove explicit type annotation to avoid type conflicts
  const customers = customersResponse?.items || [];

  const handleSelectCustomer = (customer: Customer) => {
    const displayName = `${customer.contactPerson} - ${customer.name}`;
    onCustomerSelect(customer.id, displayName);

    const fullCustomer = customers.find(
        (c) => c.pk_customer_id.toString() === customer.id
    );

    if (!onCustomerDataUpdate) return;

    if (fullCustomer) {
      const makeAddr = (
          type: "BILLING" | "SHIPPING",
          contactType: "BILLING" | "SHIPPING"
      ) => {
        const addr = fullCustomer.addresses?.find(
            (a) => a.address_type === type
        );
        const contact = fullCustomer.contacts?.find(
            (c) => c.contact_type === contactType
        );
        return {
          name: contact
              ? `${contact.first_name} ${contact.last_name}`
              : fullCustomer.name,
          address1: addr?.address1 ?? "",
          address2: addr?.address2 ?? "",
          city: addr?.city ?? "",
          state: addr?.state ?? "",
          postalCode: addr?.zip ?? "",
          country: addr?.country ?? "",
        };
      };

      onCustomerDataUpdate({
        billingAddress: makeAddr("BILLING", "BILLING"),
        shippingAddress: makeAddr("SHIPPING", "SHIPPING"),
        customerNotes: fullCustomer.notes || "",
      });
    } else {
      onCustomerDataUpdate({
        billingAddress: {},
        shippingAddress: {},
        customerNotes: "",
      });
    }
  };

  // Create a wrapper function that matches the dialog's expected signature
  const handleDialogCustomerSelect = (customerId: number) => {
    // Find the customer from the customers list
    const fullCustomer = customers.find(
        (c) => c.pk_customer_id === customerId
    );

    if (fullCustomer) {
      // Convert to the Customer interface format expected by handleSelectCustomer
      const customer: Customer = {
        id: fullCustomer.pk_customer_id.toString(),
        name: fullCustomer.name,
        contactPerson: fullCustomer.contacts?.[0]
            ? `${fullCustomer.contacts[0].first_name} ${fullCustomer.contacts[0].last_name}`.trim()
            : fullCustomer.name,
        email: fullCustomer.email || fullCustomer.contacts?.[0]?.email || "",
      };

      handleSelectCustomer(customer);
    }
  };

  const selected = customers.find(
      (c) => c.pk_customer_id.toString() === selectedCustomerId.toString()
  );

  return (
      <>
        <Card className="bg-white border border-gray-200 text-gray-900 shadow-sm">
          {/* header: icon + label share the same baseline */}
          <CardHeader className="border-b border-gray-100 px-6 h-10">
            <div className="flex items-center gap-2 h-full">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">
              Customer Selection
            </span>
            </div>
          </CardHeader>

          {/* body */}
          <CardContent className="flex items-center justify-between px-6 h-11">
            <div>
              {selected ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 rounded-full p-2 mr-2">
                      <User className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selected.name ?? customerName?.split(" - ")[1] ?? ""}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        Contact: {customerName?.split(" - ")[0]}
                        <span className="mx-1">•</span>
                        {selected.email}
                      </p>
                    </div>
                  </div>
              ) : (
                  <p className="text-sm text-gray-500">No customer selected</p>
              )}
            </div>

            <button
                type="button"
                className="flex items-center h-10 gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Change Customer
            </button>
          </CardContent>
        </Card>

        <CustomerSelectDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSelectCustomer={handleDialogCustomerSelect}
        />
      </>
  );
}
