import React from "react";
import { User, Users } from "lucide-react";

// Analytics Components
interface OwnerBreakdownData {
  customerId: number;
  customerName: string;
  ownerName: string;
  orderCount: number;
  totalValue: number;
}

const OwnerBreakdownCard: React.FC<{
  data: OwnerBreakdownData[];
  loading?: boolean;
}> = ({ data = [], loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Top Customers by Value
        </h3>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1">
        {data.slice(0, 10).map((customer, index) => {
          const percentage =
            totalRevenue > 0 ? (customer.totalValue / totalRevenue) * 100 : 0;

          return (
            <div
              key={customer.customerId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {customer.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.orderCount} orders
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(customer.totalValue)}
                </div>
                <div className="text-sm text-gray-500">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerBreakdownCard;
