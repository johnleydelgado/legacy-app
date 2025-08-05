import { NextRequest, NextResponse } from "next/server";
import {
  getServiceDescription,
  getHumanReadableName,
} from "@/constants/carrier-service-levels";

const EASYPOST_API_KEY =
  process.env.EASYPOST_API_KEY ||
  "RVpUS2E0ODYyYjlmZDM1YjQ3YTFiODk4M2Y1ODNlNDEzMjI1djJPNHJhSkZBWExRQzdqQXNmWmo5UTo=";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toAddress, fromAddress, parcel } = body;

    // Validate required fields
    if (!toAddress || !fromAddress || !parcel) {
      return NextResponse.json(
        { error: "Missing required fields: toAddress, fromAddress, parcel" },
        { status: 400 }
      );
    }

    // Validate address fields
    if (
      !toAddress.street1 ||
      !toAddress.city ||
      !toAddress.state ||
      !toAddress.zip
    ) {
      return NextResponse.json(
        { error: "Invalid destination address" },
        { status: 400 }
      );
    }

    if (
      !fromAddress.street1 ||
      !fromAddress.city ||
      !fromAddress.state ||
      !fromAddress.zip
    ) {
      return NextResponse.json(
        { error: "Invalid origin address" },
        { status: 400 }
      );
    }

    if (!parcel.length || !parcel.width || !parcel.height || !parcel.weight) {
      return NextResponse.json(
        { error: "Invalid parcel dimensions" },
        { status: 400 }
      );
    }

    const requestBody = {
      shipment: {
        to_address: toAddress,
        from_address: fromAddress,
        parcel: parcel,
      },
    };

    const response = await fetch("https://api.easypost.com/v2/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${EASYPOST_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EasyPost API Error Response:", errorText);
      return NextResponse.json(
        {
          error: `EasyPost API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform EasyPost rates to our format
    const rates = data.rates.map((rate: any) => ({
      id: rate.id,
      name:
        getHumanReadableName(rate.carrier, rate.service) ||
        `${rate.carrier} ${rate.service}`,
      carrier: rate.carrier,
      service: rate.service,
      price: parseFloat(rate.rate),
      estimatedDays:
        rate.delivery_days === null || rate.delivery_days === undefined
          ? "Not Available"
          : rate.delivery_days === 1
          ? `${rate.delivery_days} business day`
          : `${rate.delivery_days} business days`,
      description: getServiceDescription(rate.carrier, rate.service),
      // EasyPost specific fields
      shipmentId: data.id, // The shipment ID from the response
      rateId: rate.id, // The rate ID from each rate
    }));

    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    console.error("Error in EasyPost API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
