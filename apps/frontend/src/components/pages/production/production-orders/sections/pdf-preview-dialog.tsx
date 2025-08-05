"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../ui/dialog";
import { Button } from "../../../../ui/button";
import { Download, Printer, X } from "lucide-react";
import ProductionOrderPDF from "./production-order-pdf";
import { ProductionItem } from "./production-items-table";
import { Customer as CustomerTypes } from "@/services/quotes/types";
import { FactoryTypes } from "../sections/customer-factory-info";
import { ProductionOrderData } from "../sections/production-order-details-form";
import { createPortal } from "react-dom";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionOrderId: string;
  customerData: CustomerTypes | null;
  factoryData: FactoryTypes | null;
  productionItems: ProductionItem[];
  productionOrderData: ProductionOrderData;
  poNumber?: string;
  status?: string;
}

const PDFPreviewDialog: React.FC<PDFPreviewDialogProps> = ({
  open,
  onOpenChange,
  productionOrderId,
  customerData,
  factoryData,
  productionItems,
  productionOrderData,
  poNumber,
  status,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically generate and download a PDF
    // For now, we'll just show an alert
    alert("PDF download functionality would be implemented here");
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
      <div className="w-2/3 h-full bg-white shadow-2xl">
        {/* Header */}
        <div className="p-4 pb-0 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Production Order Preview</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-4 bg-gray-100 overflow-auto"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="min-w-[1000px] w-full">
            <ProductionOrderPDF
              customerData={customerData}
              factoryData={factoryData}
              productionItems={productionItems}
              productionOrderData={productionOrderData}
              poNumber={poNumber || ""}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PDFPreviewDialog;
