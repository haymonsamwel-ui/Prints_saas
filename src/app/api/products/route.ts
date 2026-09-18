import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const companySlug = "bk-prints";

export async function GET() {
  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { companyId: company.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (!body.name || !body.unit) {
    return NextResponse.json({ error: "Name and unit are required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      companyId: company.id,
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
