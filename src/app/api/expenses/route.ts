import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const expenses = await prisma.expense.findMany({ where: { companyId: session.companyId }, orderBy: { expenseDate: "desc" } });
  return NextResponse.json(expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    date: expense.expenseDate.toISOString().slice(0, 10),
    method: expense.paymentMethod,
    notes: expense.notes ?? "",
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  const amount = Number(body.amount);
  if (!body.title || !body.category || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Title, category, and a positive amount are required" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      companyId: session.companyId,
      title: String(body.title).trim(),
      category: body.category,
      amount,
      expenseDate: body.date ? new Date(body.date) : new Date(),
      paymentMethod: body.method || "CASH",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}