import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  slug: z.string().min(2, "Company slug is required").regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  tin: z.string().optional(),
  vatNumber: z.string().optional(),
  currency: z.string().min(3, "Currency code is required"),
});

export const userInviteSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MANAGER", "SALES", "DESIGNER", "PRODUCTION", "FINANCE", "DELIVERY"]),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  companyName: z.string().optional(),
  phone: z.string().min(6, "Phone is required").optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
  customerType: z.enum(["INDIVIDUAL", "COMPANY", "NGO", "GOVERNMENT", "AGENCY", "OTHER"]),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  sellingPrice: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const quotationSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"]),
  notes: z.string().optional(),
  total: z.number().min(0),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  quotationId: z.string().optional(),
  status: z.enum(["NEW", "CONFIRMED", "IN_PRODUCTION", "READY", "DELIVERED", "COMPLETED", "CANCELLED"]),
  dueDate: z.string().optional(),
  total: z.number().min(0),
  deposit: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  paid: z.number().min(0).default(0),
  balance: z.number().min(0).default(0),
});

export const paymentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceId: z.string().optional(),
  orderId: z.string().optional(),
  amount: z.number().min(1, "Payment amount is required"),
  method: z.enum(["CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER"]),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});
