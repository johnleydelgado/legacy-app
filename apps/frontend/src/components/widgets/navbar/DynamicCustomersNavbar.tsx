"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_CRM_CUSTOMERS, TITLE_CRM_CUSTOMERS_ADD, TITLE_CRM_CUSTOMERS_DETAILS } from "@/constants/navbarTitle";

const DynamicCustomersNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /crm/customers
  const customersPath = pathname.replace('/crm/customers', '') || '/';
  
  // Determine title based on the path
  const getTitle = () => {
    if (customersPath === '/') {
      return TITLE_CRM_CUSTOMERS;
    } else if (customersPath === '/add') {
      return TITLE_CRM_CUSTOMERS_ADD;
    } else if (customersPath.startsWith('/') && customersPath.length > 1) {
      return TITLE_CRM_CUSTOMERS_DETAILS;
    } else {
      return TITLE_CRM_CUSTOMERS;
    }
  };

  return <Navbar title={getTitle()} path={customersPath} />;
};

export default DynamicCustomersNavbar; 
