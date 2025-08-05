"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { VendorForm } from "./types";
import { Vendor } from "@/services/vendors/types";

interface Props {
  notes?: string;
}

export function VendorAdditionalFields({ notes }: Props) {
  const { register, setValue } = useFormContext<VendorForm>();

  React.useEffect(() => {
    if (notes) {
      setValue("notes", notes);
    }
  }, [notes, setValue]);

  return (
    <div className="space-y-6">
      {/* ── Notes ────────────────────────────────────────────── */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <Textarea
          id="notes"
          placeholder="Add any additional information about this vendor"
          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px] resize-none"
          {...register("notes")}
        />
      </div>

      {/* Hidden status field with default value */}
      <input type="hidden" {...register("status")} value="ACTIVE" />
    </div>
  );
} 