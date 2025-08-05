import * as React from "react";

import Sidebar from "@/app/(protected)/Sidebar";
import DynamicShippingNavbar from "@/components/widgets/navbar/DynamicShippingNavbar";

export default function CRMShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <DynamicShippingNavbar />
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
