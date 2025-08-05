import { CustomerWithContacts } from "@/types/customer";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

export async function GET(req: NextRequest) {
  // Use the optimized endpoint that uses database joins instead of N+1 queries
  const upstream = `${BACKEND}/api/v1/customers/all-with-contacts-optimized`;

  try {
    const res = await fetch(upstream, {
      next: {
        tags: ["customers"],
        revalidate: 30,
      },
    });

    if (!res.ok) {
      console.error(`Backend responded with ${res.status}: ${res.statusText}`);
      return NextResponse.json(
        { message: "Failed to load all customers" },
        { status: res.status }
      );
    }

    const data: CustomerWithContacts[] = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Internal server error while fetching customers" },
      { status: 500 }
    );
  }
}
