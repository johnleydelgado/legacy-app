/* components/forms/customer/address-block.tsx */
"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { US_STATES } from "@/constants/states";

import type { CustomerForm } from "./types";

/* ------------------------------------------------------------------ */

type AddressPrefix = `addresses.${number}`;

interface Props {
  prefix: AddressPrefix;
}

export function AddressBlock({ prefix }: Props) {
  const { register, setValue, watch } = useFormContext<CustomerForm>();

  /* UI-state ------------------------------------------------------- */
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* form-state (single source of truth) ---------------------------- */
  const stateValue = watch(`${prefix}.state`) ?? "";

  /* register the field once so RHF knows it exists ----------------- */
  useEffect(() => {
    register(`${prefix}.state`, { required: true });
  }, [prefix, register]);

  /* auto-set BILLING / SHIPPING flag ------------------------------- */
  useEffect(() => {
    setValue(
      `${prefix}.address_type`,
      prefix === "addresses.0" ? "BILLING" : "SHIPPING"
    );
  }, [prefix, setValue]);

  /* ---------------------------------------------------------------- */

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* street address */}
      <div className="md:col-span-2">
        <label
          htmlFor={`${prefix}.address1`}
          className="mb-2 block text-sm font-medium"
        >
          Street Address
        </label>
        <Input
          id={`${prefix}.address1`}
          placeholder="123 Main St"
          {...register(`${prefix}.address1`, { required: true })}
        />
      </div>

      {/* city */}
      <div>
        <label
          htmlFor={`${prefix}.city`}
          className="mb-2 block text-sm font-medium"
        >
          City
        </label>
        <Input
          id={`${prefix}.city`}
          placeholder="City"
          {...register(`${prefix}.city`, { required: true })}
        />
      </div>

      {/* state dropdown */}
      <div className="relative">
        <label
          htmlFor={`${prefix}.state`}
          className="mb-2 block text-sm font-medium"
        >
          State
        </label>

        {/* trigger */}
        <div
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm"
        >
          <span>
            {stateValue
              ? US_STATES.find((s) => s.value === stateValue)?.label
              : "Select a state"}
          </span>
          <span className="ml-2">▼</span>
        </div>

        {/* dropdown */}
        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            <Command className="overflow-visible">
              <CommandInput
                placeholder="Search states…"
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-9"
                autoFocus
              />
              <CommandEmpty>No state found.</CommandEmpty>

              <CommandGroup className="max-h-52 overflow-auto">
                {US_STATES.filter(
                  (s) =>
                    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.value.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((s) => (
                  <CommandItem
                    key={s.value}
                    onSelect={() => {
                      setValue(`${prefix}.state`, s.value, {
                        shouldValidate: true,
                      });
                      setSearchQuery("");
                      setOpen(false);
                    }}
                  >
                    {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        )}
      </div>

      {/* zip */}
      <div>
        <label
          htmlFor={`${prefix}.zip`}
          className="mb-2 block text-sm font-medium"
        >
          Zip
        </label>
        <Input
          id={`${prefix}.zip`}
          placeholder="Zip"
          {...register(`${prefix}.zip`, { required: true })}
        />
      </div>

      {/* country */}
      <div>
        <label
          htmlFor={`${prefix}.country`}
          className="mb-2 block text-sm font-medium"
        >
          Country
        </label>
        <Input
          id={`${prefix}.country`}
          placeholder="Country"
          {...register(`${prefix}.country`, { required: true })}
        />
      </div>
    </div>
  );
}
