import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const invoices = await prisma.invoice.findMany({ where: { companyId: company.id }, orderBy: { issueDate: "desc" } });
  return NextResponse.json(invoices.map((invoice) => ({ number: invoice.invoiceNumber, customer: "Customer record", order: "Order record", issueDate: invoice.issueDate.toISOString().slice(0, 10), total: `TSh ${invoice.total.toLocaleString()}`, paid: `TSh ${invoice.paid.toLocaleString()}`, balance: `TSh ${invoice.balance.toLocaleString()}`, status: invoice.balance <= 0 ? "PAID" : invoice.paid > 0 ? "PARTIAL" : "DRAFT" })));
}
