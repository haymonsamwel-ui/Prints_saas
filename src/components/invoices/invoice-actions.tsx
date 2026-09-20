"use client";

import { Download, MessageCircle } from "lucide-react";
import { buildStructuredPdf } from "@/lib/document-pdf";
import { useStudioProfile } from "@/lib/studio-profile";

type Invoice = {
  number: string;
  customer: string;
  order: string;
  issueDate: string;
  total: string;
  paid: string;
  balance: string;
};

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const studioProfile = useStudioProfile();
  const message = encodeURIComponent([
    `Hello ${invoice.customer},`,
    `Your invoice ${invoice.number} from ${studioProfile.name} is ready.`,
    `Total: ${invoice.total}`,
    `Balance: ${invoice.balance}`,
  ].join("\n"));

  function downloadPdf() {
    const pdf = buildStructuredPdf({
      kind: "INVOICE",
      number: invoice.number,
      customer: invoice.customer,
      issueDate: invoice.issueDate,
      dueOrExpiry: "On receipt",
      subtotal: invoice.total,
      tax: "Included",
      total: invoice.total,
      paid: invoice.paid,
      balance: invoice.balance,
      items: [invoice.order || "Invoice items"],
    }, studioProfile);
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.number}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-emerald-300 transition hover:bg-slate-800" aria-label={`Share ${invoice.number} on WhatsApp`} title="Share on WhatsApp">
        <MessageCircle className="h-4 w-4" />
      </a>
      <button type="button" onClick={downloadPdf} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-cyan-300 transition hover:bg-slate-800" aria-label={`Download ${invoice.number} as PDF`} title="Download PDF">
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
