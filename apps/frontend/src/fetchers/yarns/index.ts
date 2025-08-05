import { Yarn, YarnsResponse } from "@/types/yarns";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/** Direct backend fetching using getAll endpoint */
export async function getYarns(
  page: number = 1,
  limit: number = 10
): Promise<YarnsResponse | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/yarns?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch yarns: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching yarns:", error);
    return null;
  }
}

/** Direct backend fetching for single yarn */
export async function getYarn(id: number): Promise<Yarn | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/yarns/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch yarn: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching yarn:", error);
    return null;
  }
}
