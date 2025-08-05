"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_CRM_QUOTES, TITLE_CRM_QUOTES_ADD, TITLE_CRM_QUOTES_DETAILS } from "@/constants/navbarTitle";

const DynamicQuotesNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /crm/quotes
  const quotesPath = pathname.replace('/crm/quotes', '') || '/';
  
  // Determine title based on the path
  const getTitle = () => {
    if (quotesPath === '/') {
      return TITLE_CRM_QUOTES;
    } else if (quotesPath === '/add') {
      return TITLE_CRM_QUOTES_ADD;
    } else if (quotesPath.startsWith('/') && quotesPath.length > 1) {
      return TITLE_CRM_QUOTES_DETAILS;
    } else {
      return TITLE_CRM_QUOTES;
    }
  };

  return <Navbar title={getTitle()} path={quotesPath} />;
};

export default DynamicQuotesNavbar; 
