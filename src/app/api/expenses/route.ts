import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";
import { recordAudit } from "@/lib/activity";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "FINANCE"]);
  if (error) return error;

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
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "FINANCE"]);
  if (error) return error;
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
  await recordAudit({ companyId: session.companyId, userId: session.userId, action: "CREATE", entityType: "Expense", entityId: expense.id, newValue: { title: expense.title, amount: expense.amount, category: expense.category } });
  return NextResponse.json(expense, { status: 201 });
}