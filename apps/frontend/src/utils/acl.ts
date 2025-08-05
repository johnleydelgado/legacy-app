// utils/acl.ts
export type Role =
  | 'admin'
  | 'production'
  | 'office-admin'
  | 'sales'
  | 'clients'
  | 'employees';

/* ───────── landing page per role ───────── */
export const homeByRole: Record<Role, string> = {
  admin: '/dashboard',
  production: '/dashboard',
  'office-admin': '/dashboard',
  sales: '/dashboard',
  clients: '/dashboard',
  employees: '/dashboard',
};

/* ───────── allow-list per role ───────── */
import {
  PAGE_ADMIN_URL,
  PAGE_ADMIN_ACTIVITY_LOGS_URL,
  PAGE_ADMIN_ANALYTICS_URL,
  PAGE_ADMIN_BACKUPS_URL,
  PAGE_ADMIN_DASHBOARD_URL,
  PAGE_ADMIN_DEPARTMENTS_URL,
  PAGE_ADMIN_INTEGRATIONS_URL,
  PAGE_ADMIN_ROLES_PERMISSION_URL,
  PAGE_ADMIN_SYSTEM_SETTINGS_URL,
  PAGE_ADMIN_USER_MANAGEMENT_URL,
} from '@/constants/pageUrls';

const rx = (p: string) => new RegExp(`^${p}(\\/.*)?$`);

export const allowByRole: Record<Role, RegExp[]> = {
  /* full access */
  admin: [/.*/],
  // administrator: [
  //   rx(PAGE_ADMIN_URL),
  //   rx(PAGE_ADMIN_ACTIVITY_LOGS_URL),
  //   rx(PAGE_ADMIN_ANALYTICS_URL),
  //   rx(PAGE_ADMIN_BACKUPS_URL),
  //   rx(PAGE_ADMIN_DASHBOARD_URL),
  //   rx(PAGE_ADMIN_DEPARTMENTS_URL),
  //   rx(PAGE_ADMIN_INTEGRATIONS_URL),
  //   rx(PAGE_ADMIN_ROLES_PERMISSION_URL),
  //   rx(PAGE_ADMIN_SYSTEM_SETTINGS_URL),
  //   rx(PAGE_ADMIN_USER_MANAGEMENT_URL),
  // ],
  employees: [/.*/],
  /* clients → inventory only (landing page added below) */
  clients: [/.*/],
  /* temporary wide-open rules you can tighten later */
  production: [/.*/],
  'office-admin': [/.*/],
  sales: [/.*/],
};

/* ───────── ensure each role can always see its own landing page ───────── */
Object.entries(homeByRole).forEach(([r, path]) => {
  const role = r as Role;
  const list = allowByRole[role];
  if (list.every((exp) => !exp.test(path))) {
    list.push(rx(path));               // e.g. ^/dashboard(/.*)?$
  }
});
