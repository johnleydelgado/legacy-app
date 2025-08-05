"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_INVENTORY_PURCHASE_ORDERS_ADD, TITLE_INVENTORY_PURCHASE_ORDERS_DETAILS, TITLE_INVENTORY_PURCHASE_ORDERS } from "@/constants/navbarTitle";

const DynamicPurchaseOrdersNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /production/purchase-orders
  const purchaseOrdersPath = pathname.replace('/production/purchase-orders', '') || '/';

  // Determine title based on the path  
  const getTitle = () => {
    if (purchaseOrdersPath === '/') {
      return TITLE_INVENTORY_PURCHASE_ORDERS;
    } else if (purchaseOrdersPath === '/add') {
      return TITLE_INVENTORY_PURCHASE_ORDERS_ADD;
    } else if (purchaseOrdersPath.startsWith('/') && purchaseOrdersPath.length > 1) {
      return TITLE_INVENTORY_PURCHASE_ORDERS_DETAILS;
    } else {
      return TITLE_INVENTORY_PURCHASE_ORDERS;
    }
  };

  return <Navbar title={getTitle()} path={purchaseOrdersPath} />;
};

export default DynamicPurchaseOrdersNavbar; 
