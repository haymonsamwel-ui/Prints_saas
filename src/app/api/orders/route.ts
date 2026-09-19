import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const orders = await prisma.order.findMany({ where: { companyId: company.id }, include: { customer: true }, orderBy: { orderDate: "desc" } });
  return NextResponse.json(orders.map((order) => ({ number: order.orderNumber, customer: order.customer.name, source: "Direct order", dueDate: order.dueDate?.toISOString().slice(0, 10) ?? "Not set", total: `TSh ${order.total.toLocaleString()}`, paid: `TSh ${order.amountPaid.toLocaleString()}`, balance: `TSh ${order.balance.toLocaleString()}`, status: order.status })));
}
