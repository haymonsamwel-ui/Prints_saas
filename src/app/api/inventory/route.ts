import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "PRODUCTION"]);
  if (error) return error;

  const items = await prisma.inventoryItem.findMany({ where: { companyId: session.companyId }, orderBy: { name: "asc" } });
  return NextResponse.json(items.map((item) => ({ item: item.name, sku: item.sku, unit: item.unit, onHand: item.quantity, minimum: item.minStock, supplier: item.supplier ?? "Not assigned", status: item.quantity <= item.minStock ? "Low stock" : "Healthy" })));
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "PRODUCTION"]);
  if (error) return error;
  const body = await request.json();
  if (!body.item || !body.quantity) return NextResponse.json({ error: "Item and quantity are required" }, { status: 400 });

  const sku = body.sku || `MAT-${body.item.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 18)}`;
  const quantity = Number(body.quantity);
  const movement = body.type === "STOCK_OUT" ? -quantity : quantity;
  if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Quantity must be positive" }, { status: 400 });
  const existing = await prisma.inventoryItem.findUnique({ where: { companyId_sku: { companyId: session.companyId, sku } } });
  if (!existing && movement < 0) return NextResponse.json({ error: "Cannot remove stock from an unknown item" }, { status: 409 });
  if (existing && existing.quantity + movement < 0) return NextResponse.json({ error: "Insufficient stock" }, { status: 409 });
  const item = await prisma.inventoryItem.upsert({
    where: { companyId_sku: { companyId: session.companyId, sku } },
    update: { quantity: { increment: movement } },
    create: { companyId: session.companyId, name: body.item, sku, unit: body.unit || "Piece", quantity: movement, minStock: Number(body.minStock || 0), supplier: body.supplier || null },
  });
  await prisma.inventoryTransaction.create({ data: { companyId: session.companyId, inventoryId: item.id, type: body.type || "STOCK_IN", quantity: movement, notes: body.notes || null } });
  return NextResponse.json(item, { status: 201 });
}
