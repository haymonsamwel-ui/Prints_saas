import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setServerSession } from "@/lib/server-session";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
    include: { company: true, role: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const response = NextResponse.json({
    email: user.email,
    companyName: user.company.name,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role?.name ?? "ADMIN",
    status: "Active",
  });
  setServerSession(response, { id: user.id, companyId: user.companyId, role: user.role?.name ?? "ADMIN" });
  return response;
}