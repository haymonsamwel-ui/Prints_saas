import { OrderStatus, ProductionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const currency = new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 });

function money(value: number) {
  return `TSh ${currency.format(Math.round(value))}`;
}

function percentChange() {
  return "Live data";
}

export async function getDashboardData() {
  const company = await prisma.company.findUnique({
    where: { slug: "bk-prints" },
    include: {
      orders: { include: { customer: true }, orderBy: { orderDate: "desc" } },
      payments: true,
      jobs: true,
      inventory: true,
      expenses: true,
      customers: true,
      products: true,
    },
  });

  if (!company) {
    return {
      dashboardMetrics: [],
      salesSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      expenseSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      productionStatus: [],
      topProducts: [],
      recentOrders: [],
      lowStockItems: [],
      customerPipeline: [],
    };
  }

  const totalSales = company.orders.reduce((sum, order) => sum + order.total, 0);
  const totalPaid = company.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = company.orders.reduce((sum, order) => sum + order.balance, 0);
  const expenses = company.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const activeJobs = company.jobs.filter((job) => job.status !== ProductionStatus.DELIVERED).length;
  const lowStockItems = company.inventory
    .filter((item) => item.quantity <= item.minStock)
    .map((item) => ({ item: item.name, stock: item.quantity, minimum: item.minStock }));

  const productionCounts = company.jobs.reduce<Record<string, number>>((counts, job) => {
    counts[job.status] = (counts[job.status] ?? 0) + 1;
    return counts;
  }, {});

  const salesByMonth = Array.from({ length: 12 }, (_, month) =>
    company.orders
      .filter((order) => order.orderDate.getMonth() === month)
      .reduce((sum, order) => sum + order.total, 0),
  );
  const maxSales = Math.max(...salesByMonth, 1);

  const expenseByMonth = Array.from({ length: 12 }, (_, month) =>
    company.expenses
      .filter((expense) => expense.expenseDate.getMonth() === month)
      .reduce((sum, expense) => sum + expense.amount, 0),
  );
  const maxExpense = Math.max(...expenseByMonth, 1);

  const statuses = [
    ["DESIGNING", "Designing"],
    ["DESIGN_APPROVAL", "Approval"],
    ["PRINTING", "Printing"],
    ["FINISHING", "Finishing"],
    ["READY", "Ready"],
  ] as const;

  return {
    dashboardMetrics: [
      { label: "Total sales", value: money(totalSales), change: percentChange() },
      { label: "Amount paid", value: money(totalPaid), change: percentChange() },
      { label: "Outstanding balances", value: money(outstanding), change: percentChange() },
      { label: "Active production jobs", value: String(activeJobs), change: percentChange() },
      { label: "Expenses", value: money(expenses), change: percentChange() },
      { label: "Customers", value: String(company.customers.length), change: percentChange() },
      { label: "Orders", value: String(company.orders.length), change: percentChange() },
      { label: "Inventory alerts", value: String(lowStockItems.length), change: percentChange() },
      { label: "Products/services", value: String(company.products.length), change: percentChange() },
      { label: "Estimated profit", value: money(totalSales - expenses), change: percentChange() },
    ],
    salesSeries: salesByMonth.map((value) => Math.round((value / maxSales) * 100)),
    expenseSeries: expenseByMonth.map((value) => Math.round((value / maxExpense) * 100)),
    productionStatus: statuses.map(([status, label]) => ({ status: label, count: productionCounts[status] ?? 0 })),
    topProducts: company.products.map((product) => ({ name: product.name, sales: money(product.sellingPrice) })),
    recentOrders: company.orders.slice(0, 5).map((order) => ({
      order: order.orderNumber,
      customer: order.customer.name,
      total: money(order.total),
      status: order.status.replaceAll("_", " "),
    })),
    lowStockItems,
    customerPipeline: [
      { name: "Customers", value: company.customers.length, color: "bg-cyan-500" },
      { name: "Active orders", value: company.orders.filter((order) => order.status !== OrderStatus.COMPLETED).length, color: "bg-violet-500" },
      { name: "Completed orders", value: company.orders.filter((order) => order.status === OrderStatus.COMPLETED).length, color: "bg-emerald-500" },
    ],
  };
}
