"use client";

import { ClipboardList, Factory, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { RecordActions } from "@/components/ui/record-actions";
import { readSession } from "@/lib/auth-session";
import { customers, quotations } from "@/lib/constants";

type OrderRecord = { number: string; customer: string; source: string; dueDate: string; total: string; paid: string; balance: string; status: string };

const orderFields = [
  { label: "Order", name: "number" },
  { label: "Customer", name: "customer", type: "select", options: customers.map((customer) => customer.name) },
  { label: "Source", name: "source", type: "select", options: ["Direct order", ...quotations.map((quote) => quote.number)] },
  { label: "Due date", name: "dueDate" },
  { label: "Total", name: "total" },
  { label: "Paid", name: "paid" },
  { label: "Balance", name: "balance" },
  { label: "Status", name: "status", type: "select", options: ["CONFIRMED", "IN_PRODUCTION", "READY", "DELIVERED", "CANCELLED"] },
] as const;

export default function OrdersPage() {
  const [orderRecords, setOrderRecords] = useState<OrderRecord[]>([]);
  useEffect(() => {
    const slug = readSession()?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!slug) return;
    fetch(`/api/orders?companySlug=${encodeURIComponent(slug)}`).then((response) => response.ok ? response.json() : []).then(setOrderRecords).catch(() => setOrderRecords([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Order management</h1>
            <p className="mt-2 text-sm text-slate-400">Convert accepted quotations into orders and track the status from confirmation to delivery.</p>
          </div>
          <ActionDialogButton
            label="New order"
            title="New order"
            description="Create an order from an accepted quotation or start a direct customer order."
            submitLabel="Create order"
            fields={[
              { label: "Customer", name: "customer", type: "customer", options: customers.map((customer) => customer.name) },
              { label: "Source quotation", name: "source", type: "select", options: ["Direct order", ...quotations.map((quote) => quote.number)] },
              { label: "Due date", name: "dueDate", type: "date" },
              { label: "Product/service", name: "item", placeholder: "Vehicle branding" },
              { label: "Total", name: "total", type: "number", placeholder: "1820000" },
              { label: "Deposit paid", name: "paid", type: "number", placeholder: "900000" },
              { label: "Production notes", name: "notes", type: "textarea", placeholder: "Artwork status, delivery details, or finishing notes" },
            ]}
          >
            <Plus className="h-4 w-4" />
          </ActionDialogButton>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Confirmed", orderRecords.filter((order) => order.status === "CONFIRMED").length.toString(), ClipboardList],
            ["In production", orderRecords.filter((order) => order.status === "IN_PRODUCTION").length.toString(), Factory],
            ["Ready", orderRecords.filter((order) => order.status === "READY").length.toString(), Truck],
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

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderRecords.map((order) => (
                  <tr key={order.number} className="border-t border-slate-800 bg-slate-900/40">
                    <td className="px-4 py-3 text-white">{order.number}</td>
                    <td className="px-4 py-3 text-slate-300">{order.customer}</td>
                    <td className="px-4 py-3 text-slate-300">{order.source}</td>
                    <td className="px-4 py-3 text-slate-300">{order.dueDate}</td>
                    <td className="px-4 py-3 text-slate-300">{order.balance}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <RecordActions
                        record={order}
                        title={order.number}
                        fields={orderFields}
                        onSave={(updatedOrder) =>
                          setOrderRecords((current) =>
                            current.map((item) => (item.number === order.number ? updatedOrder : item)),
                          )
                        }
                        onDelete={() => setOrderRecords((current) => current.filter((item) => item.number !== order.number))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  );
}
