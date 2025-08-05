import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Use default fonts - no custom font registration needed

// Professional packing slip styles following industry standards
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  // Header section with company branding
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
    paddingBottom: 16,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.3,
    marginBottom: 1,
  },
  orderInfo: {
    fontSize: 11,
    color: "#1f2937",
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
  },

  // Address sections
  addressSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  addressBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    backgroundColor: "#f9fafb",
    minHeight: 120,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 3,
  },
  addressText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.4,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  addressName: {
    fontWeight: "bold",
    marginBottom: 3,
  },

  // Order details section
  orderSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  orderDetailsBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#1e40af",
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  orderDetailLabel: {
    fontSize: 9,
    color: "#6b7280",
    fontWeight: "bold",
  },
  orderDetailValue: {
    fontSize: 9,
    color: "#1f2937",
  },
  notesBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    minHeight: 60,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.3,
  },

  // Items table - professional warehouse style
  itemsSection: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    paddingHorizontal: 3,
    textTransform: "uppercase",
  },
  tableHeaderCellWide: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 2,
    paddingHorizontal: 3,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    minHeight: 70,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
    paddingHorizontal: 3,
    color: "#374151",
    textAlign: "center",
  },
  tableCellWide: {
    fontSize: 8,
    flex: 2,
    paddingHorizontal: 3,
    color: "#374151",
    textAlign: "center",
  },
  tableCellBold: {
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  quantityCell: {
    backgroundColor: "#eff6ff",
    textAlign: "center",
    fontWeight: "bold",
    color: "#1e40af",
    paddingVertical: 8,
  },

  // Footer section
  footer: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#1e40af",
    paddingTop: 12,
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryLeft: {
    flex: 2,
  },
  summaryRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  totalBox: {
    backgroundColor: "#1e40af",
    padding: 8,
    minWidth: 120,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 10,
    color: "#ffffff",
    marginBottom: 2,
  },
  totalQuantity: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footerMessage: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  packingDate: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },

  // Product image
  productImage: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
});

interface PackingSlipPDFProps {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;

  // Order Information
  invoiceNumber: string;
  poNumber: string;
  createdAt: string;
  customerDueDate: string;
  productDescription: string;

  // Customer Billing Information
  customerBilling: {
    company: string;
    name: string;
    address: string;
    email: string;
  };

  // Package Shipping Information
  selectedPackage: {
    name: string;
    company_name?: string;
    phone_number?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // Items (simplified structure matching shipping items table)
  items: Array<{
    categoryName: string;
    itemNumber: string;
    item_name: string;
    item_description: string;
    yarnName: string;
    packagingName: string;
    trimsName: string;
    quantity: number;
    image?: string; // Keep for backward compatibility
    images?: Array<{ preview: string }>; // Support multiple images
  }>;

  // Total
  totalQuantity: number;

  // Optional notes
  notes?: string;
}

const PackingSlipPDF: React.FC<PackingSlipPDFProps> = ({
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  companyWebsite,
  invoiceNumber,
  poNumber,
  createdAt,
  customerDueDate,
  productDescription,
  customerBilling,
  selectedPackage,
  items,
  totalQuantity,
  notes,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Professional Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.companyDetails}>{companyAddress}</Text>
            <Text style={styles.companyDetails}>Phone: {companyPhone}</Text>
            <Text style={styles.companyDetails}>Email: {companyEmail}</Text>
            <Text style={styles.companyDetails}>Web: {companyWebsite}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Packing Slip</Text>
            <Text style={styles.orderNumber}>#{invoiceNumber}</Text>
            <Text style={styles.orderInfo}>Date: {createdAt}</Text>
            <Text style={styles.orderInfo}>PO: {poNumber}</Text>
          </View>
        </View>

        {/* Addresses Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Bill To</Text>
            <Text style={[styles.addressText, styles.addressName]}>
              {customerBilling.company}
            </Text>
            <Text style={styles.addressText}>{customerBilling.name}</Text>
            <Text style={styles.addressText}>{customerBilling.address}</Text>
            <Text style={styles.addressText}>{customerBilling.email}</Text>
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Ship To</Text>
            <Text style={[styles.addressText, styles.addressName]}>
              {selectedPackage.name}
            </Text>
            {selectedPackage.company_name && (
              <Text style={styles.addressText}>{selectedPackage.company_name}</Text>
            )}
            <Text style={styles.addressText}>{selectedPackage.address}</Text>
            <Text style={styles.addressText}>
              {selectedPackage.city}, {selectedPackage.state} {selectedPackage.zip}
            </Text>
            <Text style={styles.addressText}>{selectedPackage.country}</Text>
            {selectedPackage.phone_number && (
              <Text style={styles.addressText}>Phone: {selectedPackage.phone_number}</Text>
            )}
          </View>
        </View>

        {/* Order Details and Notes */}
        <View style={styles.orderSection}>
          <View style={styles.orderDetailsBox}>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Order Date:</Text>
              <Text style={styles.orderDetailValue}>{createdAt}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Due Date:</Text>
              <Text style={styles.orderDetailValue}>{customerDueDate}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Products:</Text>
              <Text style={styles.orderDetailValue}>
                {items.map(item => item.item_name).join(", ")}
              </Text>
            </View>
          </View>
          
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Special Instructions</Text>
            <Text style={styles.notesText}>
              {notes || "Handle with care. Check contents upon delivery."}
            </Text>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items to Ship</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Item #</Text>
            <Text style={styles.tableHeaderCellWide}>Description</Text>
            <Text style={styles.tableHeaderCell}>Category</Text>
            <Text style={styles.tableHeaderCell}>Yarns</Text>
            <Text style={styles.tableHeaderCell}>Package</Text>
            <Text style={styles.tableHeaderCell}>Trims</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellCenter]}>Qty</Text>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={index}>
              {/* Main item row */}
              <View 
                style={[
                  styles.tableRow,
                  ...(index % 2 === 1 ? [styles.tableRowAlt] : [])
                ]}
              >
                <Text style={[styles.tableCell, styles.tableCellBold]}>
                  {item.itemNumber}
                </Text>
                <View style={[styles.tableCellWide, { flexDirection: "column", alignItems: "center", justifyContent: "center", paddingVertical: 8 }]}>
                  <Text style={[{ fontWeight: "bold", fontSize: 10, textAlign: "center", marginBottom: 3, lineHeight: 1.3, color: "#1f2937" }]}>
                    {item.item_name}
                  </Text>
                  {item.item_description && (
                    <Text style={[{ fontSize: 8, color: '#6b7280', lineHeight: 1.3, textAlign: "center", fontStyle: "italic" }]}>
                      {item.item_description}
                    </Text>
                  )}
                </View>
                <Text style={styles.tableCell}>{item.categoryName}</Text>
                <Text style={styles.tableCell}>{item.yarnName}</Text>
                <Text style={styles.tableCell}>{item.packagingName}</Text>
                <Text style={styles.tableCell}>{item.trimsName}</Text>
                <Text style={[styles.tableCell, styles.quantityCell]}>
                  {item.quantity}
                </Text>
              </View>
              
              {/* Images row underneath each item */}
              {((item.images && item.images.length > 0) || item.image) && (
                <View style={[
                  {
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    backgroundColor: "#f8fafc",
                    borderBottomWidth: 1,
                    borderBottomColor: "#e5e7eb",
                    flexWrap: "wrap",
                    gap: 4
                  },
                  ...(index % 2 === 1 ? [{ backgroundColor: "#f1f5f9" }] : [])
                ]}>
                  {item.images && item.images.length > 0 ? (
                    // Show all images from images array
                    item.images.slice(0, 5).map((img, imgIndex) => (
                      img.preview ? (
                        <Image 
                          key={imgIndex}
                          src={img.preview} 
                          style={[styles.productImage, { width: 30, height: 30, margin: 2 }]} 
                        />
                      ) : null
                    ))
                  ) : item.image ? (
                    // Fallback to single image for backward compatibility
                    <Image src={item.image} style={[styles.productImage, { width: 30, height: 30 }]} />
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Professional Footer */}
        <View style={styles.footer}>
          <View style={styles.summarySection}>
            <View style={styles.summaryLeft}>
              <Text style={styles.footerMessage}>
                Please verify all items are included and in good condition.
              </Text>
              <Text style={styles.footerMessage}>
                Report any discrepancies within 24 hours of delivery.
              </Text>
              <Text style={styles.packingDate}>
                Packed on: {new Date().toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.summaryRight}>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>TOTAL ITEMS</Text>
                <Text style={styles.totalQuantity}>{totalQuantity}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PackingSlipPDF;
