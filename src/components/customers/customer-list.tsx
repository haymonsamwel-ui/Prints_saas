"use client";

import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RecordActions } from "@/components/ui/record-actions";
import { readSession } from "@/lib/auth-session";

const filters = ["All", "Quoted", "In production", "Delivered"];
type CustomerRecord = {
  id: string;
  name: string;
  customerType: string;
  phone: string | null;
  email: string | null;
  balance: number;
  lastOrder: string;
  status: string;
};

const customerFields = [
  { label: "Customer", name: "name" },
  { label: "Type", name: "customerType", type: "select", options: ["INDIVIDUAL", "COMPANY", "NGO", "GOVERNMENT", "AGENCY", "OTHER"] },
  { label: "Phone", name: "phone" },
  { label: "Email", name: "email", type: "email" },
  { label: "Balance", name: "balance" },
  { label: "Status", name: "status", type: "select", options: ["Quoted", "Ready to order", "In production", "Delivered"] },
  { label: "Last order", name: "lastOrder" },
] as const;

export function CustomerList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [customerRecords, setCustomerRecords] = useState<CustomerRecord[]>([]);

  async function loadCustomers() {
    const session = readSession();
    const companySlug = session?.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!companySlug) return;
    const response = await fetch(`/api/customers?companySlug=${encodeURIComponent(companySlug)}`);
    if (!response.ok) return;
    const records = await response.json();
    setCustomerRecords(records.map((customer: { id: string; name: string; customerType: string; phone: string | null; email: string | null; orders: { balance: number; status: string }[] }) => {
      const order = customer.orders[0];
      return {
        id: customer.id,
        name: customer.name,
        customerType: customer.customerType,
        phone: customer.phone,
        email: customer.email,
        balance: order?.balance ?? 0,
        lastOrder: order ? "Recent order" : "No orders yet",
        status: order?.status?.replaceAll("_", " ") ?? "New",
      };
    }));
  }

  useEffect(() => {
    loadCustomers();
    window.addEventListener("customers-updated", loadCustomers);
    return () => window.removeEventListener("customers-updated", loadCustomers);
  }, []);

  const visibleCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customerRecords.filter((customer) => {
      const matchesFilter = filter === "All" || customer.status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [customer.name, customer.customerType, customer.phone, customer.email, customer.lastOrder]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [customerRecords, filter, query]);

  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          ["Total customers", customerRecords.length.toString()],
          ["With balances", customerRecords.filter((customer) => customer.balance > 0).length.toString()],
          ["Visible now", visibleCustomers.length.toString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="h-4 w-4 text-cyan-300" />
              {label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-slate-400 md:w-96">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              placeholder="Search by name, phone, email, or company"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  filter === item
                    ? "border-emerald-500 bg-emerald-500 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
                aria-pressed={filter === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Last order</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.name} className="border-t border-slate-800 bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{customer.name}</div>
                    <div className="text-xs text-slate-500">{customer.customerType}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{customer.phone ?? "No phone"}</div>
                    <div className="text-xs text-slate-500">{customer.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{customer.lastOrder}</td>
                  <td className="px-4 py-3 text-slate-300">TSh {customer.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RecordActions
                      record={customer}
                      title={customer.name}
                      fields={customerFields}
                      onSave={(updatedCustomer) =>
                        setCustomerRecords((current) =>
                          current.map((item) => (item.id === customer.id ? updatedCustomer : item)),
                        )
                      }
                      onDelete={() =>
                        setCustomerRecords((current) => current.filter((item) => item.id !== customer.id))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
