import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const quotations = await prisma.quotation.findMany({ where: { companyId: company.id }, include: { customer: true, items: true }, orderBy: { issueDate: "desc" } });
  return NextResponse.json(quotations.map((quote) => ({ number: quote.quoteNumber, customer: quote.customer.name, issueDate: quote.issueDate.toISOString().slice(0, 10), expiryDate: quote.expiryDate?.toISOString().slice(0, 10) ?? "Not set", subtotal: `TSh ${quote.subtotal.toLocaleString()}`, tax: `TSh ${quote.tax.toLocaleString()}`, total: `TSh ${quote.total.toLocaleString()}`, status: quote.status, items: quote.items.map((item) => item.description) })));
}
