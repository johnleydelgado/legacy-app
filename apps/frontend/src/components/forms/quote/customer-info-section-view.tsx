"use client";

import * as React from "react";
import { User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomerWithContacts } from "@/types/customer";

interface Props {
  customer?: CustomerWithContacts | null;
  billing?: {
    company?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
  shipping?: {
    company?: string;
    contact?: string;
  };
  notes?: string;
  onEdit?: () => void;
  onChangeCustomer?: () => void;
}

export function CustomerInfoSectionView({
  customer,
  billing,
  shipping,
  notes,
  onEdit,
  onChangeCustomer,
}: Props) {
  // Find primary contact
  const primaryContact =
    customer?.contacts?.find((contact) => contact.contact_type === "PRIMARY") ||
    customer?.contacts?.[0];

  // Find billing and shipping addresses
  const billingAddress = customer?.addresses?.find(
    (addr) => addr.address_type === "BILLING"
  );
  const shippingAddress = customer?.addresses?.find(
    (addr) => addr.address_type === "SHIPPING"
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <Button
            onClick={onChangeCustomer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Change Customer
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">
              {customer?.name} -{" "}
              {primaryContact
                ? `${primaryContact.first_name} ${primaryContact.last_name}`
                : "No Contact"}
            </p>
            <p className="text-sm text-muted-foreground">
              Contact: {primaryContact?.first_name} {primaryContact?.last_name}{" "}
              • {primaryContact?.email || customer?.email || "No email"}
            </p>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Billing Information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Billing Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Company:</p>
                <p className="text-muted-foreground">
                  {billing?.company || customer?.name || "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-medium">Contact:</p>
                <p className="text-muted-foreground">
                  {billing?.contact ||
                    (primaryContact
                      ? `${primaryContact.first_name} ${primaryContact.last_name}`
                      : "Not specified")}
                </p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p className="text-muted-foreground">
                  {billing?.email ||
                    primaryContact?.email ||
                    customer?.email ||
                    "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-medium">Phone:</p>
                <p className="text-muted-foreground">
                  {billing?.phone ||
                    primaryContact?.phone_number ||
                    customer?.phone_number ||
                    "Not specified"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-blue-600 hover:text-blue-700 p-0 h-auto"
              onClick={onEdit}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>

          {/* Shipping Information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Shipping Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Company:</p>
                <p className="text-muted-foreground">
                  {shipping?.company || customer?.name || "Same as billing"}
                </p>
              </div>
              <div>
                <p className="font-medium">Contact:</p>
                <p className="text-muted-foreground">
                  {shipping?.contact ||
                    (primaryContact
                      ? `${primaryContact.first_name} ${primaryContact.last_name}`
                      : "Same as billing")}
                </p>
              </div>
              {shippingAddress && (
                <div>
                  <p className="font-medium">Address:</p>
                  <p className="text-muted-foreground">
                    {shippingAddress.address1}
                    {shippingAddress.address2 &&
                      `, ${shippingAddress.address2}`}
                    <br />
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.zip}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-blue-600 hover:text-blue-700 p-0 h-auto"
              onClick={onEdit}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notes</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {notes || customer?.notes || (
                    <>
                      1 color front - my employees
                      <br />2 color back - Florida art -
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-blue-600 hover:text-blue-700 p-0 h-auto"
              onClick={onEdit}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit Notes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
