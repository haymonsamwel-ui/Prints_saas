"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath, readSession, signOut } from "@/lib/auth-session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(readSession());

  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener("creative-business-os:session-updated", sync);
    const guardWorkspaceHistory = () => {
      if (!readSession()?.isAuthenticated && window.location.pathname !== "/login" && !window.location.pathname.startsWith("/quote/")) {
        window.history.replaceState(null, "", "/login");
        router.replace("/login");
      }
    };
    window.addEventListener("popstate", guardWorkspaceHistory);
    window.addEventListener("pageshow", guardWorkspaceHistory);
    return () => {
      window.removeEventListener("creative-business-os:session-updated", sync);
      window.removeEventListener("popstate", guardWorkspaceHistory);
      window.removeEventListener("pageshow", guardWorkspaceHistory);
    };
  }, [router]);

  if (pathname === "/login" || pathname.startsWith("/quote/")) {
    return children;
  }

  if (!session?.isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Workspace access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to access the business system</h1>
          <Link href="/login" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            Continue to sign in
          </Link>
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
