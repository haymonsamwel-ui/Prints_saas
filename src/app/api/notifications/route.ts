import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request);
  if (error) return error;

  const overdueInvoices = await prisma.invoice.findMany({ where: { companyId: session.companyId, balance: { gt: 0 }, issueDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, select: { invoiceNumber: true, balance: true } });
  for (const invoice of overdueInvoices) {
    const title = `Overdue invoice ${invoice.invoiceNumber}`;
    const existing = await prisma.notification.findFirst({ where: { companyId: session.companyId, title, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    if (!existing) await prisma.notification.create({ data: { companyId: session.companyId, type: "PAYMENT_OVERDUE", channel: "INTERNAL", title, message: `Invoice balance TSh ${invoice.balance.toLocaleString()} is more than 30 days old.` } });
  }

  const notifications = await prisma.notification.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  const { session, error } = await authorizeRequest(request);
  if (error) return error;
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Notification is required" }, { status: 400 });

  const result = await prisma.notification.updateMany({
    where: { id: body.id, companyId: session.companyId },
    data: { isRead: true },
  });
  if (!result.count) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json({ updated: true });
}