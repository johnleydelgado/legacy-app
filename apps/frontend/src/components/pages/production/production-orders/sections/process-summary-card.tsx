"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";

interface ProcessSummaryCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const ProcessSummaryCard: React.FC<ProcessSummaryCardProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};