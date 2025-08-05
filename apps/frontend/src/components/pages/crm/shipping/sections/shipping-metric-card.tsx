import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  variant: "blue" | "green" | "yellow" | "orange" | "violet";
}

export function OrdersMetricCard({
  title,
  value,
  helper,
  icon: Icon,
  variant,
}: Props) {
  const variantStyles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    orange: "bg-orange-50 text-orange-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
    </div>
  );
}
