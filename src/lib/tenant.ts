import { Prisma } from "@prisma/client";

export function requireTenantId(companyId: string | null | undefined) {
  if (!companyId?.trim()) {
    throw new Error("A company tenant is required");
  }

  return companyId;
}

export function tenantFilter(companyId: string): Prisma.CompanyWhereInput {
  return { id: requireTenantId(companyId) };
}

export function tenantRecordFilter(companyId: string): Prisma.CustomerWhereInput {
  return { companyId: requireTenantId(companyId) };
}
