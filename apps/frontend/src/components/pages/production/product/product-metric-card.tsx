
import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
    /** e.g. "TOTAL PRODUCTS" */
    title: string;
    /** main value (number or string like "10/2/3") */
    value: string | number;
    /** helper line under the value */
    helper: string;
    /** Lucide icon component */
    icon: LucideIcon;
    /** accent colour - pick from palette below */
    variant: "blue" | "green" | "yellow" | "red" | "violet";
}

/* palette for accent bar + icon badge */
const variantColours: Record<
    Props["variant"],
    { bar: string; badge: string; text: string }
> = {
    blue: { bar: "from-cyan-500 to-blue-500", badge: "bg-cyan-600", text: "text-cyan-400" },
    green: { bar: "from-emerald-500 to-green-500", badge: "bg-emerald-600", text: "text-emerald-400" },
    yellow: { bar: "from-yellow-500 to-amber-500", badge: "bg-amber-500", text: "text-amber-400" },
    red: { bar: "from-rose-500 to-red-500", badge: "bg-rose-600", text: "text-rose-400" },
    violet: { bar: "from-fuchsia-500 to-violet-500", badge: "bg-violet-600", text: "text-violet-400" },
};

export function ProductMetricCard({
    title,
    value,
    helper,
    icon: Icon,
    variant,
}: Props) {
    const colours = variantColours[variant];

    return (
        <div
            className={`
        relative flex flex-col justify-between rounded-lg bg-card/60 p-6
        shadow-sm ring-1 ring-black/5
        before:absolute before:inset-x-0 before:top-0 before:h-1
        before:rounded-t-lg before:bg-gradient-to-r before:${colours.bar}
      `}
        >
            {/* title + icon */}
            <div className="flex items-start justify-between">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                    {title}
                </p>

                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${colours.badge}`}
                >
                    <Icon className="h-4 w-4 stroke-[2]" />
                </div>
            </div>

            {/* metric value */}
            <p className="pt-4 text-2xl font-bold tracking-tight">
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>

            {/* helper line */}
            <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
    );
}
