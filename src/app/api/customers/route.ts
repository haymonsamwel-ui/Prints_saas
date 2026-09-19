import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getCompanySlug(request: Request) {
  return new URL(request.url).searchParams.get("companySlug") ?? "";
}

export async function GET(request: Request) {
  const company = await prisma.company.findUnique({ where: { slug: getCompanySlug(request) } });

  if (!company) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const customers = await prisma.customer.findMany({
    where: { companyId: company.id },
    include: { orders: { select: { total: true, balance: true, status: true, orderDate: true }, orderBy: { orderDate: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = await prisma.company.findUnique({ where: { slug: body.companySlug } });

  if (!company) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (!body.name || !body.customerType) {
    return NextResponse.json({ error: "Name and customer type are required" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      companyId: company.id,
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
