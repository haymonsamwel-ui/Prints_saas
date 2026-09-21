"use client";

import { History } from "lucide-react";
import { useEffect, useState } from "react";

type AuditLog = { id: string; action: string; entityType: string; entityId: string | null; createdAt: string; userId: string | null };

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { fetch("/api/audit-logs").then((response) => response.ok ? response.json() : []).then(setLogs).catch(() => setLogs([])); }, []);
  return <div className="mx-auto max-w-7xl"><div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center gap-2"><History className="h-5 w-5 text-cyan-300" /><h1 className="text-3xl font-semibold text-white">Audit log</h1></div><p className="mt-2 text-sm text-slate-400">Review important changes made in this workspace.</p></div><section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-slate-400"><tr>{["Time", "Action", "Entity", "Record", "User"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-slate-800"><td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td><td className="px-4 py-3 text-emerald-300">{log.action}</td><td className="px-4 py-3 text-white">{log.entityType}</td><td className="px-4 py-3">{log.entityId || "-"}</td><td className="px-4 py-3">{log.userId || "System"}</td></tr>)}</tbody></table></div></section></div>;
}
