"use client";

import { FileText, Plus, Printer } from "lucide-react";
import { useState } from "react";
import { QuotationActions } from "@/components/quotations/quotation-actions";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { RecordActions } from "@/components/ui/record-actions";
import { customers, quotations } from "@/lib/constants";
import { useStudioProfile } from "@/lib/studio-profile";

type QuotationRecord = (typeof quotations)[number];

const quotationFields = [
  { label: "Quote", name: "number" },
  { label: "Customer", name: "customer", type: "select", options: customers.map((customer) => customer.name) },
  { label: "Issue date", name: "issueDate" },
  { label: "Expiry date", name: "expiryDate" },
  { label: "Subtotal", name: "subtotal" },
  { label: "VAT", name: "tax" },
  { label: "Total", name: "total" },
  { label: "Status", name: "status", type: "select", options: ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "DECLINED", "EXPIRED"] },
] as const;

export default function QuotationsPage() {
  const studioProfile = useStudioProfile();
  const [quotationRecords, setQuotationRecords] = useState<QuotationRecord[]>([...quotations]);
  const previewQuote = quotationRecords[0] ?? quotations[0];

  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Quotation management</h1>
            <p className="mt-2 text-sm text-slate-400">Prepare customer estimates with tax, expiry dates, and PDF-ready layouts.</p>
          </div>
          <ActionDialogButton
            label="New quotation"
            title="New quotation"
            description="Prepare a customer estimate with validity, line items, tax, and terms."
            submitLabel="Create quotation"
            fields={[
              { label: "Customer", name: "customer", type: "customer", options: customers.map((customer) => customer.name) },
              { label: "Expiry date", name: "expiryDate", type: "date" },
              { label: "Product/service", name: "item", placeholder: "Vehicle branding" },
              { label: "Total", name: "total", type: "number", placeholder: "2460000" },
              { label: "Terms", name: "terms", type: "textarea", placeholder: "Payment terms and quote notes" },
            ]}
          >
            <Plus className="h-4 w-4" />
          </ActionDialogButton>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-200">
              <FileText className="h-5 w-5 text-emerald-300" />
              Active quotations
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Quote</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationRecords.map((quote) => (
                    <tr key={quote.number} className="border-t border-slate-800 bg-slate-900/40">
                      <td className="px-4 py-3 text-white">{quote.number}</td>
                      <td className="px-4 py-3 text-slate-300">{quote.customer}</td>
                      <td className="px-4 py-3 text-slate-300">{quote.expiryDate}</td>
                      <td className="px-4 py-3 text-slate-300">{quote.total}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{quote.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <QuotationActions quote={quote} />
                          <RecordActions
                            record={quote}
                            title={quote.number}
                            fields={quotationFields}
                            onSave={(updatedQuote) =>
                              setQuotationRecords((current) =>
                                current.map((item) => (item.number === quote.number ? updatedQuote : item)),
                              )
                            }
                            onDelete={() =>
                              setQuotationRecords((current) => current.filter((item) => item.number !== quote.number))
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-4 flex items-center gap-2 text-slate-200">
              <Printer className="h-5 w-5 text-cyan-300" />
              PDF layout preview
            </div>
            <div className="rounded-2xl border border-slate-700 bg-white p-5 text-slate-950">
              <div className="flex justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  {studioProfile.logoDataUrl ? (
                    <img
                      src={studioProfile.logoDataUrl}
                      alt={`${studioProfile.name} logo`}
                      className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                    />
                  ) : null}
                  <div>
                    <div className="text-lg font-bold">{studioProfile.name}</div>
                    <div className="text-xs text-slate-500">{studioProfile.phone} / {studioProfile.email}</div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">QUOTATION</div>
                  <div>{previewQuote.number}</div>
                </div>
              </div>
              <div className="mt-5 text-sm">
                <div className="font-semibold">{previewQuote.customer}</div>
                <div className="mt-1 text-slate-500">Valid until {previewQuote.expiryDate}</div>
              </div>
              <div className="mt-5 space-y-2 text-sm">
                {previewQuote.items.map((item) => (
                  <div key={item} className="flex justify-between border-b border-slate-100 pb-2">
                    <span>{item}</span>
                    <span>Included</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-1 text-right text-sm">
                <div>Subtotal {previewQuote.subtotal}</div>
                <div>VAT {previewQuote.tax}</div>
                <div className="text-lg font-bold">Total {previewQuote.total}</div>
              </div>
            </div>
          </aside>
        </section>
    </div>
  );
}
