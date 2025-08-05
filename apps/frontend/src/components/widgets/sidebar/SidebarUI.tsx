"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { navConfig, Section, sectionRoles, sections } from "./navConfig";
import { Role } from "@/utils/acl";
import { canView } from "./utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import LegacyKnittingBrand from "@/assets/images/LegacyKnittingBrand.png";
import {
  Package,
  UserCheck,
  UserCog,
  Menu,
  X,
  Settings,
  CheckCircle,
} from "lucide-react";

interface SidebarProps {
  role: Role;
}

/* icon per collapsible section */
const CollapseIcons: Record<
  Exclude<Section, "main">,
  React.FC<{ className?: string }>
> = {
  admin: UserCog,
  production: Package,
  crm: UserCheck,
  settings: Settings,
};

export default function SidebarUI({ role }: SidebarProps) {
  const pathname = usePathname();

  const [openSec, setOpenSec] = React.useState<Record<Section, boolean>>({
    main: false,
    production: false,
    crm: false,
    admin: false,
    settings: false,
  });

  /** drawer state for small screens */
  const [mobileOpen, setMobileOpen] = React.useState(false);

  /* close drawer on route change */
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ────────── MOBILE TOGGLE FAB ────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full
                   bg-gray-700 text-primary-foreground shadow-lg ring-2 ring-primary/50 transition
                   md:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* dim backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ────────── SIDEBAR ────────── */}
      <aside
        className={cn(
          /* shared */
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r p-4 transition-transform",
          /* desktop */
          "md:static md:translate-x-0 md:z-0",
          /* mobile drawer */
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: '#202223' }}
      >
        {/* logo */}
        <div className="pb-4 mb-4 flex justify-center">
          <div className="relative w-full p-4">
            <Image
              src={LegacyKnittingBrand}
              alt="Legacy Knitting"
              width={256}
              height={80}
              priority
              className="w-full h-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          {/* close button inside drawer (optional UX) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 p-2 md:hidden"
          >
            <X className="h-5 w-5" style={{ color: '#F0EEE8' }} />
          </button>
        </div>

        {/* navigation */}
        <nav className="flex-1 space-y-2 overflow-auto">
          {sections.map((section) => {
            if (!canView(sectionRoles[section], role)) return null;
            const items = navConfig.filter(
              (i) => i.section === section && canView(i.roles, role)
            );
            if (items.length === 0) return null;

            /* MAIN ─ no collapsible wrapper */
            if (section === "main") {
              return (
                <React.Fragment key="main">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 text-sm font-normal transition-all border-l-3 border-transparent",
                        "rounded-r-lg margin-0 mb-1 relative",
                        pathname === item.href
                          ? "font-medium border-l-[#67A3F0] text-white"
                          : "hover:bg-white/5 hover:text-white"
                      )}
                      style={{
                        color: pathname === item.href ? '#FFFFFF' : '#F0EEE8',
                        backgroundColor: pathname === item.href ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        borderLeftColor: pathname === item.href ? '#67A3F0' : 'transparent',
                        borderLeftWidth: '3px'
                      }}
                    >
                      <span style={{ color: pathname === item.href ? '#67A3F0' : '#F0EEE8', width: '16px', height: '16px', flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </React.Fragment>
              );
            }

            /* COLLAPSIBLE SECTIONS */
            const isActive = pathname.startsWith(`/${section}`);
            const isOpen = openSec[section] || isActive;
            const Icon =
              CollapseIcons[section as Exclude<Section, "main">] ?? UserCog;

            return (
              <Collapsible
                key={section}
                open={isOpen}
                onOpenChange={(v) =>
                  setOpenSec((s) => ({ ...s, [section]: v }))
                }
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full justify-between items-center px-2 py-2 text-sm font-normal transition-all rounded-r-lg mb-1"
                    style={{
                      color: '#F0EEE8',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#FFFFFF';
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) icon.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#F0EEE8';
                      const icon = e.currentTarget.querySelector('svg');
                      if (icon) icon.style.color = '#F0EEE8';
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0 text-[#F0EEE8]" />
                      <span className="uppercase">{section}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: '#F0EEE8' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="CollapsibleContent">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 text-sm font-normal transition-all border-l-3 border-transparent",
                        "rounded-r-lg margin-0 mb-1 relative text-xs",
                        pathname === item.href
                          ? "font-medium border-l-[#67A3F0] text-white"
                          : "hover:bg-white/5 hover:text-white"
                      )}
                      style={{
                        paddingLeft: '40px',
                        fontSize: '12px',
                        color: pathname === item.href ? '#FFFFFF' : '#F0EEE8',
                        backgroundColor: pathname === item.href ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        borderLeftColor: pathname === item.href ? '#67A3F0' : 'transparent',
                        borderLeftWidth: '3px'
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
