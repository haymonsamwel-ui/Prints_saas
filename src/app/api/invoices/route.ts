import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const invoices = await prisma.invoice.findMany({ where: { companyId: company.id }, orderBy: { issueDate: "desc" } });
  return NextResponse.json(invoices.map((invoice) => ({ number: invoice.invoiceNumber, customer: "Customer record", order: "Order record", issueDate: invoice.issueDate.toISOString().slice(0, 10), total: `TSh ${invoice.total.toLocaleString()}`, paid: `TSh ${invoice.paid.toLocaleString()}`, balance: `TSh ${invoice.balance.toLocaleString()}`, status: invoice.balance <= 0 ? "PAID" : invoice.paid > 0 ? "PARTIAL" : "DRAFT" })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = body.companySlug ? await prisma.company.findUnique({ where: { slug: body.companySlug }, include: { settings: true } }) : null;
  if (!company || !body.total) return NextResponse.json({ error: "Company and total are required" }, { status: 400 });
  const total = Number(body.total);
  const paid = Number(body.paid || 0);
  const customer = body.customerName ? await prisma.customer.findFirst({ where: { companyId: company.id, name: body.customerName } }) : null;
  const invoice = await prisma.invoice.create({ data: { companyId: company.id, customerId: customer?.id, invoiceNumber: `${company.settings?.invoicePrefix ?? "INV"}-${Date.now()}`, subtotal: total, total, paid, balance: total - paid, notes: body.notes || null } });
  return NextResponse.json(invoice, { status: 201 });
}
