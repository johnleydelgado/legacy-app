import { NextRequest, NextResponse } from "next/server";

const EASYPOST_API_KEY =
  process.env.EASYPOST_API_KEY ||
  "RVpUS2E0ODYyYjlmZDM1YjQ3YTFiODk4M2Y1ODNlNDEzMjI1djJPNHJhSkZBWExRQzdqQXNmWmo5UTo=";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentId, rateId } = body;

    // Validate required fields
    if (!shipmentId || !rateId) {
      return NextResponse.json(
        { error: "Missing required fields: shipmentId, rateId" },
        { status: 400 }
      );
    }

    const requestBody = {
      rate: {
        id: rateId,
      },
    };

    const response = await fetch(
      `https://api.easypost.com/v2/shipments/${shipmentId}/buy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${EASYPOST_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EasyPost Buy Label API Error Response:", errorText);
      return NextResponse.json(
        {
          error: `EasyPost API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract relevant information from the response
    const labelData = {
      trackingCode: data.tracker?.public_url || data.tracking_code,
      labelUrl: data.postage_label?.label_url,
      shipmentStatus: data.status,
      easypostShipmentId: data.id,
      easypostShipmentRateId: data.selected_rate?.id,
    };

    return NextResponse.json({ success: true, data: labelData });
  } catch (error) {
    console.error("Error in EasyPost Buy Label API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
