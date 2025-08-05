"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_CRM_SHIPPING, TITLE_CRM_SHIPPING_ADD, TITLE_CRM_SHIPPING_DETAILS } from "@/constants/navbarTitle";

const DynamicShippingNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /crm/shipping
  const shippingPath = pathname.replace('/crm/shipping', '') || '/';
  
  // Determine title based on the path
  const getTitle = () => {
    if (shippingPath === '/') {
      return TITLE_CRM_SHIPPING;
    } else if (shippingPath === '/add') {
      return TITLE_CRM_SHIPPING_ADD;
    } else if (shippingPath.startsWith('/') && shippingPath.length > 1) {
      return TITLE_CRM_SHIPPING_DETAILS;
    } else {
      return TITLE_CRM_SHIPPING;
    }
  };

  return <Navbar title={getTitle()} path={shippingPath} />;
};

export default DynamicShippingNavbar; 
