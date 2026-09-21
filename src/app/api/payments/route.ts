import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const payments = await prisma.payment.findMany({ where: { companyId: session.companyId }, include: { customer: true, order: true }, orderBy: { paymentDate: "desc" } });
  return NextResponse.json(payments.map((payment) => ({ receipt: payment.referenceNo ?? payment.id.slice(-8).toUpperCase(), customer: payment.customer?.name ?? "No customer", invoice: payment.order?.orderNumber ?? "No order", date: payment.paymentDate.toISOString().slice(0, 10), method: payment.method, amount: `TSh ${payment.amount.toLocaleString()}`, balanceAfter: `TSh ${(payment.order?.balance ?? 0).toLocaleString()}` })));
}

export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  if (!body.amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  const order = body.orderNumber ? await prisma.order.findFirst({ where: { companyId: session.companyId, orderNumber: body.orderNumber } }) : null;
  const payment = await prisma.payment.create({ data: { companyId: session.companyId, customerId: order?.customerId, orderId: order?.id, amount: Number(body.amount), method: body.method || "CASH", referenceNo: body.referenceNo || null, notes: body.notes || null } });
  if (order) await prisma.order.update({ where: { id: order.id }, data: { amountPaid: { increment: payment.amount }, balance: { decrement: payment.amount } } });
  return NextResponse.json(payment, { status: 201 });
}
