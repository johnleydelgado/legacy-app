import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CustomerForm } from "./types";
import { Select } from "../common";

export function CustomerDetailsFields() {
  const { register } = useFormContext<CustomerForm>();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* ── Customer Name ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Customer Name<span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            required
            placeholder="Customer name"
            {...register("name", { required: true })}
          />
        </div>

        {/* ── Customer Type ───────────────────────────────────── */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Customer&nbsp;Type
          </label>
          <Select {...register("customerType", { required: true })}>
            <option value="LEAD">Lead</option>
            <option value="PROSPECT">Prospect</option>
            <option value="CLIENT">Client</option>
          </Select>
        </div>

        {/* ── Owner Name ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="ownerName" className="mb-2 block text-sm font-medium">
            Owner Name
          </label>
          <Input
            id="ownerName"
            placeholder="Owner name"
            {...register("ownerName")}
          />
        </div>

        {/* ── Email ───────────────────────────────────────────── */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder="info@acme.com"
            {...register("email", { required: true })}
          />
        </div>

        {/* ── Status ──────────────────────────────────────────── */}
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <Select {...register("status", { required: true })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
