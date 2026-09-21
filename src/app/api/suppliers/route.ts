import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";
import { recordAudit } from "@/lib/activity";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "FINANCE", "PRODUCTION"]);
  if (error) return error;
  const suppliers = await prisma.supplier.findMany({ where: { companyId: session.companyId }, orderBy: { name: "asc" } });
  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "FINANCE", "PRODUCTION"]);
  if (error) return error;
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
  const supplier = await prisma.supplier.create({ data: { companyId: session.companyId, name: String(body.name).trim(), companyName: body.companyName || null, phone: body.phone || null, email: body.email || null, address: body.address || null, notes: body.notes || null } });
  await recordAudit({ companyId: session.companyId, userId: session.userId, action: "CREATE", entityType: "Supplier", entityId: supplier.id, newValue: { name: supplier.name } });
  return NextResponse.json(supplier, { status: 201 });
}
