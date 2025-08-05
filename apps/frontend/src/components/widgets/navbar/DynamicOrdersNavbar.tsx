"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/widgets/navbar";
import { TITLE_CRM_ORDERS, TITLE_CRM_ORDERS_ADD, TITLE_CRM_ORDERS_DETAILS } from "@/constants/navbarTitle";

const DynamicOrdersNavbar = () => {
  const pathname = usePathname();
  const ordersPath = pathname.replace('/crm/orders', '') || '/';
  
  const getTitle = () => {
    if (ordersPath === '/') {
      return TITLE_CRM_ORDERS;
    } else if (ordersPath === '/add') {
      return TITLE_CRM_ORDERS_ADD;  
    } else if (ordersPath.startsWith('/') && ordersPath.length > 1) {
      return TITLE_CRM_ORDERS_DETAILS;
    } else {
      return TITLE_CRM_ORDERS;
    }
  };

  return <Navbar title={getTitle()} path={ordersPath} />;
};

export default DynamicOrdersNavbar; 
