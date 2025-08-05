"use client";

import React from "react";

export interface Contact {
  first_name: string;
  last_name: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
  contact_type?: string; // "PRIMARY" or "SECONDARY"
}

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  return (
    <table className="min-w-full table-auto text-sm text-left">
      <thead>
        <tr>
          <th className="px-4 py-2 text-muted-foreground">Name</th>
          <th className="px-4 py-2 text-muted-foreground">Role</th>
          <th className="px-4 py-2 text-muted-foreground">Email</th>
          <th className="px-4 py-2 text-muted-foreground">Phone</th>
          <th className="px-4 py-2 text-muted-foreground">Status</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c, idx) => (
          <tr
            key={idx}
            className={`text-muted-foreground hover:bg-gray-50${
              idx !== contacts.length - 1 ? " border-b" : ""
            }`}
          >
            <td className="px-4 py-3 font-medium">
              {c.first_name} {c.last_name}
            </td>
            <td className="px-4 py-3">{c.position_title || "—"}</td>
            <td className="px-4 py-3">{c.email || "—"}</td>
            <td className="px-4 py-3">{c.phone_number || "—"}</td>
            <td className="px-4 py-3">
              {c.contact_type === "PRIMARY" && (
                <span className="bg-blue-900 text-blue-100 rounded-full px-3 py-1 text-xs font-semibold">
                  Primary
                </span>
              )}
              {c.contact_type === "BILLING" && (
                <span className="bg-green-900 text-green-100 rounded-full px-3 py-1 text-xs font-semibold">
                  Billing
                </span>
              )}
              {c.contact_type === "SHIPPING" && (
                <span className="bg-violet-900 text-violet-100 rounded-full px-3 py-1 text-xs font-semibold">
                  Shipping
                </span>
              )}
              {c.contact_type === "OTHER" && (
                <span className="bg-gray-700 text-gray-100 rounded-full px-3 py-1 text-xs font-semibold">
                  Other
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
