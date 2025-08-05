"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Badge } from "../../../../ui/badge";
import { CalendarDays, Package, Truck, User, Hash, Clock } from "lucide-react";

interface ProductionInfoProps {
  productionOrderId?: string;
}

const ProductionInfo: React.FC<ProductionInfoProps> = ({ productionOrderId }) => {
  // Hardcoded information for now
  const hardcodedInfo = {
    po_number: productionOrderId ? `1-${productionOrderId.padStart(2, '0')}` : "1-01",
    status: "In Production",
    created_date: "2024-01-15",
    due_date: "2024-02-15",
    production_facility: "Main Production Floor",
    priority: "High",
    estimated_completion: "2024-02-10",
    production_notes: "Rush order - Customer requires early delivery for trade show",
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in production":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card style={{
      backgroundColor: "#FFFFFF",
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-semibold flex items-center gap-2" style={{
          fontSize: "18px",
          color: "#000000",
          lineHeight: "1.2",
          margin: "0",
        }}>
          <Package className="h-5 w-5" style={{ color: "#67A3F0" }} />
          Production Order Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PO Number */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Hash className="h-4 w-4" />
              PO Number
            </div>
            <div className="text-lg font-semibold">{hardcodedInfo.po_number}</div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              Status
            </div>
            <Badge className={getStatusColor(hardcodedInfo.status)}>
              {hardcodedInfo.status}
            </Badge>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Truck className="h-4 w-4" />
              Priority
            </div>
            <Badge className={getPriorityColor(hardcodedInfo.priority)}>
              {hardcodedInfo.priority}
            </Badge>
          </div>

          {/* Created Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <CalendarDays className="h-4 w-4" />
              Created Date
            </div>
            <div className="text-sm">{formatDate(hardcodedInfo.created_date)}</div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <CalendarDays className="h-4 w-4" />
              Due Date
            </div>
            <div className="text-sm font-medium text-orange-600">
              {formatDate(hardcodedInfo.due_date)}
            </div>
          </div>

          {/* Estimated Completion */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <CalendarDays className="h-4 w-4" />
              Est. Completion
            </div>
            <div className="text-sm text-green-600">
              {formatDate(hardcodedInfo.estimated_completion)}
            </div>
          </div>

          {/* Production Facility */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <User className="h-4 w-4" />
              Production Facility
            </div>
            <div className="text-sm">{hardcodedInfo.production_facility}</div>
          </div>

          {/* Production Notes */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <div className="text-sm font-medium text-gray-600">Production Notes</div>
            <div className="text-sm bg-gray-50 p-3 rounded-md">
              {hardcodedInfo.production_notes}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionInfo;