"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_INVENTORY_FACTORIES, TITLE_INVENTORY_FACTORIES_ADD, TITLE_INVENTORY_FACTORIES_DETAILS } from "@/constants/navbarTitle";

const DynamicFactoriesNavbar = () => {
  const pathname = usePathname();
  
  // Get the current route relative to /production/factories
  const factoriesPath = pathname.replace('/production/factories', '') || '/';
  
  // Determine title based on the path
  const getTitle = () => {
    if (factoriesPath === '/') {
      return TITLE_INVENTORY_FACTORIES;
    } else if (factoriesPath === '/add') {
      return TITLE_INVENTORY_FACTORIES_ADD;
    } else if (factoriesPath.startsWith('/') && factoriesPath.length > 1) {
      return TITLE_INVENTORY_FACTORIES_DETAILS;
    } else {
      return TITLE_INVENTORY_FACTORIES;
    }
  };

  return <Navbar title={getTitle()} path={factoriesPath} />;
};

export default DynamicFactoriesNavbar; 
