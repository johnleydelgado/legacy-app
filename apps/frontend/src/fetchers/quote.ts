import { CreateQuotePayload, Quote, QuotesResponse } from "@/types/quote";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function createQuote(
  data: CreateQuotePayload
): Promise<Quote | string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return `Failed to create quote: ${response.status} ${errorText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating quote:", error);
    return "Network error occurred while creating quote";
  }
}

/** Server-side fetching via internal API route (like products/customers) */
export async function getQuotes(page = 1, limit = 10): Promise<QuotesResponse> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/api/quotes", base);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  try {
    const res = await fetch(url.toString(), {
      next: {
        tags: ["quotes"],
        revalidate: 300,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as QuotesResponse;
  } catch (error) {
    // During build time or when API is unavailable, return empty data
    console.warn("Failed to fetch quotes, returning empty data:", error);
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

/** Direct backend fetching (legacy) */
export async function getQuotesLegacy(page: number = 1, limit: number = 10) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/quotes?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quotes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return null;
  }
}

export async function getQuote(id: string): Promise<Quote | null> {
  if (id === undefined || id === null || id === "") return null;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${base}/api/quotes/${id}`;

  try {
    const res = await fetch(url, {
      next: {
        tags: ["quote"],
        revalidate: 300,
      },
    });
    if (!res.ok) return null;

    return (await res.json()) as Quote;
  } catch (error) {
    console.warn(`Failed to fetch quote ${id}, returning null:`, error);
    return null;
  }
}

export async function updateQuote(
  id: string,
  data: Partial<CreateQuotePayload>
): Promise<Quote | string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/quotes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return `Failed to update quote: ${response.status} ${errorText}`;
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating quote:", error);
    return "Network error occurred while updating quote";
  }
}

export async function deleteQuote(id: string): Promise<boolean | string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/quotes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return `Failed to delete quote: ${response.status} ${errorText}`;
    }

    return true;
  } catch (error) {
    console.error("Error deleting quote:", error);
    return "Network error occurred while deleting quote";
  }
}
