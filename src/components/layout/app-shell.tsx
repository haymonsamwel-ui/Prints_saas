"use client";

import {
  Building2,
  ClipboardList,
  CreditCard,
  Truck,
  DollarSign,
  Bell,
  BarChart3,
  History,
  FileText,
  Home,
  Package,
  Factory,
  ReceiptText,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { canAccessPath, readSession, type AppRole } from "@/lib/auth-session";
import { useStudioProfile } from "@/lib/studio-profile";

const navItems: { label: string; href: string; icon: LucideIcon; roles: AppRole[] }[] = [
  { label: "Overview", href: "/", icon: Home, roles: ["ADMIN", "MANAGER", "SALES", "DESIGNER", "PRODUCTION", "FINANCE", "DELIVERY"] },
  { label: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "MANAGER", "SALES"] },
  { label: "Products", href: "/products", icon: Package, roles: ["ADMIN", "MANAGER", "SALES"] },
  { label: "Company", href: "/company", icon: Building2, roles: ["ADMIN", "MANAGER"] },
  { label: "Quotations", href: "/quotations", icon: FileText, roles: ["ADMIN", "MANAGER", "SALES"] },
  { label: "Orders", href: "/orders", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "SALES", "DELIVERY"] },
  { label: "Production", href: "/production", icon: Factory, roles: ["ADMIN", "MANAGER", "DESIGNER", "PRODUCTION", "DELIVERY"] },
  { label: "Inventory", href: "/inventory", icon: Warehouse, roles: ["ADMIN", "MANAGER", "PRODUCTION"] },
  { label: "Invoices", href: "/invoices", icon: ReceiptText, roles: ["ADMIN", "MANAGER", "SALES", "FINANCE"] },
  { label: "Payments", href: "/payments", icon: CreditCard, roles: ["ADMIN", "MANAGER", "SALES", "FINANCE"] },
  { label: "Deliveries", href: "/deliveries", icon: Truck, roles: ["ADMIN", "MANAGER", "DELIVERY"] },
  { label: "Expenses", href: "/expenses", icon: DollarSign, roles: ["ADMIN", "MANAGER", "FINANCE"] },
  { label: "Notifications", href: "/notifications", icon: Bell, roles: ["ADMIN", "MANAGER", "SALES", "DESIGNER", "PRODUCTION", "FINANCE", "DELIVERY"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER", "FINANCE"] },
  { label: "Suppliers", href: "/suppliers", icon: Truck, roles: ["ADMIN", "MANAGER", "FINANCE", "PRODUCTION"] },
  { label: "Audit log", href: "/audit-logs", icon: History, roles: ["ADMIN", "MANAGER"] },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const studioProfile = useStudioProfile();
  const session = readSession();
  const role = session?.role as AppRole | undefined;
  const visibleNavItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)));
  const studioInitial = studioProfile.name.trim().charAt(0).toUpperCase() || "B";

  if (pathname.startsWith("/quote/")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1500px] gap-6 p-4 lg:p-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:block">
          <Link href="/" className="mb-8 flex items-center gap-3">
            {studioProfile.logoDataUrl ? (
              <img
                src={studioProfile.logoDataUrl}
                alt={`${studioProfile.name} logo`}
                className="h-10 w-10 rounded-xl border border-slate-800 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-lg font-bold text-emerald-300">
                {studioInitial}
              </div>
            )}
            <div>
              <div className="text-lg font-semibold">{studioProfile.name}</div>
              <div className="text-xs text-slate-400">Creative Business OS</div>
            </div>
          </Link>

          <nav className="space-y-2">
            {visibleNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 mb-4 border-b border-slate-800 bg-slate-950/95 pb-3 pt-1 backdrop-blur lg:hidden">
            <Link href="/" className="mb-3 flex items-center gap-3">
              {studioProfile.logoDataUrl ? (
                <img
                  src={studioProfile.logoDataUrl}
                  alt={`${studioProfile.name} logo`}
                  className="h-9 w-9 rounded-xl border border-slate-800 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 font-bold text-emerald-300">
                  {studioInitial}
                </div>
              )}
              <div>
                <div className="font-semibold text-white">{studioProfile.name}</div>
                <div className="text-xs text-slate-400">Creative Business OS</div>
              </div>
            </Link>
            <nav className="flex gap-2 overflow-x-auto pb-1">
              {visibleNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs transition ${
                      active
                        ? "bg-emerald-500 text-slate-950"
                        : "border border-slate-800 bg-slate-900/80 text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
