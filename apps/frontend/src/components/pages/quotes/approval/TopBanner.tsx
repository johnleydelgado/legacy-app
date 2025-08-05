import Image from "next/image";
import LegacyLogo from "@/assets/images/LegacyLogo.avif";
import QuoteApprovalContent from "./QuoteApprovalContent";
import type { QuoteItem } from "@/services/quote-items/types";
import type { Address, Contact } from "@/services/customers/types";
import { COMPANY_INFO } from "@/constants/company-info";

const TopBanner = () => {
  return (
    <div className="mx-auto max-w-6xl bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between text-gray-900 px-8 py-6">
        {/* Logo + address */}
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-md overflow-hidden">
            <Image
              src={LegacyLogo}
              alt="Legacy Knitting logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">Order Approval</h1>
            <p className="text-xs">
              {COMPANY_INFO.name} • {COMPANY_INFO.address.street1} •{" "}
              {COMPANY_INFO.address.city} {COMPANY_INFO.address.state}{" "}
              {COMPANY_INFO.address.zip}
            </p>
          </div>
        </div>

        {/* Numbers / date */}
        <div className="text-right text-sm leading-5 space-y-1">
          <p>
            PO&nbsp;#: <span className="font-semibold">Q-2025-101</span>
          </p>
          <p className="font-semibold">
            Approval&nbsp;#: <span className="font-bold">BBN2351D458</span>
          </p>
          <p>Issue&nbsp;Date: 20 / 07 / 2024</p>
        </div>
      </div>

      {/* Quote Content */}
      <QuoteApprovalContent />
    </div>
  );
};

export default TopBanner;
