"use client";

import { DollarSign, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { readSession } from "@/lib/auth-session";

type Expense = { id: string; title: string; category: string; amount: number; date: string; method: string; notes: string };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  useEffect(() => {
    const companySlug = readSession()?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!companySlug) return;
    fetch(`/api/expenses?companySlug=${encodeURIComponent(companySlug)}`).then((response) => response.ok ? response.json() : []).then(setExpenses).catch(() => setExpenses([]));
  }, []);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-3xl font-semibold text-white">Expenses</h1><p className="mt-2 text-sm text-slate-400">Record operating costs so profit reporting reflects the real business.</p></div>
        <ActionDialogButton label="Add expense" title="Add expense" description="Record a business expense for the current workspace." submitLabel="Save expense" fields={[
          { label: "Title", name: "title", placeholder: "Vinyl materials" },
          { label: "Category", name: "category", type: "select", options: ["RENT", "ELECTRICITY", "INTERNET", "MATERIALS", "TRANSPORT", "SALARIES", "FREELANCERS", "MACHINE_MAINTENANCE", "MARKETING", "OFFICE_EXPENSES", "OTHER"] },
          { label: "Amount", name: "amount", type: "number", placeholder: "50000" },
          { label: "Date", name: "date", type: "date" },
          { label: "Payment method", name: "method", type: "select", options: ["CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER"] },
          { label: "Notes", name: "notes", type: "textarea" },
        ]} onSubmit={async (formData) => {
          const companySlug = readSession()?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const response = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(formData.entries()), companySlug }) });
          if (!response.ok) throw new Error("Unable to save expense");
          window.location.reload();
        }}><Plus className="h-4 w-4" /></ActionDialogButton>
      </div>
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4"><div className="flex items-center gap-2 text-sm text-slate-400"><DollarSign className="h-4 w-4 text-amber-300" />Recorded expenses</div><div className="mt-3 text-3xl font-semibold text-white">TSh {total.toLocaleString()}</div></section>
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-slate-400"><tr>{["Title", "Category", "Amount", "Date", "Method"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id} className="border-t border-slate-800"><td className="px-4 py-3 text-white">{expense.title}</td><td className="px-4 py-3">{expense.category}</td><td className="px-4 py-3">TSh {expense.amount.toLocaleString()}</td><td className="px-4 py-3">{expense.date}</td><td className="px-4 py-3">{expense.method}</td></tr>)}</tbody></table></div></section>
    </div>
  );
}