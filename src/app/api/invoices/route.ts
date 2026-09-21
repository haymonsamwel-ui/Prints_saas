import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES", "FINANCE"]);
  if (error) return error;

  const invoices = await prisma.invoice.findMany({ where: { companyId: session.companyId }, orderBy: { issueDate: "desc" } });
  return NextResponse.json(invoices.map((invoice) => ({ number: invoice.invoiceNumber, customer: "Customer record", order: "Order record", issueDate: invoice.issueDate.toISOString().slice(0, 10), total: `TSh ${invoice.total.toLocaleString()}`, paid: `TSh ${invoice.paid.toLocaleString()}`, balance: `TSh ${invoice.balance.toLocaleString()}`, paymentMethod: invoice.paymentMethod ?? "Not specified", paymentDetails: invoice.paymentDetails ?? "", status: invoice.balance <= 0 ? "PAID" : invoice.paid > 0 ? "PARTIAL" : "DRAFT" })));
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES", "FINANCE"]);
  if (error) return error;
  const body = await request.json();
  const company = await prisma.company.findUnique({ where: { id: session.companyId }, include: { settings: true } });
  if (body.action === "createFromQuotation") {
    if (!company || !body.quoteNumber) return NextResponse.json({ error: "Quotation is required" }, { status: 400 });
    const quote = await prisma.quotation.findFirst({ where: { companyId: session.companyId, quoteNumber: body.quoteNumber } });
    if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    if (quote.status !== "ACCEPTED") return NextResponse.json({ error: "Only accepted quotations can create invoices" }, { status: 400 });
    const sourceNote = `Source quotation: ${quote.quoteNumber}`;
    const existingInvoice = await prisma.invoice.findFirst({ where: { companyId: session.companyId, notes: sourceNote } });
    if (existingInvoice) return NextResponse.json({ error: "This quotation already has an invoice" }, { status: 409 });

    const invoice = await prisma.invoice.create({
      data: {
        companyId: session.companyId,
        customerId: quote.customerId,
        invoiceNumber: `${body.documentType === "RECEIPT" ? "RCT" : company.settings?.invoicePrefix ?? "INV"}-${Date.now()}`,
        type: body.documentType === "RECEIPT" ? "RECEIPT" : "INVOICE",
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        balance: quote.total,
        notes: sourceNote,
      },
    });
    return NextResponse.json({ invoiceNumber: invoice.invoiceNumber }, { status: 201 });
  }
  if (!company || !body.total) return NextResponse.json({ error: "Company and total are required" }, { status: 400 });
  const total = Number(body.total);
  const paid = Number(body.paid || 0);
  const customer = body.customerName ? await prisma.customer.findFirst({ where: { companyId: company.id, name: body.customerName } }) : null;
  const invoice = await prisma.invoice.create({ data: { companyId: company.id, customerId: customer?.id, invoiceNumber: `${company.settings?.invoicePrefix ?? "INV"}-${Date.now()}`, subtotal: total, total, paid, balance: total - paid, paymentMethod: body.paymentMethod || null, paymentDetails: body.paymentDetails || null, notes: body.notes || null } });
  return NextResponse.json(invoice, { status: 201 });
}
