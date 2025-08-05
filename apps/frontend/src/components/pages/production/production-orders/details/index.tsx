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
import ActivityHistory from "../sections/activity-history";
import PDFPreviewDialog from "../sections/pdf-preview-dialog";
import { useCustomer } from "../../../../../hooks/useCustomers2";
import { useFactory } from "../../../../../hooks/useFactories";
import {
  useUpdateProductionOrder,
  useProductionOrder,
} from "../../../../../hooks/useProductionOrders";
import { useProductionOrderItemsByOrderId } from "../../../../../hooks/useProductionOrderItems";
import {
  UpdateProductionOrderDto,
  ProductionOrderStatus,
  ProductionOrderShippingMethod,
} from "../../../../../services/production-orders/types";
import {
  productionOrderItemService,
  productionOrderItemsAPI,
  knitColorsAPI,
  bodyColorsAPI,
  packagingAPI,
} from "../../../../../services/production-order-items.service";

interface ProductionOrdersDetailsProps {
  productionOrderId: string;
}

const ProductionOrdersDetails: React.FC<ProductionOrdersDetailsProps> = ({
  productionOrderId,
}) => {
  const router = useRouter();
  const { fullname } = useSelector((state: RootState) => state.users);

  const [modifyFlag, setModifyFlag] = React.useState(false);
  const [productionStatus, setProductionStatus] = React.useState<number>(25); // Different default status for details

  // Use the actual update production order hook
  const updateProductionOrder = useUpdateProductionOrder();

  // Fetch production order data
  const {
    data: productionOrderData,
    isLoading: productionOrderLoading,
    error: productionOrderError,
  } = useProductionOrder(parseInt(productionOrderId), !!productionOrderId);

  // Fetch production order items
  const {
    data: productionOrderItemsData,
    isLoading: productionItemsLoading,
    error: productionItemsError,
  } = useProductionOrderItemsByOrderId(
    parseInt(productionOrderId),
    {},
    !!productionOrderId
  );

  const [customerData, setCustomerData] = React.useState<CustomerTypes | null>(
    null
  );
  const [currentCustomerID, setCurrentCustomerID] = React.useState<number>(1); // Will be set from production order data
  const [factoryData, setFactoryData] = React.useState<FactoryTypes | null>(
    null
  );
  const [currentFactoryID, setCurrentFactoryID] = React.useState<number>(1); // Will be set from production order data
  const [showPDFPreview, setShowPDFPreview] = React.useState(false);

  // Production Order Details Data - Will be populated from API data
  const [productionOrderFormData, setProductionOrderFormData] =
    React.useState<ProductionOrderData>({
      orderDate: "",
      expectedDeliveryDate: "",
      actualDeliveryDate: "",
      shippingMethod: "OCEAN",
      notes: "",
    });

  // Production Items - Will be populated from API data
  const [productionItems, setProductionItems] = React.useState<
    ProductionItem[]
  >([]);

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

  // Map API data to component state when data is loaded
  React.useEffect(() => {
    if (productionOrderData) {
      // Map production order data to form state
      setProductionOrderFormData({
        orderDate: productionOrderData.order_date,
        expectedDeliveryDate: productionOrderData.expected_delivery_date,
        actualDeliveryDate: productionOrderData.actual_delivery_date || "",
        shippingMethod: productionOrderData.shipping_method,
        notes: productionOrderData.notes || "",
      });

      // Set customer and factory IDs
      setCurrentCustomerID(productionOrderData.customer.id);
      setCurrentFactoryID(productionOrderData.factory.id);

      // Set production status
      setProductionStatus(mapStatusToNumber(productionOrderData.status));
    }
  }, [productionOrderData]);

  // Map production order items data to component state
  React.useEffect(() => {
    if (productionOrderItemsData?.items) {
      const fetchRelatedData = async () => {
        const mappedItems: ProductionItem[] = await Promise.all(
          productionOrderItemsData.items.map(async (item, index) => {
            let knitColors: any[] = [];
            let bodyColors: any[] = [];
            let packaging: any[] = [];

            try {
              // Fetch knit colors
              if (
                item.knitcolors_production_order &&
                item.knitcolors_production_order.length > 0
              ) {
                const knitColorsResponse = await knitColorsAPI.getByItemId(
                  item.pk_production_order_item_id
                );
                // Ensure we have an array
                knitColors = Array.isArray(knitColorsResponse)
                  ? knitColorsResponse
                  : [];
              }

              // Fetch body colors
              if (
                item.body_production_order_color &&
                item.body_production_order_color.length > 0
              ) {
                const bodyColorsResponse = await bodyColorsAPI.getByItemId(
                  item.pk_production_order_item_id
                );
                // Ensure we have an array
                bodyColors = Array.isArray(bodyColorsResponse)
                  ? bodyColorsResponse
                  : [];
              }

              // Fetch packaging
              if (
                item.packaging_production_order &&
                item.packaging_production_order.length > 0
              ) {
                const packagingResponse = await packagingAPI.getByItemId(
                  item.pk_production_order_item_id
                );
                // Ensure we have an array
                packaging = Array.isArray(packagingResponse)
                  ? packagingResponse
                  : [];
              }
            } catch (error) {
              // Set empty arrays on error to prevent further issues
              knitColors = [];
              bodyColors = [];
              packaging = [];
            }

            const mappedItem = {
              productionOrderItemID: item.pk_production_order_item_id,
              productionOrderID: item.fk_production_order_id,
              productID: item.product.id,
              categoryID: item.fk_category_id,
              categoryName: item.product.name, // Using product name as category name for now
              item_name: item.item_name,
              item_description: item.item_description || "",
              item_number: item.item_number || "",
              size: item.size || "",
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total,
              taxRate: item.tax_rate,
              knit_colors: knitColors.map((color: any) => ({
                name: color.name,
                fk_yarn_id: color.fk_yarn_id,
                description: color.description,
                yarn: color.yarn, // Include yarn data from backend
              })),
              body_colors: bodyColors.map((color: any) => ({
                name: color.name,
                fk_yarn_id: color.fk_yarn_id,
                description: color.description,
                yarn: color.yarn, // Include yarn data from backend
              })),
              packaging: packaging.map((pkg: any) => ({
                fk_packaging_id: pkg.fk_packaging_id,
                quantity: pkg.quantity || 1,
                packaging: pkg.packaging, // Include packaging data from backend
              })),
              actionEdit: false,
              actionDelete: false,
              actionCreate: false,
              actionModify: false,
              actionEdited: false,
              errorState: [],
              modifyList: [],
            };

            return mappedItem;
          })
        );

        setProductionItems(mappedItems);
      };

      fetchRelatedData();
    }
  }, [productionOrderItemsData]);

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

  // Helper function to map status enum to number
  const mapStatusToNumber = (status: ProductionOrderStatus): number => {
    switch (status) {
      case ProductionOrderStatus.PENDING:
        return 25;
      case ProductionOrderStatus.APPROVED:
        return 26;
      case ProductionOrderStatus.SHIPPED:
        return 27;
      case ProductionOrderStatus.DELIVERED:
        return 28;
      case ProductionOrderStatus.CANCELLED:
        return 29;
      default:
        return 25;
    }
  };

  // Function to handle updating production order items with their related data
  const handleUpdateProductionOrderItems = React.useCallback(async () => {
    try {
      // Process each production order item
      for (const item of productionItems) {
        // Handle new items (create)
        if (item.actionCreate && item.productionOrderItemID <= 0) {
          const createData = {
            // Basic item data
            fk_production_order_id: parseInt(productionOrderId),
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

          try {
            const createdItem =
              await productionOrderItemService.createCompleteItem(createData);
          } catch (error) {
            console.error(`Error creating new item:`, error);
            throw error;
          }
        }
        // Handle existing items that have been modified (update)
        else if (item.actionEdited && item.productionOrderItemID > 0) {
          const updateData = {
            // Basic item data
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

          try {
            const updatedItem =
              await productionOrderItemService.updateCompleteItem(
                item.productionOrderItemID,
                updateData
              );
          } catch (error) {
            console.error(
              `Error updating item ${item.productionOrderItemID}:`,
              error
            );
            throw error;
          }
        }
        // Handle deleted items (delete)
        else if (item.actionDelete && item.productionOrderItemID > 0) {
          try {
            await productionOrderItemsAPI.delete(item.productionOrderItemID);
          } catch (error) {
            console.error(
              `Error deleting item ${item.productionOrderItemID}:`,
              error
            );
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Failed to process production order items:", error);
      throw error;
    }
  }, [productionItems, productionOrderId]);

  const handleUpdateProductionOrder = React.useCallback(async () => {
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
    console.log("Production Order Data:", productionOrderFormData);

    if (
      !productionOrderFormData.orderDate ||
      productionOrderFormData.orderDate.trim() === ""
    ) {
      toast.error("Please fill in order date");
      return;
    }

    // Expected delivery date is required by backend
    if (
      !productionOrderFormData.expectedDeliveryDate ||
      productionOrderFormData.expectedDeliveryDate.trim() === ""
    ) {
      toast.error("Please fill in expected delivery date");
      return;
    }

    try {
      // Calculate totals from production items
      const totalQuantity = productionItems.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      );
      const totalAmount = productionItems.reduce(
        (sum, item) => sum + Number(item.total),
        0
      );

      // Prepare production order update data
      const updateData: UpdateProductionOrderDto = {
        fk_customer_id: customerData.pk_customer_id,
        fk_factory_id: factoryData.pk_factories_id,
        order_date: productionOrderFormData.orderDate,
        expected_delivery_date: productionOrderFormData.expectedDeliveryDate,
        actual_delivery_date:
          productionOrderFormData.actualDeliveryDate || undefined,
        shipping_method: mapShippingMethodToEnum(
          productionOrderFormData.shippingMethod || "OCEAN"
        ),
        status: mapStatusToEnum(productionStatus),
        total_quantity: totalQuantity,
        total_amount: totalAmount,
        notes: productionOrderFormData.notes || undefined,
        user_owner: fullname || undefined,
      };

      console.log("Updating production order with:", {
        id: parseInt(productionOrderId),
        data: updateData,
      });

      // Update the production order using the hook
      const result = await updateProductionOrder.mutateAsync({
        id: parseInt(productionOrderId),
        data: updateData,
      });

      console.log("Production order updated:", result);

      // Update production order items with their related data
      await handleUpdateProductionOrderItems();

      // Success
      setModifyFlag(false);
      toast.success("Production Order and all items updated successfully");
    } catch (error) {
      console.error("Failed to update production order:", error);
      toast.error("Failed to update production order. Please try again.");
    }
  }, [
    productionOrderId,
    customerData,
    factoryData,
    productionItems,
    productionOrderData,
    productionStatus,
    fullname,
    updateProductionOrder,
    handleUpdateProductionOrderItems,
  ]);

  return (
    <div className="flex flex-col p-4" style={{ rowGap: "10px" }}>
      {/* Loading State */}
      {(productionOrderLoading || productionItemsLoading) && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading production order details...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {(productionOrderError || productionItemsError) && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600 mb-4">
              {productionOrderError
                ? "Failed to load production order"
                : "Failed to load production order items"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content - Only show when data is loaded */}
      {!productionOrderLoading &&
        !productionItemsLoading &&
        !productionOrderError &&
        !productionItemsError && (
          <>
            <ProductionOrderHeaders
              status={productionStatus}
              setStatus={setProductionStatus}
              add={false}
              modifyFlag={modifyFlag}
              setModifyFlag={setModifyFlag}
              handleUpdateClick={handleUpdateProductionOrder}
              isSaving={updateProductionOrder.isPending}
              disableSave={false}
              onPreviewClick={() => setShowPDFPreview(true)}
              productionOrderId={productionOrderId}
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
              productionOrderData={productionOrderFormData}
              setProductionOrderData={setProductionOrderFormData}
              factoryData={factoryData as FactoryData}
            />

            {/* Production Items Table */}
            {(() => {
              if (productionItems.length > 0) {
                return null;
              }
              return null;
            })()}
            <ProductionItemsTable
              productionItems={productionItems}
              setProductionItems={setProductionItems}
              setModifyFlag={setModifyFlag}
              isLoading={productionItemsLoading}
            />

            {/* Production Order Summary */}
            {productionItems.length > 0 && (
              <ProductionOrderSummary
                data={{
                  totalItems: productionItems.length,
                  totalQuantity: productionItems.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0
                  ),
                  subtotal: productionItems.reduce(
                    (sum, item) => sum + (Number(item.total) || 0),
                    0
                  ),
                  taxAmount: productionItems.reduce(
                    (sum, item) =>
                      sum +
                      (Number(item.total) || 0) * (Number(item.taxRate) || 0),
                    0
                  ),
                  taxRate:
                    productionItems.length > 0
                      ? Number(productionItems[0].taxRate) || 0.08
                      : 0.08,
                  grandTotal: productionItems.reduce((sum, item) => {
                    const itemTotal = Number(item.total) || 0;
                    const itemTaxRate = Number(item.taxRate) || 0;
                    const itemTaxAmount = itemTotal * itemTaxRate;
                    const itemGrandTotal = itemTotal + itemTaxAmount;
                    return sum + itemGrandTotal;
                  }, 0),
                  estimatedCompletionDays: 14,
                  status: "pending",
                  priority: "medium",
                }}
              />
            )}

            {/* Activity History */}
            <ActivityHistory
              documentID={parseInt(productionOrderId)}
              toggleRefetch={false}
            />

            {/* PDF Preview Dialog */}
            {showPDFPreview && (
              <PDFPreviewDialog
                open={showPDFPreview}
                onOpenChange={setShowPDFPreview}
                productionOrderId={productionOrderId}
                customerData={customerData}
                factoryData={factoryData}
                productionItems={productionItems}
                productionOrderData={productionOrderFormData}
                poNumber={
                  productionOrderData?.po_number || `PO-${productionOrderId}`
                }
                status={productionOrderData?.status || "PENDING"}
              />
            )}
          </>
        )}
    </div>
  );
};

export default ProductionOrdersDetails;
