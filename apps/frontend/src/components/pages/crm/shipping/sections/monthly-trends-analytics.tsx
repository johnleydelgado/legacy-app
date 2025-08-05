import * as React from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

interface MonthlyTrendsData {
  month: string;
  shipmentCount: number;
  totalRevenue: number;
  averageShipmentValue: number;
  customerCount: number;
}

const MonthlyTrendsAnalytics: React.FC<{
  data: MonthlyTrendsData[];
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
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );
  const totalRevenue = sortedData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Monthly Revenue Trends
        </h3>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1">
        {sortedData.map((month, index) => {
          const prevMonth = index > 0 ? sortedData[index - 1] : null;
          const change = prevMonth
            ? ((month.totalRevenue - prevMonth.totalRevenue) /
                Math.abs(prevMonth.totalRevenue)) *
              100
            : 0;
          const isPositive = change >= 0;

          return (
            <div
              key={month.month}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{month.month}</h4>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(month.totalRevenue)}
                  </div>
                  {prevMonth && (
                    <div
                      className={`text-sm flex items-center gap-1 ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(change).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">
                    Shipments: {month.shipmentCount}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">
                    Customers: {month.customerCount}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">
                    Avg: {formatCurrency(month.averageShipmentValue)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyTrendsAnalytics;
