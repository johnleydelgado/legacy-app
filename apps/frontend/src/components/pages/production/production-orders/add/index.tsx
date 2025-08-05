"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { toast } from "sonner";
import { Customer as CustomerTypes } from "@/services/quotes/types";

import ProductionOrderHeaders from "../sections/headers";
import CustomerFactoryInfo, {
  FactoryTypes,
} from "../sections/customer-factory-info";
import { FactoryData } from "../sections/production-order-details-form";
import ProductionOrderDetailsForm, {
  ProductionOrderData,
} from "../sections/production-order-details-form";
import ProductionItemsTable, {
  ProductionItem,
} from "../sections/production-items-table";
import ProductionOrderSummary from "../sections/production-order-summary";
import PDFPreviewDialog from "../sections/pdf-preview-dialog";
import { useCustomer } from "../../../../../hooks/useCustomers2";
import { useFactory } from "../../../../../hooks/useFactories";
import {
  useCreateProductionOrder,
  useUpdateProductionOrder,
} from "../../../../../hooks/useProductionOrders";
import { useCreateProductionOrderItem } from "../../../../../hooks/useProductionOrderItems";
import { productionOrderItemService } from "../../../../../services/production-order-items.service";
import {
  CreateProductionOrderDto,
  ProductionOrderStatus,
  ProductionOrderShippingMethod,
} from "../../../../../services/production-orders/types";

const ProductionOrdersAdd = () => {
  const router = useRouter();
  const { fullname } = useSelector((state: RootState) => state.users);

  const [modifyFlag, setModifyFlag] = React.useState(false);
  const [productionStatus, setProductionStatus] = React.useState<number>(24);

  // Use the actual create production order hook
  const createProductionOrder = useCreateProductionOrder();
  const updateProductionOrder = useUpdateProductionOrder();
  const createProductionOrderItem = useCreateProductionOrderItem();

  const [customerData, setCustomerData] = React.useState<CustomerTypes | null>(
    null
  );
  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(-1);
  const [factoryData, setFactoryData] = React.useState<FactoryTypes | null>(
    null
  );
  const [currentFactoryID, setCurrentFactoryID] = React.useState<number>(-1);
  const [productionItems, setProductionItems] = React.useState<
    ProductionItem[]
  >([]);
  const [showPDFPreview, setShowPDFPreview] = React.useState(false);

  // Production Order Details Data - Simplified
  const [productionOrderData, setProductionOrderData] =
    React.useState<ProductionOrderData>({
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: new Date().toISOString().split("T")[0], // Default to today's date
      actualDeliveryDate: "",
      shippingMethod: "",
      notes: "",
    });

  // Fetch customer data when customer ID changes
  const {
    customer: fetchedCustomer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(currentCustomerID > 0 ? currentCustomerID : -1);

  // Fetch factory data when factory ID changes
  const {
    data: fetchedFactory,
    isLoading: factoryLoading,
    error: factoryError,
  } = useFactory(currentFactoryID > 0 ? currentFactoryID : null);

  // Map customer data
  const mapToCustomerTypes = (customer: any): CustomerTypes => {
    const defaultContact = {
      pk_contact_id: -1,
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      mobile_number: "",
      contact_type: "",
    };

    return {
      ...customer,
      owner_name: customer.owner_name || "",
      contact_primary:
        customer.primary_contact &&
        Object.keys(customer.primary_contact).length > 0
          ? customer.primary_contact
          : defaultContact,
      contacts: customer.contacts || [],
    } as CustomerTypes;
  };

  // Map factory data
  const mapToFactoryTypes = (factory: any): FactoryTypes => {
    console.log("Raw factory data:", factory); // Debug log to see actual data structure
    return {
      pk_factories_id: factory.pk_factories_id,
      name: factory.name || "",
      email: factory.email || "",
      website_url: factory.website_url || "",
      industry: factory.industry || "",
      notes: factory.notes || "",
      status: factory.status || "ACTIVE",
      user_owner: factory.user_owner || "",
      // Extract additional fields from nested objects
      service_category:
        factory.factories_service_category?.name ||
        factory.factories_service?.name ||
        factory.industry,
      location: factory.location_types?.name || "",
      factory_type: factory.factories_type?.name || "",
      // Extract contact information
      contact_person: factory.contact
        ? {
            name: factory.contact.contact_person || factory.contact.name || "",
            phone: factory.contact.phone || factory.contact.phone_number || "",
            email: factory.contact.email || factory.email || "",
          }
        : undefined,
      // Extract billing address if available
      billing_address:
        factory.contact?.address || factory.address
          ? {
              street1:
                factory.contact?.address?.street1 ||
                factory.address?.street1 ||
                "",
              city:
                factory.contact?.address?.city || factory.address?.city || "",
              state:
                factory.contact?.address?.state || factory.address?.state || "",
              zip: factory.contact?.address?.zip || factory.address?.zip || "",
              country:
                factory.contact?.address?.country ||
                factory.address?.country ||
                "",
            }
          : undefined,
    } as FactoryTypes;
  };

  // Update customer data when fetched customer changes
  React.useEffect(() => {
    if (fetchedCustomer) {
      setCustomerData(mapToCustomerTypes(fetchedCustomer));
    }
  }, [fetchedCustomer]);

  // Update factory data when fetched factory changes
  React.useEffect(() => {
    if (fetchedFactory) {
      setFactoryData(mapToFactoryTypes(fetchedFactory));
    } else if (currentFactoryID <= 0) {
      setFactoryData(null);
    }
  }, [fetchedFactory, currentFactoryID]);

  // Helper function to map status ID to enum
  const mapStatusToEnum = (statusId: number): ProductionOrderStatus => {
    switch (statusId) {
      case 25:
        return ProductionOrderStatus.PENDING;
      case 26:
        return ProductionOrderStatus.APPROVED;
      case 27:
        return ProductionOrderStatus.SHIPPED;
      case 28:
        return ProductionOrderStatus.DELIVERED;
      case 29:
        return ProductionOrderStatus.CANCELLED;
      default:
        return ProductionOrderStatus.PENDING;
    }
  };

  // Helper function to map shipping method to enum
  const mapShippingMethodToEnum = (
    method: string
  ): ProductionOrderShippingMethod => {
    switch (method.toUpperCase()) {
      case "OCEAN":
        return ProductionOrderShippingMethod.OCEAN;
      case "AIR":
        return ProductionOrderShippingMethod.AIR;
      case "GROUND":
        return ProductionOrderShippingMethod.GROUND;
      case "EXPRESS":
        return ProductionOrderShippingMethod.EXPRESS;
      default:
        return ProductionOrderShippingMethod.OCEAN;
    }
  };

  const handleCreateProductionOrder = React.useCallback(async () => {
    if (!customerData) {
      toast.error("Please select a customer for the production order");
      return;
    }

    if (!factoryData) {
      toast.error("Please select a factory for the production order");
      return;
    }

    if (productionItems.length === 0) {
      toast.error("Please add at least one item to the production order");
      return;
    }

    // Debug the order data to see what's being passed
    console.log("Production Order Data:", productionOrderData);

    if (
      !productionOrderData.orderDate ||
      productionOrderData.orderDate.trim() === ""
    ) {
      toast.error("Please fill in order date");
      return;
    }

    // Expected delivery date is required by backend
    if (
      !productionOrderData.expectedDeliveryDate ||
      productionOrderData.expectedDeliveryDate.trim() === ""
    ) {
      toast.error("Please fill in expected delivery date");
      return;
    }

    try {
      // Calculate totals from production items
      const totalQuantity = productionItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalAmount = productionItems.reduce(
        (sum, item) => sum + item.total + item.total * item.taxRate,
        0
      );

      // Generate PO number with factory service ID format: PO-[factory_service_id]-[production_order_id]
      // We'll generate a temporary PO number first, then update it after getting the production order ID
      const tempPoNumber = `PO-TEMP-${Date.now()}`;

      // Prepare production order data
      const createData: CreateProductionOrderDto = {
        fk_customer_id: customerData.pk_customer_id,
        fk_factory_id: factoryData.pk_factories_id,
        po_number: tempPoNumber,
        order_date: productionOrderData.orderDate,
        expected_delivery_date: productionOrderData.expectedDeliveryDate,
        actual_delivery_date:
          productionOrderData.actualDeliveryDate || undefined,
        shipping_method: mapShippingMethodToEnum(
          productionOrderData.shippingMethod || "OCEAN"
        ),
        status: mapStatusToEnum(productionStatus),
        total_quantity: totalQuantity,
        total_amount: totalAmount,
        notes: productionOrderData.notes || undefined,
        user_owner: fullname || undefined,
      };

      console.log("Creating production order with:", createData);

      // Create the production order using the hook
      const result = await createProductionOrder.mutateAsync(createData);

      console.log("Production order created:", result);

      // Update PO number with proper format: PO-[factory_id]-[production_order_id]
      const finalPoNumber = `PO-${factoryData.pk_factories_id}-${result.pk_production_order_id}`;

      console.log("Updating PO number to:", finalPoNumber);

      try {
        // Update the production order with the final PO number
        await updateProductionOrder.mutateAsync({
          id: result.pk_production_order_id,
          data: {
            po_number: finalPoNumber,
          },
        });

        console.log("PO number updated successfully to:", finalPoNumber);
      } catch (updateError) {
        console.error("Failed to update PO number:", updateError);
        // Don't throw here - the production order was created successfully
        // Just log the error and continue
      }

      // Create production order items with colors and packaging
      if (productionItems.length > 0 && result.pk_production_order_id) {
        console.log(
          "Creating production order items with colors and packaging..."
        );

        // Create items sequentially using React Query hooks
        for (const item of productionItems) {
          const completeItemData = {
            // Basic item data
            fk_production_order_id: result.pk_production_order_id,
            fk_product_id: item.productID,
            fk_category_id: item.categoryID,
            item_name: item.item_name,
            item_description: item.item_description,
            item_number: item.item_number,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.taxRate,
            // Related data
            knit_colors: item.knit_colors || [],
            body_colors: item.body_colors || [],
            packaging: (item.packaging || []).map((pkg) => ({
              fk_packaging_id: pkg.fk_packaging_id,
              quantity: 1, // Default quantity of 1 for each packaging item
            })),
          };

          console.log("Creating complete item:", completeItemData);
          try {
            const createdCompleteItem =
              await productionOrderItemService.createCompleteItem(
                completeItemData
              );
            console.log(
              "Complete item created successfully:",
              createdCompleteItem
            );
          } catch (error) {
            console.error(
              "Error creating complete production order item:",
              error
            );
            console.error("Item data that failed:", completeItemData);
            // Re-throw to be caught by outer try-catch
            throw error;
          }
        }

        console.log(
          "All production order items with colors and packaging created successfully"
        );
      }

      // Success
      setModifyFlag(false);
      toast.success("Production Order and all items created successfully");
      router.push("/production/production-orders");
    } catch (error) {
      console.error("Failed to create production order:", error);
      toast.error("Failed to create production order. Please try again.");
    }
  }, [
    customerData,
    factoryData,
    productionItems,
    productionOrderData,
    productionStatus,
    fullname,
    router,
    createProductionOrder,
    updateProductionOrder,
  ]);

  return (
    <div className="flex flex-col p-4" style={{ rowGap: "10px" }}>
      <ProductionOrderHeaders
        status={productionStatus}
        setStatus={setProductionStatus}
        add={true}
        modifyFlag={modifyFlag}
        setModifyFlag={setModifyFlag}
        handleUpdateClick={handleCreateProductionOrder}
        isSaving={
          createProductionOrder.isPending ||
          updateProductionOrder.isPending ||
          createProductionOrderItem.isPending
        }
        disableSave={
          !currentCustomerID ||
          currentCustomerID <= 0 ||
          !currentFactoryID ||
          currentFactoryID <= 0
        }
        onPreviewClick={() => setShowPDFPreview(true)}
        productionOrderId="new"
        customerName={customerData?.name || ""}
      />

      {/* Customer and Factory Information */}
      <CustomerFactoryInfo
        customerData={customerData}
        customerID={currentCustomerID}
        setCustomerID={setCurrentCustomerID}
        customerLoading={customerLoading}
        factoryData={factoryData}
        factoryID={currentFactoryID}
        setFactoryID={setCurrentFactoryID}
        factoryLoading={factoryLoading}
        setModifyFlag={setModifyFlag}
      />

      {/* Production Order Details Form */}
      <ProductionOrderDetailsForm
        productionOrderData={productionOrderData}
        setProductionOrderData={setProductionOrderData}
        factoryData={factoryData as FactoryData}
      />

      {/* Production Items Table */}
      <ProductionItemsTable
        productionItems={productionItems}
        setProductionItems={setProductionItems}
        setModifyFlag={setModifyFlag}
      />

      {/* Production Order Summary */}
      {productionItems.length > 0 && (
        <ProductionOrderSummary
          data={{
            totalItems: productionItems.length,
            totalQuantity: productionItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
            subtotal: productionItems.reduce(
              (sum, item) => sum + item.total,
              0
            ),
            taxAmount: productionItems.reduce(
              (sum, item) => sum + item.total * item.taxRate,
              0
            ),
            taxRate:
              productionItems.length > 0 ? productionItems[0].taxRate : 0.08,
            grandTotal: productionItems.reduce(
              (sum, item) => sum + item.total + item.total * item.taxRate,
              0
            ),
            estimatedCompletionDays: 14,
            status: "pending",
            priority: "medium",
          }}
        />
      )}

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        productionOrderId="new"
        customerData={customerData}
        factoryData={factoryData}
        productionItems={productionItems}
        productionOrderData={productionOrderData}
        poNumber="New PO"
        status="PENDING"
      />
    </div>
  );
};

export default ProductionOrdersAdd;
