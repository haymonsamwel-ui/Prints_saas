import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const companySlug = new URL(request.url).searchParams.get("companySlug");

  if (!companySlug) {
    return NextResponse.json({ error: "Company workspace is required" }, { status: 400 });
  }

  return NextResponse.json(await getDashboardData(companySlug));
}
