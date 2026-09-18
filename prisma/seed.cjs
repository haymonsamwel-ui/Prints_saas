const { PrismaClient, RoleName, CustomerType, OrderStatus, PaymentMethod, ProductionStatus } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: "bk-prints" },
    update: {},
    create: {
      name: "BK Prints",
      slug: "bk-prints",
      email: "hello@bkprints.co.tz",
      phone: "+255 712 400 900",
      address: "Mikocheni, Dar es Salaam",
      currency: "TZS",
      tin: "142-849-221",
      vatNumber: "40-019284-B",
      settings: { create: { defaultTaxRate: 18 } },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN, description: "Full workspace access" },
  });

  await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: "admin@bkprints.co.tz" } },
    update: {},
    create: {
      companyId: company.id,
      roleId: adminRole.id,
      firstName: "BK",
      lastName: "Admin",
      email: "admin@bkprints.co.tz",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
    },
  });

  const customers = [
    { name: "Benson Media", companyName: "Benson Media", customerType: CustomerType.AGENCY, phone: "+255 754 112 430", email: "procurement@bensonmedia.co.tz" },
    { name: "Sunrise Tours", companyName: "Sunrise Tours", customerType: CustomerType.COMPANY, phone: "+255 713 557 808", email: "ops@sunrisetours.co.tz" },
    { name: "Apex Foods", companyName: "Apex Foods", customerType: CustomerType.COMPANY, phone: "+255 768 911 220", email: "marketing@apexfoods.co.tz" },
    { name: "Urban Sign Co.", companyName: "Urban Sign Co.", customerType: CustomerType.COMPANY, phone: "+255 689 301 004", email: "orders@urbansign.co.tz" },
  ];

  const customerRecords = {};
  for (const customer of customers) {
    customerRecords[customer.name] = await prisma.customer.upsert({
      where: { id: `${company.id}-${customer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: customer,
      create: { id: `${company.id}-${customer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, companyId: company.id, ...customer },
    });
  }

  const products = [
    { name: "Shopping bag printing", unit: "Piece", sellingPrice: 4500, costPrice: 2700 },
    { name: "Flex banner", unit: "Square meter", sellingPrice: 18000, costPrice: 10500 },
    { name: "T-shirt branding", unit: "Piece", sellingPrice: 22000, costPrice: 14000 },
    { name: "Vehicle branding", unit: "Project", sellingPrice: 950000, costPrice: 610000 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `${company.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: product,
      create: { id: `${company.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, companyId: company.id, ...product },
    });
  }

  const orderData = [
    { number: "ORD-1045", customer: "Benson Media", total: 1820000, paid: 900000, status: OrderStatus.IN_PRODUCTION },
    { number: "ORD-1046", customer: "Sunrise Tours", total: 2460000, paid: 2460000, status: OrderStatus.READY },
    { number: "ORD-1047", customer: "Apex Foods", total: 980000, paid: 140000, status: OrderStatus.CONFIRMED },
  ];

  for (const order of orderData) {
    const customer = customerRecords[order.customer];
    await prisma.order.upsert({
      where: { companyId_orderNumber: { companyId: company.id, orderNumber: order.number } },
      update: { total: order.total, amountPaid: order.paid, balance: order.total - order.paid, status: order.status },
      create: {
        companyId: company.id,
        customerId: customer.id,
        orderNumber: order.number,
        status: order.status,
        subtotal: order.total,
        total: order.total,
        amountPaid: order.paid,
        balance: order.total - order.paid,
        items: { create: { description: "Creative production service", quantity: 1, unitPrice: order.total, amount: order.total } },
      },
    });
  }

  const orders = await prisma.order.findMany({ where: { companyId: company.id } });
  for (const order of orders) {
    await prisma.productionJob.upsert({
      where: { id: `${company.id}-${order.orderNumber}-job` },
      update: {},
      create: { id: `${company.id}-${order.orderNumber}-job`, companyId: company.id, orderId: order.id, title: `${order.orderNumber} production job`, status: order.status === OrderStatus.READY ? ProductionStatus.READY : ProductionStatus.PRINTING, designStatus: "In progress", approvalStatus: "Approved" },
    });
  }

  const inventory = [
    ["Flex vinyl", "MAT-FLX-001", 18, 40],
    ["Sticker paper", "MAT-STK-002", 24, 35],
    ["Acrylic sheets", "MAT-ACR-003", 10, 20],
    ["T-shirt blanks", "MAT-TSH-004", 127, 50],
  ];
  for (const [name, sku, quantity, minStock] of inventory) {
    await prisma.inventoryItem.upsert({ where: { companyId_sku: { companyId: company.id, sku } }, update: { quantity, minStock }, create: { companyId: company.id, name, sku, unit: "Piece", quantity, minStock, costPrice: 10000 } });
  }

  const paymentOrder = orders.find((order) => order.orderNumber === "ORD-1045");
  if (paymentOrder) {
    await prisma.payment.upsert({ where: { id: `${company.id}-payment-1045` }, update: {}, create: { id: `${company.id}-payment-1045`, companyId: company.id, customerId: paymentOrder.customerId, orderId: paymentOrder.id, amount: 900000, method: PaymentMethod.MOBILE_MONEY, referenceNo: "RCT-2026-087" } });
  }

  console.log(`Seeded workspace ${company.name} (${company.id})`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
