import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";
import { createPublicQuoteToken } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    select: {
      quotations: {
        select: {
          quoteNumber: true,
          customer: { select: { name: true } },
          issueDate: true,
          expiryDate: true,
          subtotal: true,
          tax: true,
          total: true,
          status: true,
          items: { select: { description: true } },
        },
        orderBy: { issueDate: "desc" },
      },
    },
  });
  if (!company) return NextResponse.json([]);

  return NextResponse.json(company.quotations.map((quote) => ({
    number: quote.quoteNumber,
    customer: quote.customer.name,
    issueDate: quote.issueDate.toISOString().slice(0, 10),
    expiryDate: quote.expiryDate?.toISOString().slice(0, 10) ?? "Not set",
    subtotal: `TSh ${quote.subtotal.toLocaleString()}`,
    tax: `TSh ${quote.tax.toLocaleString()}`,
    total: `TSh ${quote.total.toLocaleString()}`,
    status: quote.status,
    items: quote.items.map((item) => item.description),
    publicToken: createPublicQuoteToken(quote.quoteNumber, session.companyId),
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  const company = await prisma.company.findUnique({ where: { id: session.companyId }, include: { settings: true } });
  if (body.action === "convertToOrder") {
    if (!company || !body.quoteNumber) return NextResponse.json({ error: "Company and quotation are required" }, { status: 400 });

    const quote = await prisma.quotation.findFirst({
      where: { companyId: company.id, quoteNumber: body.quoteNumber },
      include: { customer: true, items: true },
    });
    if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    if (quote.status !== "ACCEPTED") return NextResponse.json({ error: "Only accepted quotations can become orders" }, { status: 400 });

    const sourceNote = `Source quotation: ${quote.quoteNumber}`;
    const existingOrder = await prisma.order.findFirst({ where: { companyId: company.id, notes: sourceNote } });
    if (existingOrder) return NextResponse.json({ error: "This quotation already has an order" }, { status: 409 });

    const order = await prisma.$transaction(async (transaction) => {
      const createdOrder = await transaction.order.create({
        data: {
          companyId: company.id,
          customerId: quote.customerId,
          orderNumber: `ORD-${Date.now()}`,
          dueDate: quote.expiryDate,
          status: "CONFIRMED",
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          total: quote.total,
          balance: quote.total,
          notes: sourceNote,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              tax: item.tax,
              amount: item.amount,
            })),
          },
        },
      });

      await transaction.productionJob.create({
        data: {
          companyId: company.id,
          orderId: createdOrder.id,
          title: `${quote.quoteNumber} production job`,
          productionNotes: sourceNote,
        },
      });

      return createdOrder;
    });

    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  }
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

export async function PATCH(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  if (!body.quoteNumber || !body.status) return NextResponse.json({ error: "Quotation and status are required" }, { status: 400 });

  const quotation = await prisma.quotation.updateMany({
    where: { companyId: session.companyId, quoteNumber: body.quoteNumber },
    data: { status: body.status },
  });
  if (quotation.count === 0) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  return NextResponse.json({ updated: true });
}
