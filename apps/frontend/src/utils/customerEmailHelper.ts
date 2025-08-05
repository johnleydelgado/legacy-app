import type { Contact } from "@/services/customers/types";

interface CustomerWithContacts {
  email?: string;
  name?: string;
  contacts?: Contact[];
}

export interface EmailAndName {
  email: string;
  name: string;
}

/**
 * Helper function to get the correct email and name for customer notifications.
 * Prioritizes primary contact details over customer details.
 *
 * @param customer - Customer object with optional contacts array
 * @returns Object with email and name for notifications
 *
 * @example
 * const emailInfo = getCustomerEmailAndName(customer);
 * await sendEmail({
 *   to: emailInfo.email,
 *   name: emailInfo.name,
 *   // ... other email props
 * });
 */
export const getCustomerEmailAndName = (
  customer: CustomerWithContacts | null | undefined
): EmailAndName => {
  if (!customer) {
    return {
      email: "",
      name: "Customer",
    };
  }

  // Find primary contact if available
  const primaryContact = customer.contacts?.find(
    (contact) => contact.contact_type === "PRIMARY" && contact.email
  );

  if (primaryContact && primaryContact.email) {
    return {
      email: primaryContact.email,
      name:
        `${primaryContact.first_name || ""} ${
          primaryContact.last_name || ""
        }`.trim() || "Customer",
    };
  }

  // Fallback to customer details
  return {
    email: customer.email || "",
    name: customer.name || "Customer",
  };
};
