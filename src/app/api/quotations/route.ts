import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug }, include: { settings: true } }) : null;
  if (!company) return NextResponse.json([]);

  const quotations = await prisma.quotation.findMany({ where: { companyId: company.id }, include: { customer: true, items: true }, orderBy: { issueDate: "desc" } });
  return NextResponse.json(quotations.map((quote) => ({ number: quote.quoteNumber, customer: quote.customer.name, issueDate: quote.issueDate.toISOString().slice(0, 10), expiryDate: quote.expiryDate?.toISOString().slice(0, 10) ?? "Not set", subtotal: `TSh ${quote.subtotal.toLocaleString()}`, tax: `TSh ${quote.tax.toLocaleString()}`, total: `TSh ${quote.total.toLocaleString()}`, status: quote.status, items: quote.items.map((item) => item.description) })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = body.companySlug ? await prisma.company.findUnique({ where: { slug: body.companySlug }, include: { settings: true } }) : null;
  if (!company || !body.customerName || !body.item || !body.total) return NextResponse.json({ error: "Company, customer, item, and total are required" }, { status: 400 });
  const customerNameInput = String(body.customerName).trim();
  const customerName = customerNameInput.toLowerCase();
  const existingCustomer = (await prisma.customer.findMany({ where: { companyId: company.id }, take: 100 })).find(
    (record) => record.name.trim().toLowerCase() === customerName,
  );
  const customer = existingCustomer ?? await prisma.customer.create({
    data: {
      companyId: company.id,
      name: customerNameInput,
      customerType: "INDIVIDUAL",
    },
  });

  const total = Number(body.total);
  const taxRate = Number(body.taxRate || 0);
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(taxRate) || taxRate < 0) {
    return NextResponse.json({ error: "Enter a valid positive total and tax rate" }, { status: 400 });
  }
  const tax = Math.round(total * taxRate / 100);
  const subtotal = total - tax;
  const quoteNumber = `${company.settings?.quotationPrefix ?? "QTN"}-${Date.now()}`;
  const quotation = await prisma.quotation.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      quoteNumber,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      subtotal,
      tax,
      total,
      notes: body.terms || null,
      items: { create: { description: body.item, quantity: 1, unitPrice: subtotal, tax, amount: subtotal } },
    },
  });
  return NextResponse.json(quotation, { status: 201 });
}
