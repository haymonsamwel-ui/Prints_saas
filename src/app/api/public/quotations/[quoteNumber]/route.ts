import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPublicQuoteToken, verifyPublicQuoteToken } from "@/lib/server-session";

type RouteContext = { params: Promise<{ quoteNumber: string }> };

async function getQuote(request: Request, context: RouteContext) {
  const { quoteNumber } = await context.params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const quotations = await prisma.quotation.findMany({
    where: { quoteNumber },
    include: { customer: { select: { name: true } }, company: { select: { id: true, name: true, phone: true, email: true, address: true, currency: true } }, items: true },
  });
  return quotations.find((quote) => verifyPublicQuoteToken(quoteNumber, quote.company.id, token)) ?? null;
}

function serializeQuote(quote: NonNullable<Awaited<ReturnType<typeof getQuote>>>) {
  return {
    number: quote.quoteNumber,
    company: quote.company,
    customer: quote.customer.name,
    issueDate: quote.issueDate.toISOString().slice(0, 10),
    expiryDate: quote.expiryDate?.toISOString().slice(0, 10) ?? "Not set",
    subtotal: quote.subtotal,
    tax: quote.tax,
    total: quote.total,
    status: quote.status,
    notes: quote.notes,
    terms: quote.terms,
    items: quote.items.map((item) => ({ description: item.description, quantity: item.quantity, amount: item.amount })),
  };
}

export async function GET(request: Request, context: RouteContext) {
  const quote = await getQuote(request, context);
  if (!quote) return NextResponse.json({ error: "Quotation link is invalid or expired" }, { status: 404 });
  return NextResponse.json(serializeQuote(quote));
}

export async function POST(request: Request, context: RouteContext) {
  const quote = await getQuote(request, context);
  if (!quote) return NextResponse.json({ error: "Quotation link is invalid or expired" }, { status: 404 });

  const body = await request.json();
  if (!["ACCEPTED", "REJECTED"].includes(body.status)) return NextResponse.json({ error: "Invalid quotation response" }, { status: 400 });
  if (quote.status === "ACCEPTED" || quote.status === "REJECTED") return NextResponse.json({ error: "This quotation has already been answered" }, { status: 409 });
  if (quote.expiryDate && quote.expiryDate < new Date()) return NextResponse.json({ error: "This quotation has expired" }, { status: 410 });

  const updated = await prisma.quotation.update({ where: { id: quote.id }, data: { status: body.status } });
  return NextResponse.json({ status: updated.status });
}
