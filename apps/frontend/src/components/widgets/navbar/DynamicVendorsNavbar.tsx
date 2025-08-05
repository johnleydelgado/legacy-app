"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_INVENTORY_VENDORS, TITLE_INVENTORY_VENDORS_ADD, TITLE_INVENTORY_VENDORS_DETAILS } from "@/constants/navbarTitle";

const DynamicVendorsNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /production/vendors
  const vendorsPath = pathname.replace('/production/vendors', '') || '/';
  
  // Determine title based on the path
  const getTitle = () => {
    if (vendorsPath === '/') {
      return TITLE_INVENTORY_VENDORS;
    } else if (vendorsPath === '/add') {
      return TITLE_INVENTORY_VENDORS_ADD;
    } else if (vendorsPath.startsWith('/') && vendorsPath.length > 1) {
      return TITLE_INVENTORY_VENDORS_DETAILS;
    } else {
      return TITLE_INVENTORY_VENDORS;
    }
  };

  return <Navbar title={getTitle()} path={vendorsPath} />;
};

export default DynamicVendorsNavbar; 
