import React from "react";

type StatusType =
  // Order statuses
  | "COMPLETED"
  | "PROCESSING"
  | "ON_HOLD"
  | "CANCELLED"
  // Customer statuses
  | "Active"
  | "Inactive"
  | "ACTIVE"
  | "INACTIVE"
  // Quote statuses
  | "APPROVED"
  | "PENDING APPROVAL"
  // Product statuses
  | "IN STOCK"
  | "LOW STOCK"
  | "OUT OF STOCK";

interface StatusBadgeProps {
  /** The status text to display */
  status: StatusType;
  /**
   * (Optional) Override the default color mapping
   * Example: "bg-green-600", "bg-red-500", "bg-yellow-600", etc.
   */
  bgColorClass?: string;
  /**
   * (Optional) A Tailwind‐CSS class (or classes) for the text color.
   * Default is white ("text-white"), but you can override if needed.
   */
  textColorClass?: string;
}

const getDefaultStatusColor = (status: StatusType): string => {
  // Success/Positive statuses
  if (
    ["COMPLETED", "Active", "ACTIVE", "APPROVED", "IN STOCK"].includes(status)
  ) {
    return "bg-green-600";
  }

  // Warning/Attention statuses
  if (["ON_HOLD", "LOW STOCK"].includes(status)) {
    return "bg-yellow-600";
  }

  // Processing/In Progress statuses
  if (["PROCESSING", "PENDING APPROVAL"].includes(status)) {
    return "bg-blue-600";
  }

  // Error/Negative statuses
  if (["OUT OF STOCK", "CANCELLED"].includes(status)) {
    return "bg-red-600";
  }

  // Neutral/Inactive statuses
  if (["Inactive", "INACTIVE"].includes(status)) {
    return "bg-gray-600";
  }

  // Default fallback
  return "bg-gray-600";
};

export function StatusBadge({
  status,
  bgColorClass,
  textColorClass = "text-white",
}: StatusBadgeProps) {
  const defaultBgColor = getDefaultStatusColor(status);

  return (
    <span
      className={`
        ${bgColorClass || defaultBgColor} ${textColorClass}
        inline-block px-2 py-0.5 text-xs font-medium rounded-full
        max-w-[120px] truncate whitespace-nowrap text-center
      `}
      title={status && status.replace("_", " ")}
    >
      {status && status.replace("_", " ")}
    </span>
  );
}
