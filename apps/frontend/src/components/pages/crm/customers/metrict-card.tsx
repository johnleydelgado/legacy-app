import * as React from "react";
import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { formatMetric } from "@/lib/user-utils";

interface Props {
  title: string;
  value: number;
  growth: number;
  icon: LucideIcon;
}



export function MetricCard({ title, value, growth, icon: Icon }: Props) {
  return (
    <Card className="w-full bg-card/80">
      {/* header */}
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm">{title}</CardTitle>
        <CardAction>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
            <Icon className="h-5 w-5 stroke-amber-50" />
          </div>
        </CardAction>
      </CardHeader>

      {/* metric */}
      <CardContent
        className="
          flex w-full items-start
          flex-col gap-1
          [@media(min-width:420px)]:flex-row
          [@media(min-width:420px)]:items-center
          [@media(min-width:420px)]:justify-between
          px-6
        "
      >
        <span className="text-3xl font-bold tracking-tight">
          {formatMetric(value)}
        </span>

        <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
          <TrendingUp className="h-3 w-3 stroke-emerald-500" />
          {growth}
          <span>%</span>
        </span>
      </CardContent>
    </Card>
  );
}
