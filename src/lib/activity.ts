import { prisma } from "@/lib/prisma";

export async function recordAudit(input: {
  companyId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      companyId: input.companyId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      previousValue: input.previousValue as object | undefined,
      newValue: input.newValue as object | undefined,
    },
  });
}

export async function createNotification(input: {
  companyId: string;
  type: "NEW_ORDER" | "PAYMENT_RECEIVED" | "LOW_STOCK" | "JOB_DEADLINE_APPROACHING" | "JOB_OVERDUE" | "QUOTATION_ACCEPTED" | "QUOTATION_EXPIRED" | "PAYMENT_OVERDUE";
  title: string;
  message: string;
}) {
  await prisma.notification.create({ data: { ...input, channel: "INTERNAL" } });
}
