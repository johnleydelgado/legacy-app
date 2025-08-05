"use client";

// app/crm/customers/add/page.tsx
import { BackHeader } from "@/components/ui/back-header";
import { CustomerFormUI } from "@/components/forms/customer/customer-form";
import { emptyCustomer } from "@/lib/initialData";
import { headerTitle } from "@/constants/HeaderTitle";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCustomerMutations } from "@/hooks/useCustomers";
import type { CreateCustomerDto } from "@/services/customers/types";
import CustomerAdd from "@/components/pages/crm/customers/add";
import { de } from "date-fns/locale";

const AddCustomerPage = () => <CustomerAdd />;

export default AddCustomerPage;
