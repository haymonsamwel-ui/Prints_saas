import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard-data";
import { getServerSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json(await getDashboardData(session.companyId));
}
