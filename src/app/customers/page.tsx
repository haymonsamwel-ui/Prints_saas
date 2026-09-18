"use client";

import { UserPlus } from "lucide-react";
import { CustomerList } from "@/components/customers/customer-list";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";

export default function CustomersPage() {
  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Customer management</h1>
            <p className="mt-2 text-sm text-slate-400">Search customers, review balances, and track sales readiness.</p>
          </div>
          <ActionDialogButton
            label="Add customer"
            title="Add customer"
            description="Create a customer profile for quotations, orders, invoices, and delivery tracking."
            submitLabel="Save customer"
            fields={[
              { label: "Customer name", name: "name", placeholder: "Benson Media" },
              { label: "Type", name: "customerType", type: "select", options: ["INDIVIDUAL", "COMPANY", "NGO", "GOVERNMENT", "AGENCY", "OTHER"] },
              { label: "Phone", name: "phone", placeholder: "+255..." },
              { label: "Email", name: "email", type: "email", placeholder: "orders@example.com" },
              { label: "Address", name: "address", placeholder: "Dar es Salaam" },
              { label: "Notes", name: "notes", type: "textarea", placeholder: "Preferred contact, billing terms, or delivery notes" },
            ]}
            onSubmit={async (formData) => {
              await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(formData.entries())),
              });
              window.dispatchEvent(new Event("customers-updated"));
            }}
          >
            <UserPlus className="h-4 w-4" />
          </ActionDialogButton>
        </div>

        <CustomerList />
    </div>
  );
}
