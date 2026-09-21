import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const items = await prisma.inventoryItem.findMany({ where: { companyId: session.companyId }, orderBy: { name: "asc" } });
  return NextResponse.json(items.map((item) => ({ item: item.name, sku: item.sku, unit: item.unit, onHand: item.quantity, minimum: item.minStock, supplier: item.supplier ?? "Not assigned", status: item.quantity <= item.minStock ? "Low stock" : "Healthy" })));
}

export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  if (!body.item || !body.quantity) return NextResponse.json({ error: "Item and quantity are required" }, { status: 400 });

  const sku = body.sku || `MAT-${body.item.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 18)}`;
  const quantity = Number(body.quantity);
  const item = await prisma.inventoryItem.upsert({
    where: { companyId_sku: { companyId: session.companyId, sku } },
    update: { quantity: { increment: quantity } },
    create: { companyId: session.companyId, name: body.item, sku, unit: body.unit || "Piece", quantity, minStock: Number(body.minStock || 0), supplier: body.supplier || null },
  });
  await prisma.inventoryTransaction.create({ data: { companyId: session.companyId, inventoryId: item.id, type: body.type || "STOCK_IN", quantity, notes: body.notes || null } });
  return NextResponse.json(item, { status: 201 });
}
