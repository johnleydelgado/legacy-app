import { Packaging, PackagingResponse } from "@/types/packaging";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/** Direct backend fetching using getAll endpoint */
export async function getPackaging(
  page: number = 1,
  limit: number = 10
): Promise<PackagingResponse | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/packaging?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch packaging: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching packaging:", error);
    return null;
  }
}

/** Direct backend fetching for single packaging item */
export async function getPackagingItem(id: number): Promise<Packaging | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/packaging/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch packaging: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching packaging:", error);
    return null;
  }
}
