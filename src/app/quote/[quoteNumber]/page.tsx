"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Quote = { number: string; company: { name: string; phone: string | null; email: string | null; address: string | null; currency: string }; customer: string; issueDate: string; expiryDate: string; subtotal: number; tax: number; total: number; status: string; notes: string | null; terms: string | null; items: { description: string; quantity: number; amount: number }[] };

export default function PublicQuotationPage({ params }: { params: Promise<{ quoteNumber: string }> }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [message, setMessage] = useState("Loading quotation...");
  const token = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") ?? "";

  useEffect(() => {
    void params.then(({ quoteNumber }) => fetch(`/api/public/quotations/${encodeURIComponent(quoteNumber)}?token=${encodeURIComponent(token)}`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to load quotation");
      setQuote(result);
      setMessage("");
    }).catch((error: Error) => setMessage(error.message)));
  }, [params, token]);

  async function respond(status: "ACCEPTED" | "REJECTED") {
    if (!quote) return;
    const { quoteNumber } = await params;
    const response = await fetch(`/api/public/quotations/${encodeURIComponent(quoteNumber)}?token=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to update quotation"); return; }
    setQuote({ ...quote, status: result.status });
    setMessage(result.status === "ACCEPTED" ? "Thank you. The quotation has been accepted." : "The quotation has been declined.");
  }

  if (!quote) return <main className="mx-auto max-w-2xl p-6"><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-200">{message}</div></main>;
  const canRespond = quote.status !== "ACCEPTED" && quote.status !== "REJECTED" && quote.status !== "EXPIRED";
  return <main className="mx-auto max-w-3xl p-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 shadow-xl"><div className="flex justify-between gap-4 border-b border-slate-200 pb-5"><div><h1 className="text-2xl font-bold">{quote.company.name}</h1><p className="text-sm text-slate-500">{quote.company.address} {quote.company.phone ? `· ${quote.company.phone}` : ""}</p></div><div className="text-right"><div className="font-semibold">QUOTATION</div><div>{quote.number}</div></div></div><div className="mt-6"><div className="font-semibold">Prepared for {quote.customer}</div><div className="mt-1 text-sm text-slate-500">Issued {quote.issueDate} · Valid until {quote.expiryDate}</div></div><div className="mt-6 space-y-3">{quote.items.map((item) => <div key={item.description} className="flex justify-between border-b border-slate-100 pb-3"><span>{item.description} × {item.quantity}</span><span>{quote.company.currency} {item.amount.toLocaleString()}</span></div>)}</div><div className="mt-6 space-y-2 text-right"><div>Subtotal {quote.company.currency} {quote.subtotal.toLocaleString()}</div><div>Tax {quote.company.currency} {quote.tax.toLocaleString()}</div><div className="text-xl font-bold">Total {quote.company.currency} {quote.total.toLocaleString()}</div></div>{quote.notes ? <p className="mt-6 text-sm text-slate-600">{quote.notes}</p> : null}<div className="mt-8 flex flex-wrap items-center justify-end gap-3">{message ? <span className="mr-auto text-sm text-emerald-700">{message}</span> : null}{canRespond ? <><button type="button" onClick={() => void respond("REJECTED")} className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-3 text-sm text-rose-700"><XCircle className="h-4 w-4" />Decline</button><button type="button" onClick={() => void respond("ACCEPTED")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" />Accept quotation</button></> : <span className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold">Status: {quote.status}</span>}</div></section></main>;
}