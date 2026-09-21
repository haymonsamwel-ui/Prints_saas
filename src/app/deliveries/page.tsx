"use client";

import { Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { readSession } from "@/lib/auth-session";

type Delivery = { id: string; order: string; customer: string; type: string; address: string; driver: string; date: string; status: string };

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  useEffect(() => {
    const companySlug = readSession()?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!companySlug) return;
    fetch(`/api/deliveries?companySlug=${encodeURIComponent(companySlug)}`).then((response) => response.ok ? response.json() : []).then(setDeliveries).catch(() => setDeliveries([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-3xl font-semibold text-white">Delivery and installation</h1><p className="mt-2 text-sm text-slate-400">Schedule handovers, assign drivers, and track completed deliveries.</p></div>
        <ActionDialogButton label="Schedule delivery" title="Schedule delivery" description="Connect a delivery or installation to an existing order." submitLabel="Schedule" fields={[
          { label: "Order number", name: "orderNumber", placeholder: "ORD-1049" },
          { label: "Type", name: "type", type: "select", options: ["CUSTOMER_PICKUP", "DELIVERY", "INSTALLATION"] },
          { label: "Address", name: "address", placeholder: "Delivery or installation address" },
          { label: "Driver or installer", name: "driver" },
          { label: "Date", name: "date", type: "date" },
          { label: "Delivery cost", name: "deliveryCost", type: "number" },
          { label: "Installation cost", name: "installationCost", type: "number" },
          { label: "Notes", name: "notes", type: "textarea" },
        ]} onSubmit={async (formData) => {
          const companySlug = readSession()?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const response = await fetch("/api/deliveries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(formData.entries()), companySlug }) });
          if (!response.ok) throw new Error("Unable to schedule delivery");
          window.location.reload();
        }}><Plus className="h-4 w-4" /></ActionDialogButton>
      </div>
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4"><div className="mb-4 flex items-center gap-2 text-slate-200"><Truck className="h-5 w-5 text-cyan-300" />Delivery schedule</div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-slate-400"><tr>{["Order", "Customer", "Type", "Address", "Assigned", "Date", "Status"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody>{deliveries.map((delivery) => <tr key={delivery.id} className="border-t border-slate-800"><td className="px-4 py-3 text-white">{delivery.order}</td><td className="px-4 py-3">{delivery.customer}</td><td className="px-4 py-3">{delivery.type}</td><td className="px-4 py-3">{delivery.address}</td><td className="px-4 py-3">{delivery.driver}</td><td className="px-4 py-3">{delivery.date}</td><td className="px-4 py-3 text-cyan-300">{delivery.status}</td></tr>)}</tbody></table></div></section>
    </div>
  );
}