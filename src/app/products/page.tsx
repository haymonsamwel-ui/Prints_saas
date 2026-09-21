"use client";

import { Boxes, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { RecordActions } from "@/components/ui/record-actions";
import { readSession } from "@/lib/auth-session";

type ProductRecord = { id: string; name: string; category: string; unit: string; sellingPrice: string; costPrice: string; margin: string; status: string };

const productFields = [
  { label: "Name", name: "name" },
  { label: "Category", name: "category" },
  { label: "Unit", name: "unit" },
  { label: "Selling price", name: "sellingPrice" },
  { label: "Cost price", name: "costPrice" },
  { label: "Margin", name: "margin" },
  { label: "Status", name: "status", type: "select", options: ["Active", "Inactive", "Draft"] },
] as const;

export default function ProductsPage() {
  const [productRecords, setProductRecords] = useState<ProductRecord[]>([]);
  const [query, setQuery] = useState("");

  async function loadProducts() {
    const session = readSession();
    const companySlug = session?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!companySlug) return;
    const response = await fetch(`/api/products?companySlug=${encodeURIComponent(companySlug)}`);
    if (!response.ok) return;
    const records = await response.json();
    setProductRecords(records.map((product: { id: string; name: string; unit: string; sellingPrice: number; costPrice: number | null; isActive: boolean; category: { name: string } | null }) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name ?? "Uncategorized",
      unit: product.unit,
      sellingPrice: `TSh ${product.sellingPrice.toLocaleString()}`,
      costPrice: `TSh ${(product.costPrice ?? 0).toLocaleString()}`,
      margin: product.sellingPrice > 0 ? `${Math.round(((product.sellingPrice - (product.costPrice ?? 0)) / product.sellingPrice) * 100)}%` : "0%",
      status: product.isActive ? "Active" : "Inactive",
    })));
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const visibleProducts = productRecords.filter((item) => `${item.name} ${item.category} ${item.unit}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Products and services</h1>
            <p className="mt-2 text-sm text-slate-400">Maintain sellable services, units, pricing, and margin visibility.</p>
          </div>
          <ActionDialogButton
            label="Add item"
            title="Add product or service"
            description="Add pricing and cost details used by quotations, orders, and profit reports."
            submitLabel="Save item"
            fields={[
              { label: "Name", name: "name", placeholder: "Flex banner" },
              { label: "Category", name: "category", placeholder: "Large format" },
              { label: "Unit", name: "unit", placeholder: "Sqm" },
              { label: "Selling price", name: "sellingPrice", type: "number", placeholder: "18000" },
              { label: "Cost price", name: "costPrice", type: "number", placeholder: "10500" },
              { label: "Description", name: "description", type: "textarea", placeholder: "Production notes or default quote text" },
            ]}
            onSubmit={async (formData) => {
              await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(formData.entries())),
              });
              await loadProducts();
            }}
          >
            <Plus className="h-4 w-4" />
          </ActionDialogButton>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Active items", productRecords.filter((item) => item.status === "Active").length.toString()],
            ["Average margin", productRecords.length ? `${Math.round(productRecords.reduce((sum, item) => sum + Number(item.margin.replace("%", "")), 0) / productRecords.length)}%` : "0%"],
            ["Categories", new Set(productRecords.map((item) => item.category)).size.toString()],
            ["Catalog items", productRecords.length.toString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Boxes className="h-4 w-4 text-amber-300" />
                {label}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-slate-400 md:w-96">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search catalog items" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {visibleProducts.map((item) => (
              <article key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{item.category} / {item.unit}</div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{item.status}</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500">Selling</div>
                    <div className="mt-1 font-medium text-white">{item.sellingPrice}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Cost</div>
                    <div className="mt-1 font-medium text-white">{item.costPrice}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Margin</div>
                    <div className="mt-1 font-medium text-emerald-300">{item.margin}</div>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <RecordActions
                    record={item}
                    title={item.name}
                    fields={productFields}
                    onSave={async (updatedItem) => {
                      const response = await fetch("/api/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...updatedItem, id: item.id }) });
                      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "Unable to update product");
                      await loadProducts();
                    }}
                    onDelete={async () => {
                      const response = await fetch(`/api/products?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
                      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "Unable to delete product");
                      await loadProducts();
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
    </div>
  );
}
