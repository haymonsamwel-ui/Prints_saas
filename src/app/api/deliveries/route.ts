import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "DELIVERY"]);
  if (error) return error;

  const deliveries = await prisma.delivery.findMany({
    where: { companyId: session.companyId },
    include: { order: { select: { orderNumber: true } }, customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deliveries.map((delivery) => ({
    id: delivery.id,
    order: delivery.order?.orderNumber ?? "No order",
    customer: delivery.customer?.name ?? "No customer",
    type: delivery.deliveryType,
    address: delivery.address ?? "Not set",
    driver: delivery.driverName ?? "Unassigned",
    date: delivery.deliveryDate?.toISOString().slice(0, 10) ?? "Not scheduled",
    status: delivery.status,
  })));
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "DELIVERY"]);
  if (error) return error;
  const body = await request.json();
  if (!body.orderNumber || !body.type) return NextResponse.json({ error: "Order and delivery type are required" }, { status: 400 });

  const order = await prisma.order.findFirst({ where: { companyId: session.companyId, orderNumber: body.orderNumber } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const delivery = await prisma.delivery.create({
    data: {
      companyId: session.companyId,
      orderId: order.id,
      customerId: order.customerId,
      deliveryType: body.type,
      address: body.address || null,
      driverName: body.driver || null,
      deliveryDate: body.date ? new Date(body.date) : null,
      deliveryCost: Number(body.deliveryCost || 0),
      installationCost: Number(body.installationCost || 0),
      notes: body.notes || null,
    },
  });
  return NextResponse.json(delivery, { status: 201 });
}