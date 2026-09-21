import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sessionCookieName = "creative-business-os:session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  companyId: string;
  role: string;
  expiresAt: number;
};

export type ServerSession = { userId: string; companyId: string; role: string };

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for server sessions");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createPublicQuoteToken(quoteNumber: string, companyId: string) {
  return sign(`quotation:${companyId}:${quoteNumber}`);
}

export function verifyPublicQuoteToken(quoteNumber: string, companyId: string, token: string) {
  const expected = Buffer.from(createPublicQuoteToken(quoteNumber, companyId));
  const actual = Buffer.from(token);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function encode(payload: SessionPayload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function decode(value: string): SessionPayload | null {
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function getServerSession(request: Request): Promise<ServerSession | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookieName}=`));
  const token = cookie?.slice(sessionCookieName.length + 1);
  const payload = token ? decode(decodeURIComponent(token)) : null;
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, companyId: true, role: { select: { name: true } }, isActive: true },
  });
  if (!user || !user.isActive || user.companyId !== payload.companyId) return null;

  return { userId: user.id, companyId: user.companyId, role: user.role?.name ?? payload.role };
}

export async function authorizeRequest(request: Request, roles?: readonly string[]) {
  const session = await getServerSession(request);
  if (!session) return { session: null, error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  if (roles && !roles.includes(session.role)) {
    return { session: null, error: NextResponse.json({ error: "You do not have permission for this action" }, { status: 403 }) };
  }
  return { session, error: null };
}

export function setServerSession(response: NextResponse, user: { id: string; companyId: string; role: string }) {
  const token = encode({ userId: user.id, companyId: user.companyId, role: user.role, expiresAt: Date.now() + sessionLifetimeSeconds * 1000 });
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });
}

export function clearServerSession(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", { httpOnly: true, expires: new Date(0), path: "/" });
}
