import assert from "node:assert/strict";

function summarizeFinancials(orders, payments, expenses) {
  const sales = orders.reduce((sum, order) => sum + order.total, 0);
  const received = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const costs = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outstanding = orders.reduce((sum, order) => sum + order.balance, 0);
  return { sales, received, costs, estimatedProfit: sales - costs, outstanding };
}

function topCustomers(orders) {
  const totals = new Map();
  orders.forEach((order) => totals.set(order.customer.name, (totals.get(order.customer.name) ?? 0) + order.total));
  return [...totals.entries()].map(([name, sales]) => ({ name, sales })).sort((left, right) => right.sales - left.sales);
}

const orders = [
  { total: 1000, balance: 250, customer: { name: "Alpha" } },
  { total: 500, balance: 100, customer: { name: "Beta" } },
  { total: 250, balance: 0, customer: { name: "Alpha" } },
];
assert.deepEqual(summarizeFinancials(orders, [{ amount: 900 }], [{ amount: 300 }]), { sales: 1750, received: 900, costs: 300, estimatedProfit: 1450, outstanding: 350 });
assert.deepEqual(topCustomers(orders)[0], { name: "Alpha", sales: 1250 });
console.log("Core financial checks passed.");
