// services/easypost/index.ts

export interface EasyPostAddress {
  name: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface EasyPostParcel {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface EasyPostShipmentRequest {
  to_address: EasyPostAddress;
  from_address: EasyPostAddress;
  parcel: EasyPostParcel;
}

export interface EasyPostRate {
  id: string;
  object: string;
  created_at: string;
  updated_at: string;
  mode: string;
  service: string;
  carrier: string;
  rate: string;
  currency: string;
  retail_rate: string | null;
  retail_currency: string | null;
  list_rate: string;
  list_currency: string;
  billing_type: string;
  delivery_days: number;
  delivery_date: string | null;
  delivery_date_guaranteed: boolean;
  est_delivery_days: number;
  shipment_id: string;
  carrier_account_id: string;
}

export interface EasyPostShipmentResponse {
  id: string;
  created_at: string;
  is_return: boolean;
  messages: any[];
  mode: string;
  options: {
    currency: string;
    payment: {
      type: string;
    };
    date_advance: number;
  };
  reference: string | null;
  status: string;
  tracking_code: string | null;
  updated_at: string;
  batch_id: string | null;
  batch_status: string | null;
  batch_message: string | null;
  customs_info: any | null;
  from_address: any;
  insurance: any | null;
  order_id: string | null;
  parcel: any;
  postage_label: any | null;
  rates: EasyPostRate[];
  refund_status: string | null;
  scan_form: any | null;
  selected_rate: any | null;
  tracker: any | null;
  to_address: any;
  usps_zone: number;
  return_address: any;
  buyer_address: any;
  forms: any[];
  fees: any[];
  object: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  carrier: string;
  service: string;
  price: number;
  estimatedDays: string;
  description: string;
  // EasyPost specific fields
  shipmentId: string;
  rateId: string;
}

export interface LabelData {
  trackingCode: string | null;
  labelUrl: string | null;
  shipmentStatus: string;
  easypostShipmentId: string;
  easypostShipmentRateId: string | null;
}

export class EasyPostService {
  async getShippingRates(
    toAddress: EasyPostAddress,
    fromAddress: EasyPostAddress,
    parcel: EasyPostParcel
  ): Promise<ShippingRate[]> {
    try {
      // Validate required fields
      if (
        !toAddress.street1 ||
        !toAddress.city ||
        !toAddress.state ||
        !toAddress.zip
      ) {
        throw new Error("Invalid destination address");
      }
      if (
        !fromAddress.street1 ||
        !fromAddress.city ||
        !fromAddress.state ||
        !fromAddress.zip
      ) {
        throw new Error("Invalid origin address");
      }
      if (!parcel.length || !parcel.width || !parcel.height || !parcel.weight) {
        throw new Error("Invalid parcel dimensions");
      }

      const requestBody = {
        toAddress,
        fromAddress,
        parcel,
      };

      const response = await fetch("/api/easypost/shipping-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("EasyPost API Error Response:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch shipping rates");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching shipping rates from EasyPost:", error);
      throw error;
    }
  }

  async buyLabel(shipmentId: string, rateId: string): Promise<LabelData> {
    try {
      const requestBody = {
        shipmentId,
        rateId,
      };

      const response = await fetch("/api/easypost/buy-label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("EasyPost Buy Label API Error Response:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to buy label");
      }

      return data.data;
    } catch (error) {
      console.error("Error buying label from EasyPost:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const easyPostService = new EasyPostService();
