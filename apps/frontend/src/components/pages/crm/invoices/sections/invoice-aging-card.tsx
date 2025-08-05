'use client';

import { CalendarDays, AlertTriangle, Clock, FileWarning } from "lucide-react";

interface InvoiceAgingCardProps {
  period: string;
  amount: number;
  invoiceCount: number;
  variant: "current" | "thirty" | "sixty" | "ninety";
}

type VariantType = {
  [key in InvoiceAgingCardProps["variant"]]: {
    icon: typeof CalendarDays;
  };
};

const getVariantStyles = (variant: InvoiceAgingCardProps["variant"]) => {
  const styles: VariantType = {
    current: {
      icon: CalendarDays,
    },
    thirty: {
      icon: Clock,
    },
    sixty: {
      icon: AlertTriangle,
    },
    ninety: {
      icon: FileWarning,
    },
  };
  return styles[variant];
};

export const InvoiceAgingCard = ({
  period,
  amount,
  invoiceCount,
  variant,
}: InvoiceAgingCardProps) => {
  const styles = getVariantStyles(variant);
  const Icon = styles.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div 
      className="bg-white border border-gray-200 transition-all hover:shadow-md"
      style={{
        borderRadius: '14px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        padding: '24px'
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#67A3F0' }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div 
        className="font-bold leading-none mb-2"
        style={{ 
          fontSize: '30px',
          color: '#000000'
        }}
      >
        {formatCurrency(amount)}
      </div>
      <div 
        className="text-sm font-medium mb-2"
        style={{ color: '#6C757D' }}
      >
        {period}
      </div>
      <div className="flex items-center">
        <span 
          className="text-xs"
          style={{ color: '#6C757D' }}
        >
          {invoiceCount} invoices
        </span>
      </div>
    </div>
  );
};
