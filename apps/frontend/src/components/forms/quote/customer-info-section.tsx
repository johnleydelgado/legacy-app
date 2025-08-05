"use client";

import * as React from "react";
import { CreditCard, Truck, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/types/quote";

interface Props {
  billingAddress: QuoteForm["billingAddress"];
  shippingAddress: QuoteForm["shippingAddress"];
  customerNotes: string;
  customerId: string | number;
  onUpdateBilling: (address: QuoteForm["billingAddress"]) => void;
  onUpdateShipping: (address: QuoteForm["shippingAddress"]) => void;
  onUpdateNotes: (notes: string) => void;
}

export function CustomerInfoSection({
  billingAddress,
  shippingAddress,
  customerNotes,
  customerId,
  onUpdateBilling,
  onUpdateShipping,
  onUpdateNotes,
}: Props) {
  const hasCustomer = customerId && customerId !== "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Customer Billing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="h-4 w-4" />
            Customer Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCustomer ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Billing Address</p>
                {billingAddress.address1 ? (
                  <div className="text-sm text-muted-foreground">
                    <p>{billingAddress.name}</p>
                    <p>{billingAddress.address1}</p>
                    {billingAddress.address2 && (
                      <p>{billingAddress.address2}</p>
                    )}
                    <p>
                      {billingAddress.city}, {billingAddress.state}{" "}
                      {billingAddress.postalCode}
                    </p>
                    <p>{billingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No billing address set
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-auto flex items-center gap-2 text-muted-foreground"
              disabled
            >
              <Plus className="h-4 w-4" />
              Select a customer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Customer Shipping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="h-4 w-4" />
            Customer Shipping
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCustomer ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Shipping Address</p>
                {shippingAddress.address1 ? (
                  <div className="text-sm text-muted-foreground">
                    <p>{shippingAddress.name}</p>
                    <p>{shippingAddress.address1}</p>
                    {shippingAddress.address2 && (
                      <p>{shippingAddress.address2}</p>
                    )}
                    <p>
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postalCode}
                    </p>
                    <p>{shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No shipping address set
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-auto flex items-center gap-2 text-muted-foreground"
              disabled
            >
              <Plus className="h-4 w-4" />
              Select a customer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Customer Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4" />
            Customer Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCustomer ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Notes</p>
                {customerNotes ? (
                  <p className="text-sm text-muted-foreground">
                    {customerNotes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No notes added
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-auto flex items-center gap-2 text-muted-foreground"
              disabled
            >
              <Plus className="h-4 w-4" />
              Add notes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
