import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";
import { createNotification, recordAudit } from "@/lib/activity";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES", "DELIVERY"]);
  if (error) return error;

  const orders = await prisma.order.findMany({ where: { companyId: session.companyId }, include: { customer: true }, orderBy: { orderDate: "desc" } });
  return NextResponse.json(orders.map((order) => ({ number: order.orderNumber, customer: order.customer.name, source: "Direct order", dueDate: order.dueDate?.toISOString().slice(0, 10) ?? "Not set", total: `TSh ${order.total.toLocaleString()}`, paid: `TSh ${order.amountPaid.toLocaleString()}`, balance: `TSh ${order.balance.toLocaleString()}`, status: order.status })));
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES"]);
  if (error) return error;
  const body = await request.json();
  if (!body.customer || !body.item || !body.total) return NextResponse.json({ error: "Customer, item, and total are required" }, { status: 400 });

  const customer = await prisma.customer.findFirst({ where: { companyId: session.companyId, name: String(body.customer).trim() } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const total = Number(body.total);
  const paid = Number(body.paid || 0);
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(paid) || paid < 0 || paid > total) {
    return NextResponse.json({ error: "Enter valid total and deposit amounts" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      companyId: session.companyId,
      customerId: customer.id,
      orderNumber: `ORD-${Date.now()}`,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: "CONFIRMED",
      subtotal: total,
      total,
      deposit: paid,
      amountPaid: paid,
      balance: total - paid,
      notes: body.notes || null,
      items: { create: { description: body.item, quantity: 1, unitPrice: total, amount: total } },
    },
  });

  await Promise.all([
    recordAudit({ companyId: session.companyId, userId: session.userId, action: "CREATE", entityType: "Order", entityId: order.id, newValue: { orderNumber: order.orderNumber, total: order.total } }),
    createNotification({ companyId: session.companyId, type: "NEW_ORDER", title: "New order created", message: `${order.orderNumber} was created for ${customer.name}.` }),
  ]);

  return NextResponse.json(order, { status: 201 });
}
