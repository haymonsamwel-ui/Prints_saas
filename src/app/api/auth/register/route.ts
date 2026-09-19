import { RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const companyName = String(body.companyName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  if (!name || !companyName || !email || password.length < 8 || !slug) {
    return NextResponse.json({ error: "Name, company, email, and an 8-character password are required" }, { status: 400 });
  }

  try {
    const role = await prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN, description: "Full workspace access" },
    });
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug,
        email,
        settings: { create: {} },
      },
    });
    const [firstName, ...lastNameParts] = name.split(" ");
    const user = await prisma.user.create({
      data: {
        companyId: company.id,
        roleId: role.id,
        firstName,
        lastName: lastNameParts.join(" "),
        email,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });

    return NextResponse.json({ companyId: company.id, userId: user.id }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "A workspace with this company name or email already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to create workspace" }, { status: 500 });
  }
}
