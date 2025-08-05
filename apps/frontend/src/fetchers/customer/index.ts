import {
  Contact,
  ContactsResponse,
  CustomersResponse,
  CustomersWithContactsResponse,
  CustomerWithContacts,
  CreateCustomerPayload,
} from "@/types/customer";

function makeEmptyMeta(): CustomersResponse["meta"] {
  return {
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 1,
  };
}

function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// customers + contacts ───────────────────────────────────────────────────────
export async function getCustomers(
  page = 1,
  limit = 10
): Promise<CustomersWithContactsResponse> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const custUrl = new URL("/api/customers", base);
  custUrl.searchParams.set("page", String(page));
  custUrl.searchParams.set("limit", String(limit));

  try {
    const custRes = await fetch(custUrl.toString(), {
      cache: "no-store",
    });

    if (!custRes.ok) {
      const errorText = await custRes.text();
      console.error("Fetch response error:", errorText);
      throw new Error("Failed to fetch customers");
    }

    const data = await custRes.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch customers, returning empty data:", error);
    return {
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: limit,
        totalPages: 0,
        currentPage: page,
      },
    };
  }
}

/** Get all customers with contacts without pagination */
export async function getAllCustomersWithContacts(): Promise<
  CustomerWithContacts[]
> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const custUrl = new URL("/api/customers/all", base);

  try {
    const custRes = await fetch(custUrl.toString(), {
      next: {
        tags: ["customers"],
        revalidate: 300,
      },
    });
    if (!custRes.ok) throw new Error("Failed to fetch all customers");
    return custRes.json();
  } catch (error) {
    console.warn(
      "Failed to fetch all customers, returning empty array:",
      error
    );
    return [];
  }
}

/** single customer */
export async function getCustomer(
  id: number | string
): Promise<CustomerWithContacts | null> {
  if (id === undefined || id === null || id === "") return null;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${base}/api/customers/${id}`;

  try {
    const res = await fetch(url, {
      next: {
        tags: ["customer"],
        revalidate: 300,
      },
    });
    if (!res.ok) return null;

    return (await res.json()) as CustomerWithContacts;
  } catch (error) {
    console.warn(`Failed to fetch customer ${id}, returning null:`, error);
    return null;
  }
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<CustomerWithContacts | string | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/api/customers", base);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createCustomer failed:", res.status, errorText);
    return errorText;
  }

  // Type‐cast the JSON response into our `CustomerWithContacts` interface.
  const created = safeJson<CustomerWithContacts>(await res.text());
  return created;
}

export type EditCustomerPayload = Omit<CreateCustomerPayload, "organizationID">;

export async function editCustomer(
  id: number | string,
  payload: EditCustomerPayload
): Promise<CustomerWithContacts | string | null> {
  if (id === undefined || id === null || id === "") return null;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(`/api/customers/${id}`, base);

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`editCustomer (${id}) failed:`, res.status, errorText);
    return errorText;
  }

  const updated = safeJson<CustomerWithContacts>(await res.text());
  return updated;
}

/** delete a customer by ID */
export async function deleteCustomer(
  id: number | string
): Promise<true | string> {
  if (id === undefined || id === null || id === "") {
    return "Invalid customer ID";
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(`/api/customers/${id}`, base);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`deleteCustomer (${id}) failed:`, res.status, errorText);
    return errorText;
  }

  // return true on success
  return true;
}
