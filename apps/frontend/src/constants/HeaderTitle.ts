// src/constants/routes.ts

export const headerTitle = {
  crmCustomers: {
    list: {
      href: "/crm/customers",
      title: "Customers",
    },
    add: {
      href: "/crm/customers/add",
      title: "Add New Customer",
    },
    edit: {
      href: "/crm/customers/:id/edit",
      title: "Edit Customer",
    },
    detail: {
      href: "/crm/customers/:id",
      title: "Customer Details",
    },
  },
  inventory: {
    products: {
      list: {
        href: "/inventory/products",
        title: "Products",
      },
      add: {
        href: "/inventory/products/add",
        title: "Add New Product",
      },
      edit: {
        href: "/inventory/products/:id/edit",
        title: "Edit Product",
      },
      details: {
        href: "/inventory/products/:id/[id]",
        title: "Product Details",
      },
      detail: {
        href: "/inventory/products/:id",
        title: "Product Details",
      },
    },
  },
  production: {
    products: {
      list: {
        title: "Products",
        href: "/production/products",
      },
      add: {
        title: "Add Product",
        href: "/production/products/add",
      },
      edit: {
        title: "Edit Product",
        href: "/production/products/:id/edit",
      },
      details: {
        title: "Product Details",
        href: "/production/products/:id/[id]",
      },
      delete: {
        title: "Delete Product",
        href: "/production/products/:id",
      },
    },
  },
} as const;

export type Routes = typeof headerTitle;
