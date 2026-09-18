export const roleOptions = [
  "ADMIN",
  "MANAGER",
  "SALES",
  "DESIGNER",
  "PRODUCTION",
  "FINANCE",
  "DELIVERY",
] as const;

export const companyProfile = {
  name: "BK Prints",
  slug: "bk-prints",
  email: "hello@bkprints.co.tz",
  phone: "+255 712 400 900",
  address: "Mikocheni, Dar es Salaam",
  currency: "TZS",
  tin: "142-849-221",
  vatNumber: "40-019284-B",
  invoicePrefix: "INV",
  quotationPrefix: "QTN",
  defaultTaxRate: 18,
} as const;

export const teamMembers = [
  { name: "BK Admin", email: "admin@bkprints.co.tz", role: "ADMIN", status: "Active" },
  { name: "Neema Sales", email: "sales@bkprints.co.tz", role: "SALES", status: "Active" },
  { name: "Amani Design", email: "design@bkprints.co.tz", role: "DESIGNER", status: "Active" },
  { name: "Peter Production", email: "production@bkprints.co.tz", role: "PRODUCTION", status: "Invited" },
] as const;

export const dashboardMetrics = [
  { label: "Today’s sales", value: "TSh 4.8M", change: "+12.4%" },
  { label: "This month’s sales", value: "TSh 31.2M", change: "+8.9%" },
  { label: "Pending payments", value: "TSh 6.7M", change: "-3.1%" },
  { label: "Outstanding balances", value: "TSh 11.3M", change: "-1.2%" },
  { label: "Active production jobs", value: "26", change: "+4" },
  { label: "Pending quotations", value: "18", change: "+7" },
  { label: "Pending approvals", value: "9", change: "+2" },
  { label: "Completed jobs", value: "42", change: "+14" },
  { label: "Expenses", value: "TSh 9.5M", change: "+6.1%" },
  { label: "Estimated profit", value: "TSh 18.1M", change: "+11.8%" },
] as const;

export const salesSeries = [62, 90, 74, 110, 96, 130, 146, 118, 164, 148, 180, 172];

export const expenseSeries = [38, 40, 52, 48, 56, 58, 72, 69, 74, 77, 68, 82];

export const topProducts = [
  { name: "Shopping bag printing", sales: "TSh 8.4M" },
  { name: "Flex banners", sales: "TSh 7.1M" },
  { name: "T-shirt branding", sales: "TSh 6.8M" },
  { name: "Sticker production", sales: "TSh 5.6M" },
  { name: "Vehicle branding", sales: "TSh 4.7M" },
];

export const productionStatus = [
  { status: "Designing", count: 8 },
  { status: "Approval", count: 5 },
  { status: "Printing", count: 9 },
  { status: "Finishing", count: 6 },
  { status: "Ready", count: 4 },
];

export const recentOrders = [
  { order: "#1045", customer: "Benson Media", total: "TSh 1,820,000", status: "In Production" },
  { order: "#1046", customer: "Sunrise Tours", total: "TSh 2,460,000", status: "Ready" },
  { order: "#1047", customer: "Apex Foods", total: "TSh 980,000", status: "Confirmed" },
  { order: "#1048", customer: "Urban Sign Co.", total: "TSh 3,640,000", status: "Delivered" },
];

export const lowStockItems = [
  { item: "Flex vinyl", stock: 18, minimum: 40 },
  { item: "Sticker paper", stock: 24, minimum: 35 },
  { item: "Acrylic sheets", stock: 10, minimum: 20 },
  { item: "T-shirt blanks", stock: 27, minimum: 50 },
];

export const customers = [
  {
    name: "Benson Media",
    type: "AGENCY",
    contact: "+255 754 112 430",
    email: "procurement@bensonmedia.co.tz",
    balance: "TSh 2,100,000",
    status: "Quoted",
    lastOrder: "Shop signage package",
  },
  {
    name: "Sunrise Tours",
    type: "COMPANY",
    contact: "+255 713 557 808",
    email: "ops@sunrisetours.co.tz",
    balance: "TSh 0",
    status: "Ready to order",
    lastOrder: "Vehicle branding",
  },
  {
    name: "Apex Foods",
    type: "COMPANY",
    contact: "+255 768 911 220",
    email: "marketing@apexfoods.co.tz",
    balance: "TSh 840,000",
    status: "In production",
    lastOrder: "Label stickers",
  },
  {
    name: "Urban Sign Co.",
    type: "COMPANY",
    contact: "+255 689 301 004",
    email: "orders@urbansign.co.tz",
    balance: "TSh 1,400,000",
    status: "Delivered",
    lastOrder: "Acrylic letters",
  },
] as const;

export const productCatalog = [
  {
    name: "Shopping bag printing",
    category: "Print",
    unit: "Piece",
    sellingPrice: "TSh 4,500",
    costPrice: "TSh 2,700",
    margin: "40%",
    status: "Active",
  },
  {
    name: "Flex banner",
    category: "Large format",
    unit: "Sqm",
    sellingPrice: "TSh 18,000",
    costPrice: "TSh 10,500",
    margin: "42%",
    status: "Active",
  },
  {
    name: "T-shirt branding",
    category: "Apparel",
    unit: "Piece",
    sellingPrice: "TSh 22,000",
    costPrice: "TSh 14,000",
    margin: "36%",
    status: "Active",
  },
  {
    name: "Vehicle branding",
    category: "Installation",
    unit: "Job",
    sellingPrice: "TSh 950,000",
    costPrice: "TSh 610,000",
    margin: "36%",
    status: "Active",
  },
] as const;

export const quotations = [
  {
    number: "QTN-2026-018",
    customer: "Benson Media",
    issueDate: "Sep 17, 2026",
    expiryDate: "Sep 24, 2026",
    subtotal: "TSh 1,542,373",
    tax: "TSh 277,627",
    total: "TSh 1,820,000",
    status: "SENT",
    items: ["Shop signage package", "Acrylic letters", "Installation"],
  },
  {
    number: "QTN-2026-019",
    customer: "Sunrise Tours",
    issueDate: "Sep 16, 2026",
    expiryDate: "Sep 23, 2026",
    subtotal: "TSh 2,084,746",
    tax: "TSh 375,254",
    total: "TSh 2,460,000",
    status: "ACCEPTED",
    items: ["Vehicle branding", "Reflective vinyl", "Site installation"],
  },
  {
    number: "QTN-2026-020",
    customer: "Apex Foods",
    issueDate: "Sep 15, 2026",
    expiryDate: "Sep 22, 2026",
    subtotal: "TSh 830,508",
    tax: "TSh 149,492",
    total: "TSh 980,000",
    status: "VIEWED",
    items: ["Label stickers", "Packaging mockup"],
  },
] as const;

export const salesOrders = [
  {
    number: "ORD-1045",
    customer: "Benson Media",
    source: "QTN-2026-018",
    dueDate: "Sep 21, 2026",
    total: "TSh 1,820,000",
    paid: "TSh 900,000",
    balance: "TSh 920,000",
    status: "IN_PRODUCTION",
  },
  {
    number: "ORD-1046",
    customer: "Sunrise Tours",
    source: "QTN-2026-019",
    dueDate: "Sep 20, 2026",
    total: "TSh 2,460,000",
    paid: "TSh 2,460,000",
    balance: "TSh 0",
    status: "READY",
  },
  {
    number: "ORD-1047",
    customer: "Apex Foods",
    source: "QTN-2026-020",
    dueDate: "Sep 23, 2026",
    total: "TSh 980,000",
    paid: "TSh 140,000",
    balance: "TSh 840,000",
    status: "CONFIRMED",
  },
] as const;

export const invoices = [
  {
    number: "INV-2026-041",
    customer: "Benson Media",
    order: "ORD-1045",
    issueDate: "Sep 17, 2026",
    total: "TSh 1,820,000",
    paid: "TSh 900,000",
    balance: "TSh 920,000",
    status: "PARTIAL",
  },
  {
    number: "INV-2026-042",
    customer: "Sunrise Tours",
    order: "ORD-1046",
    issueDate: "Sep 16, 2026",
    total: "TSh 2,460,000",
    paid: "TSh 2,460,000",
    balance: "TSh 0",
    status: "PAID",
  },
  {
    number: "INV-2026-043",
    customer: "Urban Sign Co.",
    order: "ORD-1048",
    issueDate: "Sep 12, 2026",
    total: "TSh 3,640,000",
    paid: "TSh 2,240,000",
    balance: "TSh 1,400,000",
    status: "OVERDUE",
  },
] as const;

export const payments = [
  {
    receipt: "RCT-2026-088",
    customer: "Sunrise Tours",
    invoice: "INV-2026-042",
    date: "Sep 17, 2026",
    method: "BANK",
    amount: "TSh 1,200,000",
    balanceAfter: "TSh 0",
  },
  {
    receipt: "RCT-2026-087",
    customer: "Benson Media",
    invoice: "INV-2026-041",
    date: "Sep 16, 2026",
    method: "MOBILE_MONEY",
    amount: "TSh 900,000",
    balanceAfter: "TSh 920,000",
  },
  {
    receipt: "RCT-2026-086",
    customer: "Urban Sign Co.",
    invoice: "INV-2026-043",
    date: "Sep 14, 2026",
    method: "CASH",
    amount: "TSh 640,000",
    balanceAfter: "TSh 1,400,000",
  },
] as const;

export const productionJobs = [
  {
    job: "JOB-2026-031",
    order: "ORD-1045",
    customer: "Benson Media",
    title: "Shop signage package",
    status: "PRINTING",
    designer: "Amani Design",
    deadline: "Sep 21, 2026",
    approval: "Approved",
  },
  {
    job: "JOB-2026-032",
    order: "ORD-1046",
    customer: "Sunrise Tours",
    title: "Vehicle branding",
    status: "QUALITY_CHECK",
    designer: "Amani Design",
    deadline: "Sep 20, 2026",
    approval: "Approved",
  },
  {
    job: "JOB-2026-033",
    order: "ORD-1047",
    customer: "Apex Foods",
    title: "Label sticker run",
    status: "DESIGN_APPROVAL",
    designer: "Amani Design",
    deadline: "Sep 23, 2026",
    approval: "Waiting on customer",
  },
] as const;

export const inventoryItems = [
  { item: "Flex vinyl", sku: "MAT-FLX-001", unit: "Sqm", onHand: 18, minimum: 40, supplier: "Print Supply Co.", status: "Low stock" },
  { item: "Sticker paper", sku: "MAT-STK-002", unit: "Roll", onHand: 24, minimum: 35, supplier: "Paper House", status: "Low stock" },
  { item: "Acrylic sheets", sku: "MAT-ACR-003", unit: "Sheet", onHand: 10, minimum: 20, supplier: "Sign Materials Ltd.", status: "Low stock" },
  { item: "T-shirt blanks", sku: "MAT-TSH-004", unit: "Piece", onHand: 127, minimum: 50, supplier: "Apparel Source", status: "Healthy" },
] as const;
