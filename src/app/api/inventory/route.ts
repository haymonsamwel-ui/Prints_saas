import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const items = await prisma.inventoryItem.findMany({ where: { companyId: company.id }, orderBy: { name: "asc" } });
  return NextResponse.json(items.map((item) => ({ item: item.name, sku: item.sku, unit: item.unit, onHand: item.quantity, minimum: item.minStock, supplier: item.supplier ?? "Not assigned", status: item.quantity <= item.minStock ? "Low stock" : "Healthy" })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = body.companySlug ? await prisma.company.findUnique({ where: { slug: body.companySlug } }) : null;
  if (!company || !body.item || !body.quantity) return NextResponse.json({ error: "Company, item, and quantity are required" }, { status: 400 });

  const sku = body.sku || `MAT-${body.item.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 18)}`;
  const quantity = Number(body.quantity);
  const item = await prisma.inventoryItem.upsert({
    where: { companyId_sku: { companyId: company.id, sku } },
    update: { quantity: { increment: quantity } },
    create: { companyId: company.id, name: body.item, sku, unit: body.unit || "Piece", quantity, minStock: Number(body.minStock || 0), supplier: body.supplier || null },
  });
  await prisma.inventoryTransaction.create({ data: { companyId: company.id, inventoryId: item.id, type: body.type || "STOCK_IN", quantity, notes: body.notes || null } });
  return NextResponse.json(item, { status: 201 });
}
