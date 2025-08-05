"use client";

import Image from "next/image";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import LegacyLogo from "@/assets/images/LegacyLogo.avif";
import { COMPANY_INFO } from "@/constants/company-info";

interface CompanyInfoProps {
  /** Shown in a gray badge under the contact block (optional) */
  requestedInHandDate?: string;
}

/* ─────────────────────────── COMPONENT ──────────────────────────── */
const CompanyInfo = ({ requestedInHandDate }: CompanyInfoProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
      {/* Card header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-100 rounded-full p-2">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">
          Company Information
        </h2>
      </div>

      {/* Body: logo + single text column */}
      <div className="flex gap-4">
        {/* Logo */}
        <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0">
          <Image
            src={LegacyLogo}
            alt="Legacy Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* Name, address, contact */}
        <div className="space-y-2 text-sm text-gray-700">
          {/* Company name + tagline */}
          <div>
            <p className="font-semibold text-gray-900">{COMPANY_INFO.name}</p>
            <p className="text-gray-500">{COMPANY_INFO.description}</p>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-px text-gray-400" />
            <span>
              {COMPANY_INFO.address.street1}, {COMPANY_INFO.address.city}{" "}
              {COMPANY_INFO.address.state} {COMPANY_INFO.address.zip}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-2">
            <Phone size={14} className="mt-px text-gray-400" />
            <span>{COMPANY_INFO.address.phone}</span>
          </div>

          {/* Email */}
          <div className="flex items-start gap-2">
            <Mail size={14} className="mt-px text-gray-400" />
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="text-blue-600 hover:underline"
            >
              {COMPANY_INFO.email}
            </a>
          </div>

          {/* Optional requested in‑hand badge */}
          {requestedInHandDate && (
            <p className="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              Requested In‑Hand:&nbsp;{requestedInHandDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
