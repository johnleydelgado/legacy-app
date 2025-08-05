import { Trim, TrimsResponse } from "@/types/trims";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/** Direct backend fetching using getAll endpoint */
export async function getTrims(
  page: number = 1,
  limit: number = 10
): Promise<TrimsResponse | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/trims?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch trims: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching trims:", error);
    return null;
  }
}

/** Direct backend fetching for single trim */
export async function getTrim(id: number): Promise<Trim | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/trims/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trim: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching trim:", error);
    return null;
  }
}
