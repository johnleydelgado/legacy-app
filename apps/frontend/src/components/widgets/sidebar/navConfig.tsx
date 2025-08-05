import {
  PAGE_DASHBOARD_URL,
  PAGE_CATEGORY_URL,
  PAGE_SHIPPING_URL,
  PAGE_STOCK_URL,
  PAGE_SUPPLIER_URL,
  PAGE_PRODUCTION_PRODUCTS_URL,
  PAGE_PRODUCTION_SUPPLIERS_URL,
  PAGE_CRM_DASHBOARD_URL,
  PAGE_CRM_CUSTOMERS_URL,
  PAGE_CRM_LEADS_URL,
  PAGE_CRM_OPPORTUNITIES_URL,
  PAGE_CRM_SALES_URL,
  PAGE_CRM_QUOTES_URL,
  PAGE_CRM_ORDERS_URL,
  PAGE_CRM_INVOICES_URL,
  PAGE_CRM_MARKETING_URL,
  PAGE_CRM_REPORTS_URL,
  PAGE_ADMIN_DASHBOARD_URL,
  PAGE_ADMIN_USER_MANAGEMENT_URL,
  PAGE_ADMIN_ROLES_PERMISSION_URL,
  PAGE_ADMIN_DEPARTMENTS_URL,
  PAGE_ADMIN_SYSTEM_SETTINGS_URL,
  PAGE_ADMIN_ACTIVITY_LOGS_URL,
  PAGE_ADMIN_ANALYTICS_URL,
  PAGE_ADMIN_BACKUPS_URL,
  PAGE_ADMIN_INTEGRATIONS_URL,
  PAGE_CRM_PAYMENT_URL,
  PAGE_CRM_ARTWORK_URL,
  PAGE_CRM_SHIPPING_URL,
  PAGE_PRODUCTION_VENDORS_URL,
  PAGE_PRODUCTION_PURCHASE_ORDERS_URL,
  PAGE_PRODUCTION_ORDERS_URL,
  PAGE_EMAIL_NOTIFICATION_URL,
  PAGE_SHIPPING_PRESETS_URL,
  PAGE_PRODUCTION_FACTORIES_URL,
} from "@/constants/pageUrls";

import {
  Home,
  Layers,
  Truck,
  BarChart3,
  Users,
  Package,
  Warehouse,
  ClipboardList,
  ShoppingBag,
  RefreshCw,
  Edit,
  UserCheck,
  LayoutDashboard,
  Shield,
  Building2,
  FileText,
  BarChart2,
  Database,
  Plug,
  Megaphone,
  Receipt,
  ShoppingCart,
  Settings,
  CreditCard,
  Box,
  Paintbrush,
  Store,
  SendToBack,
  Mail,
  Factory,
  Ruler,
  Scale,
} from "lucide-react";

import { Role } from "@/utils/acl";

export type Section = "main" | "crm" | "production" | "admin" | "settings";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[]; // who can see it
  section: Section;
}

export const sections: Section[] = [
  "main",
  "crm",
  "production",
  "admin",
  "settings",
];

export const sectionRoles: Record<Section, Role[]> = {
  main: [], // visible to everyone
  crm: ["admin", "employees"],
  production: ["admin", "employees"], //our group are only these 2 for now
  admin: ["admin"],
  settings: ["admin", "employees"],
};

export const navConfig: NavItem[] = [
  // ── Main
  {
    label: "Dashboard",
    icon: <Home className="h-4 w-4" />,
    href: PAGE_DASHBOARD_URL,
    roles: [
      "admin",
      "production",
      "office-admin",
      "sales",
      "clients",
      "employees",
    ],
    section: "main",
  },
  {
    label: "Analytics",
    icon: <BarChart2 className="h-4 w-4" />,
    href: PAGE_ADMIN_ANALYTICS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "main",
  },
  {
    label: "Reports",
    icon: <FileText className="h-4 w-4" />,
    href: PAGE_CRM_REPORTS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "main",
  },
  // ── Main continued
  // {
  //     label: "Category",
  //     icon: <Layers className="h-4 w-4" />,
  //     href: PAGE_CATEGORY_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "clients", "employees"],
  //     section: "main",
  // },
  // {
  //     label: "Shipping",
  //     icon: <Truck className="h-4 w-4" />,
  //     href: PAGE_SHIPPING_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "clients", "employees"],
  //     section: "main",
  // },
  // {
  //     label: "Stock",
  //     icon: <BarChart3 className="h-4 w-4" />,
  //     href: PAGE_STOCK_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "clients", "employees"],
  //     section: "main",
  // },
  // {
  //     label: "Supplier",
  //     icon: <Users className="h-4 w-4" />,
  //     href: PAGE_SUPPLIER_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "clients", "employees"],
  //     section: "main",
  // },

  // ── Production
  {
    label: "Products",
    icon: <ShoppingBag className="h-4 w-4" />,
    href: PAGE_PRODUCTION_PRODUCTS_URL,
    roles: [
      "admin",
      "production",
      "office-admin",
      "sales",
      "clients",
      "employees",
    ],
    section: "production",
  },
  {
    label: "Purchase Orders",
    icon: <SendToBack className="h-4 w-4" />,
    href: PAGE_PRODUCTION_PURCHASE_ORDERS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "production",
  },
  {
    label: "Production Orders",
    icon: <ClipboardList className="h-4 w-4" />,
    href: PAGE_PRODUCTION_ORDERS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "production",
  },
  {
    label: "Vendors",
    icon: <Store className="h-4 w-4" />,
    href: PAGE_PRODUCTION_VENDORS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "production",
  },
  {
    label: "Factories",
    icon: <Factory className="h-4 w-4" />,
    href: PAGE_PRODUCTION_FACTORIES_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "production",
  },
  // {
  //   label: "Suppliers",
  //   icon: <Users className="h-4 w-4" />,
  //   href: PAGE_PRODUCTION_SUPPLIERS_URL,
  //   roles: ["admin", "production", "office-admin", "sales", "employees"],
  //   section: "production",
  // },

  // ── CRM
  // {
  //     label: "CRM Dashboard",
  //     icon: <LayoutDashboard className="h-4 w-4" />,
  //     href: PAGE_CRM_DASHBOARD_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "employees"],
  //     section: "crm",
  // },
  {
    label: "Customers",
    icon: <Users className="h-4 w-4" />,
    href: PAGE_CRM_CUSTOMERS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },
  {
    label: "Artwork",
    icon: <Paintbrush className="h-4 w-4" />,
    href: PAGE_CRM_ARTWORK_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },
  // {
  //     label: "Leads",
  //     icon: <UserPlus className="h-4 w-4" />,
  //     href: PAGE_CRM_LEADS_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "employees"],
  //     section: "crm",
  // },
  // {
  //     label: "Opportunities",
  //     icon: <Target className="h-4 w-4" />,
  //     href: PAGE_CRM_OPPORTUNITIES_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "employees"],
  //     section: "crm",
  // },
  {
    label: "Quotes",
    icon: <FileText className="h-4 w-4" />,
    href: PAGE_CRM_QUOTES_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },
  {
    label: "Orders",
    icon: <ShoppingCart className="h-4 w-4" />,
    // href: PAGE_CRM_SALES_URL,
    href: PAGE_CRM_ORDERS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },
  {
    label: "Shipping",
    icon: <Truck className="h-4 w-4" />,
    href: PAGE_CRM_SHIPPING_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },
  {
    label: "Invoices",
    icon: <Receipt className="h-4 w-4" />,
    href: PAGE_CRM_INVOICES_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },
  //   {
  //     label: "Purchase Orders",
  //     icon: <ClipboardList className="h-4 w-4" />,
  //     href: PAGE_INVENTORY_ORDERS_URL,
  //     roles: ["admin", "production", "office-admin", "sales", "employees"],
  //     section: "crm",
  //   },
  {
    label: "Payment",
    icon: <CreditCard className="h-4 w-4" />,
    href: PAGE_CRM_PAYMENT_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "crm",
  },

  // ── Admin
  {
    label: "Admin Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: PAGE_ADMIN_DASHBOARD_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "User Management",
    icon: <Users className="h-4 w-4" />,
    href: PAGE_ADMIN_USER_MANAGEMENT_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "Roles & Permissions",
    icon: <Shield className="h-4 w-4" />,
    href: PAGE_ADMIN_ROLES_PERMISSION_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "Departments",
    icon: <Building2 className="h-4 w-4" />,
    href: PAGE_ADMIN_DEPARTMENTS_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "System Settings",
    icon: <Settings className="h-4 w-4" />,
    href: PAGE_ADMIN_SYSTEM_SETTINGS_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "Activity Logs",
    icon: <FileText className="h-4 w-4" />,
    href: PAGE_ADMIN_ACTIVITY_LOGS_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "Analytics",
    icon: <BarChart2 className="h-4 w-4" />,
    href: PAGE_ADMIN_ANALYTICS_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "Backups",
    icon: <Database className="h-4 w-4" />,
    href: PAGE_ADMIN_BACKUPS_URL,
    roles: ["admin"],
    section: "admin",
  },
  {
    label: "Integrations",
    icon: <Plug className="h-4 w-4" />,
    href: PAGE_ADMIN_INTEGRATIONS_URL,
    roles: ["admin"],
    section: "admin",
  },

  // ── Settings
  {
    label: "Email Notification",
    icon: <Mail className="h-4 w-4" />,
    href: PAGE_EMAIL_NOTIFICATION_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "settings",
  },
  {
    label: "Shipping Presets",
    icon: <Package className="h-4 w-4" />,
    href: PAGE_SHIPPING_PRESETS_URL,
    roles: ["admin", "production", "office-admin", "sales", "employees"],
    section: "settings",
  },
];
