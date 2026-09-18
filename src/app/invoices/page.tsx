"use client";

import { CreditCard, FileCheck2, FileText } from "lucide-react";
import { useState } from "react";
import { RecordActions } from "@/components/ui/record-actions";
import { invoices } from "@/lib/constants";
import { useStudioProfile } from "@/lib/studio-profile";

type InvoiceRecord = (typeof invoices)[number];

const invoiceFields = [
  { label: "Invoice", name: "number" },
  { label: "Customer", name: "customer" },
  { label: "Order", name: "order" },
  { label: "Issue date", name: "issueDate" },
  { label: "Total", name: "total" },
  { label: "Paid", name: "paid" },
  { label: "Balance", name: "balance" },
  { label: "Status", name: "status", type: "select", options: ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "VOID"] },
] as const;

export default function InvoicesPage() {
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([...invoices]);
  const studioProfile = useStudioProfile();

  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h1 className="mt-2 text-3xl font-semibold text-white">Invoices and balances</h1>
          <p className="mt-2 text-sm text-slate-400">Generate invoices, monitor paid amounts, and keep customer balances visible.</p>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Issued invoices", invoiceRecords.length.toString(), FileText],
            ["Paid invoices", invoiceRecords.filter((invoice) => invoice.status === "PAID").length.toString(), FileCheck2],
            ["Open balances", invoiceRecords.filter((invoice) => invoice.balance !== "TSh 0").length.toString(), CreditCard],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="h-4 w-4 text-emerald-300" />
                {label as string}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{value as string}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {invoiceRecords.map((invoice) => (
            <article key={invoice.number} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-800 pb-4">
                {studioProfile.logoDataUrl ? (
                  <img
                    src={studioProfile.logoDataUrl}
                    alt={`${studioProfile.name} logo`}
                    className="h-11 w-11 rounded-lg border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 font-bold text-emerald-300">
                    {studioProfile.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{studioProfile.name}</div>
                  <div className="truncate text-xs text-slate-500">{studioProfile.email}</div>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">{invoice.number}</div>
                  <div className="mt-1 text-sm text-slate-400">{invoice.customer}</div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{invoice.status}</span>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Order</span><span>{invoice.order}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Issued</span><span>{invoice.issueDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total</span><span>{invoice.total}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Paid</span><span>{invoice.paid}</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-3 font-semibold text-amber-300">
                  <span>Balance</span>
                  <span>{invoice.balance}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                <RecordActions
                  record={invoice}
                  title={invoice.number}
                  fields={invoiceFields}
                  onSave={(updatedInvoice) =>
                    setInvoiceRecords((current) =>
                      current.map((item) => (item.number === invoice.number ? updatedInvoice : item)),
                    )
                  }
                  onDelete={() => setInvoiceRecords((current) => current.filter((item) => item.number !== invoice.number))}
                />
              </div>
            </article>
          ))}
        </section>
    </div>
  );
}
