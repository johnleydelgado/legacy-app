import { CreateQuotePayload, QuotesResponse } from "@/types/quote";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const limit = req.nextUrl.searchParams.get("limit") ?? "10";

  const upstream = `${BACKEND}/api/v1/quotes?page=${page}&limit=${limit}`;

  const res = await fetch(upstream, {
    next: {
      tags: ["quotes"],
      revalidate: 300,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to load quotes" },
      { status: res.status }
    );
  }

  const data: QuotesResponse = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  let body: CreateQuotePayload;
  try {
    body = (await req.json()) as CreateQuotePayload;
  } catch (err) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const upstreamUrl = `${BACKEND}/api/v1/quotes`;

  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { message: "Failed to create quote", detail: errorText },
      { status: res.status }
    );
  }

  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?tag=quotes`);

  const createdQuote = await res.json();
  return NextResponse.json(createdQuote, { status: 201 });
}
