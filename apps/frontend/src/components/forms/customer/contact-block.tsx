/* components/forms/customer/ContactBlock.tsx */
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CustomerForm } from "./types";
import { Select } from "../common";

type Props = {
  prefix: `contacts.${number}`;
};

export function ContactBlock({ prefix }: Props) {
  const { register, control } = useFormContext<CustomerForm>();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* first / last name */}
      <div>
        <label
          htmlFor={`${prefix}.firstname`}
          className="mb-2 block text-sm font-medium"
        >
          First Name
        </label>
        <Input
          id={`${prefix}.firstname`}
          {...register(`${prefix}.firstname`, { required: true })}
          placeholder="First name"
        />
      </div>

      <div>
        <label
          htmlFor={`${prefix}.lastname`}
          className="mb-2 block text-sm font-medium"
        >
          Last Name
        </label>
        <Input
          id={`${prefix}.lastname`}
          {...register(`${prefix}.lastname`, { required: true })}
          placeholder="Last name"
        />
      </div>

      {/* position / contact type */}
      <div>
        <label
          htmlFor={`${prefix}.positionTitle`}
          className="mb-2 block text-sm font-medium"
        >
          Position Title
        </label>
        <Input
          id={`${prefix}.positionTitle`}
          {...register(`${prefix}.positionTitle`, { required: true })}
          placeholder="e.g. Purchasing Manager"
        />
      </div>

      <div>
        <label
          htmlFor={`${prefix}.contactType`}
          className="mb-2 block text-sm font-medium"
        >
          Contact Type
        </label>
        <Controller
          control={control}
          name={`${prefix}.contactType`}
          render={({ field }) => (
            <Select
              id={`${prefix}.contactType`}
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            >
              <option value="">Select Contact Type</option>
              <option value="PRIMARY">Primary</option>
              <option value="BILLING">Billing</option>
              <option value="SHIPPING">Shipping</option>
              <option value="OTHER">Other</option>
            </Select>
          )}
        />
      </div>

      {/* email */}
      <div className="md:col-span-2">
        <label
          htmlFor={`${prefix}.email`}
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>
        <Input
          id={`${prefix}.email`}
          type="email"
          {...register(`${prefix}.email`, { required: true })}
          placeholder="contact@example.com"
        />
      </div>

      {/* phone / mobile */}
      <div>
        <label
          htmlFor={`${prefix}.phoneNumber`}
          className="mb-2 block text-sm font-medium"
        >
          Phone
        </label>
        <Input
          id={`${prefix}.phoneNumber`}
          {...register(`${prefix}.phoneNumber`)}
          placeholder="(000) 123-4567"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}.mobileNumber`}
          className="mb-2 block text-sm font-medium"
        >
          Mobile
        </label>
        <Input
          id={`${prefix}.mobileNumber`}
          {...register(`${prefix}.mobileNumber`)}
          placeholder="+63 912 345 6789"
        />
      </div>
    </div>
  );
}
