import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";
import { createNotification, recordAudit } from "@/lib/activity";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES", "FINANCE"]);
  if (error) return error;

  const payments = await prisma.payment.findMany({ where: { companyId: session.companyId }, include: { customer: true, order: true }, orderBy: { paymentDate: "desc" } });
  return NextResponse.json(payments.map((payment) => ({ receipt: payment.referenceNo ?? payment.id.slice(-8).toUpperCase(), customer: payment.customer?.name ?? "No customer", invoice: payment.order?.orderNumber ?? "No order", date: payment.paymentDate.toISOString().slice(0, 10), method: payment.method, amount: `TSh ${payment.amount.toLocaleString()}`, balanceAfter: `TSh ${(payment.order?.balance ?? 0).toLocaleString()}` })));
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES", "FINANCE"]);
  if (error) return error;
  const body = await request.json();
  if (!body.amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  const order = body.orderNumber ? await prisma.order.findFirst({ where: { companyId: session.companyId, orderNumber: body.orderNumber } }) : null;
  const payment = await prisma.payment.create({ data: { companyId: session.companyId, customerId: order?.customerId, orderId: order?.id, amount: Number(body.amount), method: body.method || "CASH", referenceNo: body.referenceNo || null, notes: body.notes || null } });
  if (order) await prisma.order.update({ where: { id: order.id }, data: { amountPaid: { increment: payment.amount }, balance: { decrement: payment.amount } } });
  await Promise.all([
    recordAudit({ companyId: session.companyId, userId: session.userId, action: "CREATE", entityType: "Payment", entityId: payment.id, newValue: { amount: payment.amount, orderId: order?.id } }),
    createNotification({ companyId: session.companyId, type: "PAYMENT_RECEIVED", title: "Payment received", message: `A payment of TSh ${payment.amount.toLocaleString()} was recorded.` }),
  ]);
  return NextResponse.json(payment, { status: 201 });
}
