import React from "react";
import { Customer as CustomerTypes } from "@/services/quotes/types";
import { FactoryTypes } from "../sections/customer-factory-info";
import { ProductionOrderData } from "../sections/production-order-details-form";
import { ProductionItem } from "../sections/production-items-table";
import { COMPANY_INFO } from "../../../../../constants/company-info";

export interface ProductionOrderPDFProps {
  customerData: CustomerTypes | null;
  factoryData: FactoryTypes | null;
  productionItems: ProductionItem[];
  productionOrderData: ProductionOrderData;
  poNumber: string;
  status?: string;
}

const ProductionOrderPDF: React.FC<ProductionOrderPDFProps> = ({
  customerData,
  factoryData,
  productionItems,
  productionOrderData,
  poNumber,
  status = "PENDING",
}) => {
  // Calculate totals
  const grandTotal = productionItems.reduce(
    (sum, item) =>
      sum + Number(item.total) + Number(item.total) * Number(item.taxRate),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="bg-white text-gray-900 font-sans p-8"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              PRODUCTION ORDER
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Generated on: {new Date().toLocaleDateString()}</p>
              <p>
                Status:{" "}
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    status
                  )}`}
                >
                  {status}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-800 text-white px-6 py-3 rounded">
              <div className="text-xl font-bold">{poNumber}</div>
              <div className="text-sm opacity-90">Production Order #</div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Items Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Production Items
        </h2>

        <div className="border border-gray-300 rounded overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-2">Item</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2">Yarns</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-1">Unit Price</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Packaging</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-300">
            {productionItems.map((item, index) => (
              <div key={index}>
                {/* Main Item Row */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-2">
                      <div className="font-medium text-gray-800">
                        Item #{item.item_number}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.item_name}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-gray-700">
                        {item.item_description}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-gray-700">{item.size || "-"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Knit:</span>{" "}
                          {item.knit_colors.length > 0
                            ? item.knit_colors.map((c) => c.name).join(", ")
                            : "-"}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Body:</span>{" "}
                          {item.body_colors.length > 0
                            ? item.body_colors.map((c) => c.name).join(", ")
                            : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-gray-700 font-medium">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-gray-700">
                        {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-gray-700 font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs text-gray-600">
                        {item.packaging.length > 0
                          ? item.packaging
                              .map(
                                (p) =>
                                  p.packaging?.packaging ||
                                  `Pkg ${p.fk_packaging_id}`
                              )
                              .join(", ")
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artwork Row */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="text-center">
                    <img
                      src="https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/artwork_sample.png"
                      alt="Artwork Sample"
                      className="mx-auto mb-2 object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details & Summary */}
      <div className="bg-gray-50 p-6 rounded border mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          Order Details & Summary
        </h2>

        {/* Order Details */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Order Information
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Order Date:</span>
              <span className="ml-2">
                {formatDate(productionOrderData.orderDate)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Expected Delivery:
              </span>
              <span className="ml-2">
                {formatDate(productionOrderData.expectedDeliveryDate)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Shipping Method:
              </span>
              <span className="ml-2">
                {productionOrderData.shippingMethod || "Standard"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Order Summary
          </h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {productionItems.length}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {productionItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {formatCurrency(
                  productionItems.reduce((sum, item) => sum + item.total, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Subtotal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {formatCurrency(grandTotal)}
              </div>
              <div className="text-sm text-gray-600">Grand Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Yarn Colors Reference */}
      {/* {productionItems.length > 0 &&
        productionItems[0].body_colors.length > 0 && (
          <div className="bg-gray-50 p-6 rounded border mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              Yarn Color Reference
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {productionItems[0].body_colors.map((color, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded border text-center"
                >
                  <div className="w-12 h-16 bg-gray-200 mx-auto rounded mb-2 border"></div>
                  <div className="font-medium text-sm text-gray-800">
                    {color.yarn?.yarn_color || color.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {color.yarn?.color_code || color.yarn?.card_number || ""}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {color.yarn?.yarn_type || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

      {/* Notes Section */}
      {productionOrderData.notes && (
        <div className="bg-gray-50 p-6 rounded border mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Special Instructions
          </h2>
          <div className="bg-white p-4 rounded border-l-4 border-gray-400">
            <p className="text-gray-700">{productionOrderData.notes}</p>
          </div>
        </div>
      )}

      {/* Footer - Commented out approval sections */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="text-center text-sm text-gray-500">
          <p>Production Order Document - For Factory Use</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Commented out approval sections
      <div className="grid grid-cols-3 gap-8 text-sm mt-6">
        <div>
          <div className="font-semibold text-gray-800 mb-2">Customer Approval</div>
          <div className="border-t-2 border-gray-300 pt-2">
            <div className="text-gray-500">Signature: _________________</div>
            <div className="text-gray-500">Date: _________________</div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-800 mb-2">Factory Confirmation</div>
          <div className="border-t-2 border-gray-300 pt-2">
            <div className="text-gray-500">Signature: _________________</div>
            <div className="text-gray-500">Date: _________________</div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-800 mb-2">Quality Check</div>
          <div className="border-t-2 border-gray-300 pt-2">
            <div className="text-gray-500">Inspector: _________________</div>
            <div className="text-gray-500">Date: _________________</div>
          </div>
        </div>
      </div>
      */}
      </div>
    </div>
  );
};

export default ProductionOrderPDF;
