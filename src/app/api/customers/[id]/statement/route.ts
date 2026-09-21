import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "SALES", "FINANCE"]);
  if (error) return error;
  const { id } = await context.params;
  const customer = await prisma.customer.findFirst({
    where: { id, companyId: session.companyId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      orders: { select: { orderNumber: true, orderDate: true, total: true, amountPaid: true, balance: true, status: true }, orderBy: { orderDate: "desc" } },
      payments: { select: { id: true, paymentDate: true, amount: true, method: true, referenceNo: true }, orderBy: { paymentDate: "desc" } },
      quotations: { select: { quoteNumber: true, issueDate: true, total: true, status: true }, orderBy: { issueDate: "desc" } },
      invoices: { select: { invoiceNumber: true, issueDate: true, total: true, paid: true, balance: true, type: true }, orderBy: { issueDate: "desc" } },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}