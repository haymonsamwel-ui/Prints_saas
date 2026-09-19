import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const payments = await prisma.payment.findMany({ where: { companyId: company.id }, include: { customer: true, order: true }, orderBy: { paymentDate: "desc" } });
  return NextResponse.json(payments.map((payment) => ({ receipt: payment.referenceNo ?? payment.id.slice(-8).toUpperCase(), customer: payment.customer?.name ?? "No customer", invoice: payment.order?.orderNumber ?? "No order", date: payment.paymentDate.toISOString().slice(0, 10), method: payment.method, amount: `TSh ${payment.amount.toLocaleString()}`, balanceAfter: `TSh ${(payment.order?.balance ?? 0).toLocaleString()}` })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = body.companySlug ? await prisma.company.findUnique({ where: { slug: body.companySlug } }) : null;
  if (!company || !body.amount) return NextResponse.json({ error: "Company and amount are required" }, { status: 400 });
  const order = body.orderNumber ? await prisma.order.findFirst({ where: { companyId: company.id, orderNumber: body.orderNumber } }) : null;
  const payment = await prisma.payment.create({ data: { companyId: company.id, customerId: order?.customerId, orderId: order?.id, amount: Number(body.amount), method: body.method || "CASH", referenceNo: body.referenceNo || null, notes: body.notes || null } });
  if (order) await prisma.order.update({ where: { id: order.id }, data: { amountPaid: { increment: payment.amount }, balance: { decrement: payment.amount } } });
  return NextResponse.json(payment, { status: 201 });
}
