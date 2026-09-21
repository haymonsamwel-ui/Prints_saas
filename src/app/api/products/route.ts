import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { companyId: session.companyId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();

  if (!body.name || !body.unit) {
    return NextResponse.json({ error: "Name and unit are required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      companyId: session.companyId,
      name: body.name,
      description: body.description || null,
      unit: body.unit,
      sellingPrice: Number(body.sellingPrice || 0),
      costPrice: Number(body.costPrice || 0),
      isActive: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
