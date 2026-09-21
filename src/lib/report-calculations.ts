export type ReportOrder = { total: number; balance: number; orderDate: Date; customer: { name: string } };
export type ReportPayment = { amount: number; paymentDate: Date };
export type ReportExpense = { amount: number; expenseDate: Date };

export function summarizeFinancials(orders: ReportOrder[], payments: ReportPayment[], expenses: ReportExpense[]) {
  const sales = orders.reduce((sum, order) => sum + order.total, 0);
  const received = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const costs = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outstanding = orders.reduce((sum, order) => sum + order.balance, 0);
  return { sales, received, costs, estimatedProfit: sales - costs, outstanding };
}

export function topCustomers(orders: ReportOrder[], limit = 10) {
  const totals = new Map<string, number>();
  orders.forEach((order) => totals.set(order.customer.name, (totals.get(order.customer.name) ?? 0) + order.total));
  return [...totals.entries()].map(([name, sales]) => ({ name, sales })).sort((left, right) => right.sales - left.sales).slice(0, limit);
}
