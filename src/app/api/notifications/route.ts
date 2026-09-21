import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Notification is required" }, { status: 400 });

  const result = await prisma.notification.updateMany({
    where: { id: body.id, companyId: session.companyId },
    data: { isRead: true },
  });
  if (!result.count) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json({ updated: true });
}