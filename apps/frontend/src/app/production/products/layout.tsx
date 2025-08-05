import * as React from "react";

import Sidebar from "@/app/(protected)/Sidebar";
import Navbar from "../../../components/widgets/navbar";
import { TITLE_INVENTORY_PRODUCTS } from "../../../constants/navbarTitle";

export default function InventoryProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1  min-w-0">
          <Navbar title={TITLE_INVENTORY_PRODUCTS} />
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
