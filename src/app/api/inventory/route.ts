import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const items = await prisma.inventoryItem.findMany({ where: { companyId: company.id }, orderBy: { name: "asc" } });
  return NextResponse.json(items.map((item) => ({ item: item.name, sku: item.sku, unit: item.unit, onHand: item.quantity, minimum: item.minStock, supplier: item.supplier ?? "Not assigned", status: item.quantity <= item.minStock ? "Low stock" : "Healthy" })));
}
