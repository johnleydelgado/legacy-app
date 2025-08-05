// src/app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import type {
  Customer,
  CreateCustomerPayload,
  CustomerWithContacts,
} from "@/types/customer";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

// Re-use one context type so you only write it once
type Ctx = { params: Promise<{ id: string }> };

/* ---------- GET --------------------------------------------------------- */
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params; // 👈 must await now

  if (Number.isNaN(+id)) {
    return NextResponse.json(
      { message: "Invalid customer id" },
      { status: 400 }
    );
  }

  const upstream = `${BACKEND}/api/v1/customers/${id}`;
  const res = await fetch(upstream, {
    next: {
      tags: ["customer"],
      revalidate: 300,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to load customer" },
      { status: res.status }
    );
  }

  const text = await res.text();
  if (!text) {
    return NextResponse.json(
      { message: "Empty response from server" },
      { status: 500 }
    );
  }

  try {
    const data: CustomerWithContacts = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to parse customer response:", error);
    return NextResponse.json(
      { message: "Invalid response from server" },
      { status: 500 }
    );
  }
}

/* ---------- PUT --------------------------------------------------------- */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  if (Number.isNaN(+id)) {
    return NextResponse.json(
      { message: "Invalid customer id" },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json()) as CreateCustomerPayload;
    const upstream = `${BACKEND}/api/v1/customers/${id}`;

    console.log("API Route - Update Request:", {
      url: upstream,
      body,
      id,
    });

    const res = await fetch(upstream, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    console.log("API Route - Backend Response:", {
      status: res.status,
      statusText: res.statusText,
      body: responseText,
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Failed to update customer",
          detail: responseText,
          status: res.status,
        },
        { status: res.status }
      );
    }

    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?tag=customer`
    );

    const updated = JSON.parse(responseText);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* ---------- DELETE ------------------------------------------------------ */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  if (Number.isNaN(+id)) {
    return NextResponse.json(
      { message: "Invalid customer id" },
      { status: 400 }
    );
  }

  const deleteUrl = `${BACKEND}/api/v1/customers/${id}`;
  const res = await fetch(deleteUrl, { method: "DELETE" });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to delete customer", detail: await res.text() },
      { status: res.status }
    );
  }

  // Revalidate the customers cache after successful deletion
  await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?tag=customers`
  );

  return new NextResponse(null, { status: 204 });
}
