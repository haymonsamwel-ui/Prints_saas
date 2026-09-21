import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES"]);
  if (error) return error;

  const products = await prisma.product.findMany({
    where: { companyId: session.companyId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES"]);
  if (error) return error;
  const body = await request.json();

  if (!body.name || !body.unit) {
    return NextResponse.json({ error: "Name and unit are required" }, { status: 400 });
  }

  const categoryName = String(body.category ?? "").trim();
  const category = categoryName ? await prisma.productCategory.findFirst({ where: { companyId: session.companyId, name: categoryName } }) ?? await prisma.productCategory.create({ data: { companyId: session.companyId, name: categoryName } }) : null;
  const product = await prisma.product.create({
    data: {
      companyId: session.companyId,
      categoryId: category?.id,
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

export async function PATCH(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES"]);
  if (error) return error;
  const body = await request.json();
  if (!body.id || !body.name || !body.unit) return NextResponse.json({ error: "Product, name, and unit are required" }, { status: 400 });

  const existing = await prisma.product.findFirst({ where: { id: body.id, companyId: session.companyId } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const categoryName = String(body.category ?? "").trim();
  const category = categoryName ? await prisma.productCategory.findFirst({ where: { companyId: session.companyId, name: categoryName } }) ?? await prisma.productCategory.create({ data: { companyId: session.companyId, name: categoryName } }) : null;
  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: body.name,
      categoryId: category?.id ?? null,
      unit: body.unit,
      sellingPrice: Number(body.sellingPrice ?? 0),
      costPrice: Number(body.costPrice ?? 0),
      isActive: body.status !== "Inactive",
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES"]);
  if (error) return error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product is required" }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id, companyId: session.companyId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  await prisma.product.delete({ where: { id: product.id } });
  return NextResponse.json({ deleted: true });
}
