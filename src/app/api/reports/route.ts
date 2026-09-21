import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/server-session";
import { summarizeFinancials, topCustomers as getTopCustomers } from "@/lib/report-calculations";

export async function GET(request: Request) {
  const { session, error } = await authorizeRequest(request, ["ADMIN", "MANAGER", "FINANCE"]);
  if (error) return error;

  const [orders, payments, expenses, invoices] = await Promise.all([
    prisma.order.findMany({ where: { companyId: session.companyId }, select: { total: true, balance: true, orderDate: true, customer: { select: { name: true } } } }),
    prisma.payment.findMany({ where: { companyId: session.companyId }, select: { amount: true, paymentDate: true } }),
    prisma.expense.findMany({ where: { companyId: session.companyId }, select: { amount: true, expenseDate: true } }),
    prisma.invoice.findMany({ where: { companyId: session.companyId }, select: { total: true, balance: true } }),
  ]);

  const monthly = Array.from({ length: 12 }, (_, month) => ({
    month: month + 1,
    sales: orders.filter((order) => order.orderDate.getMonth() === month).reduce((sum, order) => sum + order.total, 0),
    payments: payments.filter((payment) => payment.paymentDate.getMonth() === month).reduce((sum, payment) => sum + payment.amount, 0),
    expenses: expenses.filter((expense) => expense.expenseDate.getMonth() === month).reduce((sum, expense) => sum + expense.amount, 0),
  }));

  const financials = summarizeFinancials(orders, payments, expenses);
  const topCustomers = getTopCustomers(orders);
  const totalSales = financials.sales;
  const totalPayments = financials.received;
  const totalExpenses = financials.costs;
  const outstandingOrders = orders.reduce((sum, order) => sum + order.balance, 0);
  const outstandingInvoices = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const rows = [
      ["Metric", "Amount"],
      ["Sales", totalSales],
      ["Payments", totalPayments],
      ["Expenses", totalExpenses],
      ["Estimated profit", totalSales - totalExpenses],
      ["Outstanding orders", outstandingOrders],
      ["Outstanding invoices", outstandingInvoices],
    ];
    return new NextResponse(rows.map((row) => row.join(",")).join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=business-report.csv" } });
  }

  return NextResponse.json({
    totals: {
      sales: totalSales,
      payments: totalPayments,
      expenses: totalExpenses,
      estimatedProfit: totalSales - totalExpenses,
      outstanding: outstandingOrders + outstandingInvoices,
    },
    monthly,
    topCustomers,
  });
}
