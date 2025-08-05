import { useMemo } from "react";
import type { Address, Contact, Customer } from "@/services/customers/types";
import type { QuoteItem } from "@/services/quote-items/types";
import { BASE_ACKNOWLEDGEMENTS } from "@/constants/acknowledgements";

interface UseQuoteComputedDataProps {
  customer?: Customer;
  quoteItemsData?: { items: QuoteItem[] };
}

export const useQuoteComputedData = ({
  customer,
  quoteItemsData,
}: UseQuoteComputedDataProps) => {
  // Extract primary contact with memoization
  const primaryContact = useMemo((): Contact | undefined => {
    if (!customer?.contacts) return undefined;
    if (Array.isArray(customer.contacts)) {
      return (
        customer.contacts.find((c) => c.contact_type === "PRIMARY") ||
        customer.contacts[0]
      );
    }
    return undefined;
  }, [customer?.contacts]);

  // Helper to get address by type with memoization
  const getAddressByType = useMemo(
    () =>
      (type: string): Address | undefined => {
        if (!customer?.addresses) return undefined;
        if (Array.isArray(customer.addresses)) {
          return (
            customer.addresses.find((a) => a.address_type === type) ||
            customer.addresses[0]
          );
        }
        return undefined;
      },
    [customer?.addresses]
  );

  // Memoized addresses
  const billingAddress = useMemo(
    () => getAddressByType("BILLING"),
    [getAddressByType]
  );

  const shippingAddress = useMemo(
    () => getAddressByType("SHIPPING"),
    [getAddressByType]
  );

  // Cost calculations with memoization
  const costCalculations = useMemo(() => {
    const itemsTotal = (quoteItemsData?.items || []).reduce(
      (acc: number, item) => {
        const price = Number(item.unit_price || 0);
        const qty = Number(item.quantity || 0);
        return acc + price * qty;
      },
      0
    );

    const taxRate = 0; // %
    const taxDue = itemsTotal * (taxRate / 100);
    const total = itemsTotal + taxDue;
    const deposit = total * 0.5;

    return {
      itemsTotal,
      taxRate,
      taxDue,
      total,
      deposit,
    };
  }, [quoteItemsData?.items]);

  // Artwork proofs with memoization
  const artworkProofs = useMemo(() => {
    return (quoteItemsData?.items || [])
      .filter(
        (item): item is QuoteItem & { artwork_url: string } =>
          !!item.artwork_url
      )
      .map((item) => ({
        id: item.pk_quote_item_id.toString(),
        src: typeof item.artwork_url === "string" ? item.artwork_url : "",
        alt: item.item_name || item.item_description || "Artwork",
      }));
  }, [quoteItemsData?.items]);

  // Acknowledgements with memoization (depends on shipping state)
  const acknowledgements = useMemo(() => {
    const shipToState = shippingAddress?.state || "NC";
    const list = [...BASE_ACKNOWLEDGEMENTS];

    if (shipToState === "NC") {
      list.push(
        "All custom orders shipping within North Carolina will be charged NC sales tax unless a North Carolina resale certificate is provided when the order is approved."
      );
    }

    return list;
  }, [shippingAddress?.state]);

  // Email and name data with memoization
  const emailAndName = useMemo(() => {
    if (!customer) return { email: "", name: "" };

    return {
      email: primaryContact?.email || "",
      name: primaryContact
        ? `${primaryContact.first_name} ${primaryContact.last_name}`.trim()
        : customer.name || "",
    };
  }, [customer, primaryContact]);

  return {
    // Contact and customer data
    primaryContact,
    billingAddress,
    shippingAddress,
    emailAndName,

    // Cost calculations
    ...costCalculations,

    // Derived data
    artworkProofs,
    acknowledgements,

    // Utilities
    getAddressByType,
  };
};
