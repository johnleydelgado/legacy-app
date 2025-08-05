"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_CRM_INVOICES, TITLE_CRM_INVOICES_ADD, TITLE_CRM_INVOICES_DETAILS, TITLE_CRM_QUOTES, TITLE_CRM_QUOTES_ADD, TITLE_CRM_QUOTES_DETAILS } from "@/constants/navbarTitle";

const DynamicInvoicesNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /crm/quotes
  const invoicesPath = pathname.replace('/crm/invoices', '') || '/';
  
  // Determine title based on the path
  const getTitle = () => {
    if (invoicesPath === '/') {
      return TITLE_CRM_INVOICES;
    } else if (invoicesPath === '/add') {
      return TITLE_CRM_INVOICES_ADD;
    } else if (invoicesPath.startsWith('/') && invoicesPath.length > 1) {
      return TITLE_CRM_INVOICES_DETAILS;
    } else {
      return TITLE_CRM_INVOICES;
    }
  };

  return <Navbar title={getTitle()} path={invoicesPath} />;
};

export default DynamicInvoicesNavbar; 
