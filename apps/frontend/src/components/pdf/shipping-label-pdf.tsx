import React from "react";
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

/* ────────────────────────────── TAILWIND HELPER ─────────────────────────── */
const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // Modern blue
        primaryLight: "#eff6ff",
        secondary: "#f1f5f9", // Light slate
        accent: "#0ea5e9", // Sky blue
        surface: "#ffffff",
        onSurface: "#1f2937", // Dark gray
        onSurfaceVariant: "#6b7280", // Medium gray
        outline: "#e5e7eb", // Light border
        success: "#10b981", // Emerald
      },
      fontFamily: { sans: ["Helvetica"] },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
});

/* ──────────────────────────────── TYPES ──────────────────────────────────── */
export interface ShippingLabelProps {
  /* Company info */
  fromCompany: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  showLogo?: boolean;

  /* Order details */
  poNumber: string;
  productDescription: string;

  /* Customer info */
  customerName: string;
  customerCompany: string;

  /* Dates */
  productionDueDate: string;
  customerDueDate: string;
}

/* ────────────────────────────── COMPONENT ───────────────────────────────── */
export const ShippingLabelPdf: React.FC<ShippingLabelProps> = (p) => (
  <Document>
    {/* Modern 4x6 shipping label - 288 × 432 pt */}
    <Page size={[288, 432]} style={tw("bg-surface")}>
      <View style={tw("flex flex-col h-full")}>
        {/* ───── MODERN HEADER WITH WHITE BACKGROUND FOR LOGO ───── */}
        <View style={tw("bg-white border-b-2 border-primary px-6 py-4")}>
          <View style={tw("flex-row items-center justify-between")}>
            {p.showLogo && (
              <View style={tw("w-16 h-10 mr-4 bg-white rounded-lg p-1")}>
                <Image
                  src="https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/LegacyLogo.png"
                  style={{ width: 56, height: 32, objectFit: "contain" }}
                />
              </View>
            )}
            <View style={tw("flex-1")}>
              <Text style={tw("text-lg font-bold text-primary mb-1")}>
                {p.fromCompany}
              </Text>
              <Text style={tw("text-xs text-onSurfaceVariant font-semibold")}>
                BOX LABEL
              </Text>
            </View>
          </View>
        </View>

        {/* ───── COMPANY DETAILS SECTION ───── */}
        <View style={tw("bg-primaryLight px-6 py-3 border-b border-outline")}>
          <Text style={tw("text-xs font-medium text-onSurfaceVariant mb-1")}>
            FROM
          </Text>
          <Text style={tw("text-sm text-onSurface leading-normal mb-1")}>
            {p.fromAddress}
          </Text>
          <Text style={tw("text-xs text-onSurfaceVariant")}>
            {p.fromEmail} • {p.fromPhone}
          </Text>
        </View>

        {/* ───── ORDER INFORMATION CARD ───── */}
        <View style={tw("px-6 py-4 bg-surface")}>
          <View style={tw("bg-secondary rounded-xl p-4 mb-4")}>
            <Text style={tw("text-xs font-semibold text-onSurfaceVariant mb-2 text-center")}>
              ORDER #
            </Text>
            <Text style={tw("text-3xl font-bold text-primary text-center mb-3")}>
              #{p.poNumber}
            </Text>
            <View style={tw("bg-white rounded-lg p-3")}>
              <Text style={tw("text-sm font-medium text-onSurface text-center leading-normal")}>
                {p.productDescription}
              </Text>
            </View>
          </View>
        </View>

        {/* ───── CUSTOMER SECTION WITH MODERN CARD ───── */}
        <View style={tw("px-6 py-2 bg-surface flex-1")}>
          <View style={tw("bg-white rounded-xl p-4 border border-outline shadow-sm")}>
            <Text style={tw("text-xs font-semibold text-onSurfaceVariant mb-3")}>
              SHIP TO
            </Text>
            <Text style={tw("text-2xl font-bold text-onSurface leading-tight mb-2")}>
              {p.customerName}
            </Text>
            <Text style={tw("text-base text-onSurfaceVariant leading-normal")}>
              {p.customerCompany}
            </Text>
          </View>
        </View>

        {/* ───── TIMELINE FOOTER ───── */}
        <View style={tw("px-6 py-4 bg-secondary")}>
          <View style={tw("flex-row justify-between items-center mb-2")}>
            <Text style={tw("text-xs font-semibold text-onSurfaceVariant")}>
              PRODUCTION DUE
            </Text>
            <Text style={tw("text-sm font-bold text-accent")}>
              {p.productionDueDate}
            </Text>
          </View>
          <View style={tw("flex-row justify-between items-center")}>
            <Text style={tw("text-xs font-semibold text-onSurfaceVariant")}>
              CUSTOMER DUE
            </Text>
            <Text style={tw("text-sm font-bold text-success")}>
              {p.customerDueDate}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default ShippingLabelPdf;
