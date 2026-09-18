"use client";

import { AlertTriangle, Boxes, PackagePlus, Search } from "lucide-react";
import { useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { inventoryItems } from "@/lib/constants";

export default function InventoryPage() {
  const [items, setItems] = useState([...inventoryItems]);
  const [query, setQuery] = useState("");
  const visibleItems = items.filter((item) => `${item.item} ${item.sku} ${item.supplier}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Phase 4 operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Inventory and materials</h1>
          <p className="mt-2 text-sm text-slate-400">Monitor stock levels, suppliers, and production material readiness.</p>
        </div>
        <ActionDialogButton
          label="Stock in"
          title="Record stock movement"
          description="Record incoming, damaged, adjusted, or production-consumed stock."
          submitLabel="Save movement"
          fields={[
            { label: "Item", name: "item", placeholder: "Flex vinyl" },
            { label: "Quantity", name: "quantity", type: "number", placeholder: "50" },
            { label: "Movement type", name: "type", type: "select", options: ["STOCK_IN", "STOCK_OUT", "DAMAGED", "ADJUSTMENT", "PRODUCTION_USAGE"] },
            { label: "Notes", name: "notes", type: "textarea", placeholder: "Supplier, order, or production reference" },
          ]}
        >
          <PackagePlus className="h-4 w-4" />
        </ActionDialogButton>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Tracked items", value: items.length.toString(), Icon: Boxes },
          { label: "Low-stock alerts", value: items.filter((item) => item.status === "Low stock").length.toString(), Icon: AlertTriangle },
          { label: "Healthy stock lines", value: items.filter((item) => item.status === "Healthy").length.toString(), Icon: PackagePlus },
        ].map(({ label, value, Icon }) => (
          <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon className="h-4 w-4 text-amber-300" />
              {label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-slate-400 md:w-96">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items, SKU, or supplier" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">On hand</th>
                <th className="px-4 py-3 font-medium">Minimum</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.sku} className="border-t border-slate-800 bg-slate-900/40">
                  <td className="px-4 py-3 text-white">{item.item}<div className="text-xs text-slate-500">{item.unit}</div></td>
                  <td className="px-4 py-3 text-slate-300">{item.sku}</td>
                  <td className="px-4 py-3 text-slate-300">{item.onHand}</td>
                  <td className="px-4 py-3 text-slate-300">{item.minimum}</td>
                  <td className="px-4 py-3 text-slate-300">{item.supplier}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${item.status === "Healthy" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
