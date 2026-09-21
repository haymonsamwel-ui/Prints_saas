import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    where: { companyId: session.companyId },
    include: { orders: { select: { total: true, balance: true, status: true, orderDate: true }, orderBy: { orderDate: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();

  if (!body.name || !body.customerType) {
    return NextResponse.json({ error: "Name and customer type are required" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      companyId: session.companyId,
      name: body.name,
      companyName: body.companyName || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      notes: body.notes || null,
      customerType: body.customerType,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
