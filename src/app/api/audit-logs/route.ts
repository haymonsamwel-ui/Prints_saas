import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER"]);
  if (error) return error;
  const logs = await prisma.auditLog.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(logs);
}
