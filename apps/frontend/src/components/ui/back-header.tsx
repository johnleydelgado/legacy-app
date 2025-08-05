"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface BackHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Where the back-button should navigate */
  href: string;
  /** Page title text */
  title: string;
  /** Optional node(s) rendered on the far right (e.g. action buttons) */
  actions?: React.ReactNode;
}

export function BackHeader({
  href,
  title,
  actions,
  className,
  ...rest
}: BackHeaderProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      data-slot="back-header"
      {...rest}
    >
      {/* <button
        onClick={handleBack}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted/20 transition-transform hover:bg-muted/30 active:scale-85"
      >
        <ArrowLeft className="h-5 w-5" />
      </button> */}

      <h1 className="text-xl font-semibold flex-1">{title}</h1>

      {actions}
    </div>
  );
}
