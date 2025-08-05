"use client";

import * as React from "react";
import { Customer as CustomerTypes } from "@/services/quotes/types";
import Customers from "./customers";
import Factory from "./factory";

// Factory type interface (based on backend entity)
interface FactoryTypes {
  pk_factories_id: number;
  name: string;
  email?: string;
  website_url?: string;
  industry?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  user_owner: string;
  // Additional fields for better display
  service_category?: string;
  location?: string;
  factory_type?: string;
  contact_person?: {
    name: string;
    phone: string;
    email: string;
  };
  billing_address?: {
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface CustomerFactoryInfoProps {
  // Customer props
  customerData: CustomerTypes | null;
  customerID: number;
  setCustomerID: React.Dispatch<React.SetStateAction<number>>;
  customerLoading?: boolean;
  setCustomerChange?: (tick: boolean) => void;
  
  // Factory props  
  factoryData: FactoryTypes | null;
  factoryID: number;
  setFactoryID: React.Dispatch<React.SetStateAction<number>>;
  factoryLoading?: boolean;
  setFactoryChange?: (tick: boolean) => void;
  
  // Common props
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerFactoryInfo = ({
  customerData,
  customerID,
  setCustomerID,
  customerLoading,
  setCustomerChange,
  factoryData,
  factoryID,
  setFactoryID,
  factoryLoading,
  setFactoryChange,
  setModifyFlag,
}: CustomerFactoryInfoProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Customer and Factory Information - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information Section */}
        <div>
          <Customers
            data={customerData}
            customerID={customerID}
            setCustomerID={setCustomerID}
            setModifyFlag={setModifyFlag}
            customerLoading={customerLoading}
            setCustomerChange={setCustomerChange}
          />
        </div>
        
        {/* Factory Information Section */}
        <div>
          <Factory
            factoryData={factoryData}
            factoryID={factoryID}
            setFactoryID={setFactoryID}
            setModifyFlag={setModifyFlag}
            factoryLoading={factoryLoading}
            setFactoryChange={setFactoryChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerFactoryInfo;
export type { FactoryTypes };