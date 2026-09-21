import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "DESIGNER", "PRODUCTION", "DELIVERY"]);
  if (error) return error;

  const jobs = await prisma.productionJob.findMany({ where: { companyId: session.companyId }, include: { order: { include: { customer: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(jobs.map((job) => ({ job: job.id.slice(-8).toUpperCase(), order: job.order?.orderNumber ?? "No order", customer: job.order?.customer.name ?? "No customer", title: job.title, status: job.status, designer: job.assignedUserId ?? "Unassigned", deadline: job.deadline?.toISOString().slice(0, 10) ?? "Not set", approval: job.approvalStatus ?? "Pending" })));
}

export async function POST(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "DESIGNER", "PRODUCTION"]);
  if (error) return error;
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  const order = body.order ? await prisma.order.findFirst({ where: { companyId: session.companyId, orderNumber: body.order } }) : null;
  const job = await prisma.productionJob.create({ data: { companyId: session.companyId, orderId: order?.id, title: body.title, deadline: body.deadline ? new Date(body.deadline) : null, productionNotes: body.notes || null } });
  return NextResponse.json(job, { status: 201 });
}
