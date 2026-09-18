"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { canAccessPath, readSession, signOut } from "@/lib/auth-session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState(readSession());

  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener("creative-business-os:session-updated", sync);
    return () => window.removeEventListener("creative-business-os:session-updated", sync);
  }, []);

  if (pathname === "/login") {
    return children;
  }

  if (!session?.isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Workspace access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to access the business system</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Why this account is required</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• Tenant isolation keeps each company data separate.</li>
              <li>• Roles control sales, design, production, finance, and delivery access.</li>
              <li>• Orders, payments, and job status stay connected to the same workspace.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <Link
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Continue to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessPath(session.role, pathname)) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Role restricted</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">This area is not assigned to your role</h1>
        <p className="mt-2 text-sm text-slate-300">Your {session.role} access is limited to the work areas shown in your navigation.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Back to overview</Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        <div>
          <div className="text-sm font-medium text-white">{session.name}</div>
          <div className="text-xs text-slate-400">{session.companyName} · {session.role}</div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
