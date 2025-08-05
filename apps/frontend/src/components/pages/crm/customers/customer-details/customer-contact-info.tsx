// components/CustomerContactInfo.tsx
"use client";

import React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Globe, MapPin, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  notes?: string;
  positionTitle?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface CustomerContactInfoProps {
  customer: Customer;
  isLoading?: boolean;
}

/**
 * Renders the "Contact Information" + "Customer Notes" cards (left column),
 * with an Edit button on the right side of the Contact Information header.
 */
export function CustomerContactInfo({
  customer,
  isLoading = false,
}: CustomerContactInfoProps) {
  console.log(isLoading);

  // Show skeletons while loading
  if (isLoading) {
    return (
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedAddress = React.useMemo(() => {
    const parts: string[] = [];

    // Street address (address1)
    if (customer.address) {
      parts.push(customer.address);
    }

    // City, State ZIP
    let cityStateZip = "";
    if (customer.city) {
      cityStateZip += customer.city;
    }

    if (customer.state) {
      if (cityStateZip) cityStateZip += ", ";
      cityStateZip += customer.state;
    }

    if (customer.zip) {
      // Add space instead of comma before ZIP in US format
      if (customer.state) {
        cityStateZip += ` ${customer.zip}`;
      } else {
        if (cityStateZip) cityStateZip += " ";
        cityStateZip += customer.zip;
      }
    }

    if (cityStateZip) {
      parts.push(cityStateZip);
    }

    // Country (optional, often omitted in domestic context)
    if (customer.country) {
      parts.push(customer.country);
    }

    return parts.join(", ");
  }, [
    customer.address,
    customer.city,
    customer.state,
    customer.zip,
    customer.country,
  ]);

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* ─── Contact Information Card ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Information</CardTitle>
            {/* Edit Button on the right of the header */}
            <Link
              href={`/crm/customers/${customer.id}/edit`}
              className="no-underline"
            >
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Name and Position */}
          <div className="flex flex-col gap-0.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{customer.name}</span>
            </div>
            {customer.positionTitle && (
              <span className="text-xs text-slate-400 ml-7">
                {customer.positionTitle}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${customer.email}`} className="hover:underline">
              {customer.email}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{customer.phone}</span>
          </div>

          {/* Website */}
          {customer.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a
                href={
                  customer.website.startsWith("http")
                    ? customer.website
                    : `https://${customer.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {customer.website}
              </a>
            </div>
          )}

          {/* Address (street, city, state, zip, country) */}
          {formattedAddress && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>{formattedAddress}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Customer Notes Card ──────────────────────────────────────────────────── */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{customer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
