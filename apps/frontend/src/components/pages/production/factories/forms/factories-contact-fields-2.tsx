"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Briefcase, Smartphone } from "lucide-react";
import { Factory } from "@/services/factories/types";
import { FactoryForm } from "./types";

interface Props {
  factoryData?: Factory;
}

export function FactoryContactFieldsV2({ factoryData }: Props) {
  const { register, setValue, watch } = useFormContext<FactoryForm>();

  const selectedContactType = watch("contact.contact_type");

  React.useEffect(() => {
    if (factoryData) {
      setValue("contact.first_name", factoryData.contact.first_name);
      setValue("contact.last_name", factoryData.contact.last_name);
      setValue("contact.position_title", factoryData.contact.position_title || "");
      setValue("contact.email", factoryData.contact.email);
      setValue("contact.phone_number", factoryData.contact.phone_number || "");
      setValue("contact.mobile_number", factoryData.contact.mobile_number || "");
    }
  }, [factoryData, setValue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {/* ── Contact Name ────────────────────────────────────────────── */}
        <div className="flex flex-row gap-1">
          <div className="w-1/3 grow">
            <label htmlFor="contact_name" className="mb-2 block text-sm font-medium text-gray-700">
              Contact Name<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex flex-row gap-1">
            <div className="relative w-1/3 grow">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="contact.first_name"
                required
                placeholder="first name"
                defaultValue={factoryData?.contact?.first_name || ""}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register("contact.first_name", { required: true })}
              />
            </div>
            <div className="relative w-1/3 grow">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="contact.last_name"
                required
                placeholder="last name"
                defaultValue={factoryData?.contact?.last_name || ""}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register("contact.last_name", { required: true })}
              />
            </div>
            </div>
          </div>
        </div>

        {/* ── Job Title ───────────────────────────────────── */}
        <div>
          <label htmlFor="contact.position_title" className="mb-2 block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="contact.position_title"
              placeholder="e.g. Sales Manager"
              defaultValue={factoryData?.contact?.position_title || ""}
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("contact.position_title")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Email ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="contact.email" className="mb-2 block text-sm font-medium text-gray-700">
            Email<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="contact.email"
              type="email"
              required
              placeholder="email@example.com"
              defaultValue={factoryData?.contact?.email || ""}
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("contact.email", { required: true })}
            />
          </div>
        </div>

        {/* ── Phone ───────────────────────────────────── */}
        <div>
          <label htmlFor="contact.phone_number" className="mb-2 block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="contact.phone_number"
              required
              placeholder="(123) 456-7890"
              defaultValue={factoryData?.contact?.phone_number || ""}
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("contact.phone_number")}
            />
          </div>
        </div>

        {/* ── Mobile ───────────────────────────────────── */}
        <div>
          <label htmlFor="contact.mobile_number" className="mb-2 block text-sm font-medium text-gray-700">
            Mobile <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="contact.mobile_number"
              required
              placeholder="(123) 456-7890"
              defaultValue={factoryData?.contact?.mobile_number || ""}
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("contact.mobile_number")}
            />
          </div>
        </div>
      </div>

      {/* Hidden fields for last_name, mobile_number, and contact_type with defaults */}
      <input type="hidden" {...register("contact.contact_type")} value="PRIMARY" />
    </div>
  );
} 