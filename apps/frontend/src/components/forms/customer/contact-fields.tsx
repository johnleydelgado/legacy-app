"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { CustomerForm } from "./types";
import { ContactBlock } from "./contact-block";
import { emptyContact } from "@/lib/initialData";

export function BillingContactFields() {
  const { control } = useFormContext<CustomerForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
    keyName: "id", // ← still lets React track the array efficiently
  });

  return (
    <div className="space-y-8">
      {fields.map((c, i) => {
        const isPrimary = c.contactType === "PRIMARY";

        return (
          <div key={c.id} className="space-y-4 border-b pb-6 last:border-none">
            {/* header row */}
            <div className="flex items-center justify-end">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                  className="p-1 rounded-l-full bg-red-400"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>

            {/* inner inputs */}
            <ContactBlock prefix={`contacts.${i}` as const} />
          </div>
        );
      })}

      {/* add another contact */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(emptyContact())}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add contact
      </Button>
    </div>
  );
}
