"use client";

import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Factory,
  FileText,
  PackageSearch,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DateFilterControls } from "@/components/dashboard/date-filter-controls";
import { readSession } from "@/lib/auth-session";

type DashboardData = {
  dashboardMetrics: { label: string; value: string; change: string }[];
  salesSeries: number[];
  expenseSeries: number[];
  productionStatus: { status: string; count: number }[];
  topProducts: { name: string; sales: string }[];
  recentOrders: { order: string; customer: string; total: string; status: string }[];
  lowStockItems: { item: string; stock: number; minimum: number }[];
  customerPipeline: { name: string; value: number; color: string }[];
};

const emptyDashboardData: DashboardData = {
  dashboardMetrics: [],
  salesSeries: Array(12).fill(0),
  expenseSeries: Array(12).fill(0),
  productionStatus: [],
  topProducts: [],
  recentOrders: [],
  lowStockItems: [],
  customerPipeline: [],
};

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-950/20">
      <div className="mb-3 flex items-center justify-between text-slate-400">
        <span className="text-sm">{label}</span>
        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-emerald-300">{change}</div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);

  useEffect(() => {
    const session = readSession();
    const companySlug = session?.companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!companySlug) return;

    fetch(`/api/dashboard?companySlug=${encodeURIComponent(companySlug)}`)
      .then((response) => response.ok ? response.json() : emptyDashboardData)
      .then(setData)
      .catch(() => setData(emptyDashboardData));
  }, []);

  const {
    dashboardMetrics,
    expenseSeries,
    lowStockItems,
    productionStatus,
    recentOrders,
    salesSeries,
    topProducts,
    customerPipeline,
  } = data;

  return (
    <>
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Operations dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Creative business overview</h1>
            </div>
            <DateFilterControls />
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {dashboardMetrics.map((metric) => (
              <StatCard key={metric.label} label={metric.label} value={metric.value} change={metric.change} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                  Sales performance
                </div>
                <span className="text-xs text-slate-400">Jan - Dec 2026</span>
              </div>

              <div className="flex h-64 items-end gap-2">
                {salesSeries.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-cyan-400"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-[10px] text-slate-500">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <BarChart3 className="h-5 w-5 text-cyan-300" />
                Production status
              </div>
              <div className="space-y-4">
                {productionStatus.map((item) => (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                      <span>{item.status}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        style={{ width: `${(item.count / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <FileText className="h-5 w-5 text-violet-300" />
                Invoices & payments
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-sm text-slate-400">Pending payments</div>
                  <div className="mt-2 text-3xl font-semibold text-white">TSh 6.7M</div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-amber-300">
                    <CreditCard className="h-4 w-4" />
                    12 customers due this week
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-sm text-slate-400">Outstanding balances</div>
                  <div className="mt-2 text-3xl font-semibold text-white">TSh 11.3M</div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
                    <PackageSearch className="h-4 w-4" />
                    5 balances under review
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Boxes className="h-5 w-5 text-amber-300" />
                Top products/services
              </div>
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                      <span>{index + 1}. {item.name}</span>
                      <span>{item.sales}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                        style={{ width: `${(index + 1) * 22}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <ClipboardList className="h-5 w-5 text-blue-300" />
                  Recent orders
                </div>
                <Link href="/orders" className="text-sm text-emerald-300 transition hover:text-emerald-200">
                  View all
                </Link>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.order} className="border-t border-slate-800 bg-slate-900/40">
                        <td className="px-4 py-3 text-white">{order.order}</td>
                        <td className="px-4 py-3 text-slate-300">{order.customer}</td>
                        <td className="px-4 py-3 text-slate-300">{order.total}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Factory className="h-5 w-5 text-rose-300" />
                Expense trend
              </div>

              <div className="flex h-48 items-end gap-2">
                {expenseSeries.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-rose-500 to-orange-400"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-[10px] text-slate-500">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Users className="h-5 w-5 text-cyan-300" />
                Customer pipeline
              </div>
              <div className="space-y-3">
                {customerPipeline.map((item) => (
                  <div key={item.name}>
                    <div className="mb-1 flex justify-between text-sm text-slate-300">
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-200">
                <Warehouse className="h-5 w-5 text-amber-300" />
                Low stock alerts
              </div>
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.item} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                    <div>
                      <div className="font-medium text-white">{item.item}</div>
                      <div className="text-xs text-slate-400">Min stock {item.minimum}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-amber-300">{item.stock}</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
    </>
  );
}
