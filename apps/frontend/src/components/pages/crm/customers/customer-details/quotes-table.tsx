"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuoteTypes } from "@/services/quotes/types";
import {useDispatch} from "react-redux";
import {useAppDispatch} from "../../../../../hooks/redux";
import {setActiveCustomerID} from "../../../../../features/customers/customersSlice";

interface QuotesTableProps {
  quotes: QuoteTypes[];
  isLoading?: boolean;
  onAddQuoteClick: () => void;
}

/**
 * Renders a table of quotes for a customer. Each row shows Quote ID, Date, Amount, Status, + View link.
 */
export function QuotesTable(
    {
      quotes,
      isLoading,
      onAddQuoteClick,
}: QuotesTableProps) {

  return (
    <div className="space-y-4">
      {/* Header with Create Quote button */}
      <div className="flex justify-between items-center p-2">
        <h3 className="text-lg font-medium">Quotes</h3>
        <Button size="sm" className="gap-2 cursor-pointer" onClick={onAddQuoteClick}>
          <Plus className="h-4 w-4" />
          Create Quote
        </Button>
      </div>

      {/* Quotes Table */}
      {quotes &&
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 text-muted-foreground">Quote ID</th>
              <th className="px-4 py-2 text-muted-foreground">Date</th>
              <th className="px-4 py-2 text-muted-foreground">Amount</th>
              <th className="px-4 py-2 text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
          { quotes.map((quote) => {
              const totalAmount =
                parseFloat(`${quote.total_amount}`) || parseFloat(`${quote.subtotal}`) + parseFloat(`${quote.tax_total}`);

              return (
                  <tr
                    key={quote.pk_quote_id}
                    className="border-b text-muted-foreground hover:bg-gray-50"
                  >
                  {/* Quote Number */}
                  <td className="px-4 py-3 text-muted-foreground">
                  {quote.quote_number || `QUO-${quote.pk_quote_id}`}
                </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-muted-foreground">
                  {new Date(quote.quote_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                  {/* Amount */}
                  <td className="px-4 py-3 text-muted-foreground">
                  {quote.currency} {totalAmount.toFixed(2)}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white`}
                      style={{ backgroundColor: quote.status.color || 'gray' }}
                  >
                    {`${quote.status.process} - ${quote.status.status}`}
                  </span>
                </td>

                {/* View Link */}
                <td className="px-4 py-3">
                  <Link
                      href={`/crm/quotes/${quote.pk_quote_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
          );
        })}
          {isLoading &&
          <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading quotes...</div>
          </div>
          }
          {(!quotes || quotes.length === 0) &&
          <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">
                      No quotes found for this customer.
                  </div>
              </div>
          </div>
          }
        </tbody>
      </table>
      }
    </div>
  );
}
