"use client";

import { Banknote, ReceiptText, Search } from "lucide-react";
import { useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { RecordActions } from "@/components/ui/record-actions";
import { customers, invoices, payments } from "@/lib/constants";

type PaymentRecord = (typeof payments)[number];

const paymentFields = [
  { label: "Receipt", name: "receipt" },
  { label: "Customer", name: "customer", type: "select", options: customers.map((customer) => customer.name) },
  { label: "Invoice", name: "invoice", type: "select", options: invoices.map((invoice) => invoice.number) },
  { label: "Date", name: "date" },
  { label: "Method", name: "method", type: "select", options: ["CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER"] },
  { label: "Amount", name: "amount" },
  { label: "Balance after", name: "balanceAfter" },
] as const;

export default function PaymentsPage() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([...payments]);

  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Payments and receipts</h1>
            <p className="mt-2 text-sm text-slate-400">Record customer payments, issue receipts, and update outstanding balances.</p>
          </div>
          <ActionDialogButton
            label="Record payment"
            title="Record payment"
            description="Capture a customer payment and calculate the remaining balance for the linked invoice."
            submitLabel="Save payment"
            fields={[
              { label: "Customer", name: "customer", type: "select", options: customers.map((customer) => customer.name) },
              { label: "Invoice", name: "invoice", type: "select", options: invoices.map((invoice) => invoice.number) },
              { label: "Amount", name: "amount", type: "number", placeholder: "900000" },
              { label: "Method", name: "method", type: "select", options: ["CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER"] },
              { label: "Reference", name: "referenceNo", placeholder: "Bank or mobile money ref" },
              { label: "Notes", name: "notes", type: "textarea", placeholder: "Receipt notes" },
            ]}
          >
            <Banknote className="h-4 w-4" />
          </ActionDialogButton>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-slate-400 md:w-96">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search receipts, customers, invoices, or references</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Balance after</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map((payment) => (
                  <tr key={payment.receipt} className="border-t border-slate-800 bg-slate-900/40">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <ReceiptText className="h-4 w-4 text-emerald-300" />
                        {payment.receipt}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{payment.customer}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.invoice}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.method}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.amount}</td>
                    <td className="px-4 py-3 text-amber-300">{payment.balanceAfter}</td>
                    <td className="px-4 py-3">
                      <RecordActions
                        record={payment}
                        title={payment.receipt}
                        fields={paymentFields}
                        onSave={(updatedPayment) =>
                          setPaymentRecords((current) =>
                            current.map((item) => (item.receipt === payment.receipt ? updatedPayment : item)),
                          )
                        }
                        onDelete={() =>
                          setPaymentRecords((current) => current.filter((item) => item.receipt !== payment.receipt))
                        }
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
