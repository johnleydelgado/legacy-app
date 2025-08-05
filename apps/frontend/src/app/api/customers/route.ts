import { CustomersResponse, CreateCustomerPayload } from "@/types/customer";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const limit = req.nextUrl.searchParams.get("limit") ?? "10";

  const upstream = `${BACKEND}/api/v1/customers/with-contacts?page=${page}&limit=${limit}`;

  const res = await fetch(upstream, {
    // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    cache: "no-store",
    next: {
      tags: ["customers"],
      revalidate: 300,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to load customers" },
      { status: res.status }
    );
  }

  const data: CustomersResponse = await res.json();

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // Parse the incoming JSON from the client
  let body: CreateCustomerPayload;
  try {
    body = (await req.json()) as CreateCustomerPayload;
  } catch (err) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  // Forward to the NestJS backend:
  const upstreamUrl = `${BACKEND}/api/v1/customers`;

  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // If the backend returns an error status, forward it:
  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { message: "Failed to create customer", detail: errorText },
      { status: res.status }
    );
  }

  await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?tag=customers`
  );

  // Otherwise, read the newly‐created customer entity from backend and return it
  const createdCustomer = await res.json();
  return NextResponse.json(createdCustomer, { status: 201 });
}
