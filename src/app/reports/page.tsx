"use client";

import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

type Report = {
  totals: { sales: number; payments: number; expenses: number; estimatedProfit: number; outstanding: number };
  monthly: { month: number; sales: number; payments: number; expenses: number }[];
  topCustomers: { name: string; sales: number }[];
};

const emptyReport: Report = { totals: { sales: 0, payments: 0, expenses: 0, estimatedProfit: 0, outstanding: 0 }, monthly: [], topCustomers: [] };

function money(value: number) {
  return `TSh ${Math.round(value).toLocaleString()}`;
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report>(emptyReport);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to load reports");
      setReport(result);
    }).catch((loadError: Error) => setError(loadError.message));
  }, []);

  const maxSales = Math.max(...report.monthly.map((month) => month.sales), 1);
  const cards = [
    ["Sales", report.totals.sales, DollarSign],
    ["Payments received", report.totals.payments, TrendingUp],
    ["Expenses", report.totals.expenses, BarChart3],
    ["Estimated profit", report.totals.estimatedProfit, TrendingUp],
    ["Outstanding", report.totals.outstanding, DollarSign],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Finance and performance</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Reports</h1>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mt-2 text-sm text-slate-400">Understand revenue, cash received, expenses, profit, and customer value.</p></div><a href="/api/reports?format=csv" className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Export CSV</a></div>
      </div>
      {error ? <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"><div className="flex items-center gap-2 text-sm text-slate-400"><Icon className="h-4 w-4 text-emerald-300" />{label}</div><div className="mt-3 text-2xl font-semibold text-white">{money(value)}</div></div>)}
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><div className="mb-5 flex items-center gap-2 text-slate-200"><BarChart3 className="h-5 w-5 text-cyan-300" />Monthly sales</div><div className="flex h-64 items-end gap-2">{report.monthly.map((month) => <div key={month.month} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-400" style={{ height: `${Math.max((month.sales / maxSales) * 100, month.sales ? 4 : 0)}%` }} /><span className="text-xs text-slate-500">{month.month}</span></div>)}</div></div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><div className="mb-5 flex items-center gap-2 text-slate-200"><Users className="h-5 w-5 text-amber-300" />Top customers</div><div className="space-y-4">{report.topCustomers.length ? report.topCustomers.map((customer) => <div key={customer.name} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-slate-300">{customer.name}</span><span className="shrink-0 text-emerald-300">{money(customer.sales)}</span></div>) : <div className="text-sm text-slate-500">No customer sales yet.</div>}</div></div>
      </section>
    </div>
  );
}
