import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");
  const company = companySlug ? await prisma.company.findUnique({ where: { slug: companySlug } }) : null;
  if (!company) return NextResponse.json([]);

  const jobs = await prisma.productionJob.findMany({ where: { companyId: company.id }, include: { order: { include: { customer: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(jobs.map((job) => ({ job: job.id.slice(-8).toUpperCase(), order: job.order?.orderNumber ?? "No order", customer: job.order?.customer.name ?? "No customer", title: job.title, status: job.status, designer: job.assignedUserId ?? "Unassigned", deadline: job.deadline?.toISOString().slice(0, 10) ?? "Not set", approval: job.approvalStatus ?? "Pending" })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const company = body.companySlug ? await prisma.company.findUnique({ where: { slug: body.companySlug } }) : null;
  if (!company || !body.title) return NextResponse.json({ error: "Company and job title are required" }, { status: 400 });
  const order = body.order ? await prisma.order.findFirst({ where: { companyId: company.id, orderNumber: body.order } }) : null;
  const job = await prisma.productionJob.create({ data: { companyId: company.id, orderId: order?.id, title: body.title, deadline: body.deadline ? new Date(body.deadline) : null, productionNotes: body.notes || null } });
  return NextResponse.json(job, { status: 201 });
}
