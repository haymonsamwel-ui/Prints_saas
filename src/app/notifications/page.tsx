"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type Notification = { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    fetch("/api/notifications").then((response) => response.ok ? response.json() : []).then(setNotifications).catch(() => setNotifications([]));
  }, []);

  async function markRead(id: string) {
    const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, isRead: true } : notification));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center gap-2 text-slate-200"><Bell className="h-5 w-5 text-amber-300" /><h1 className="text-3xl font-semibold text-white">Notifications</h1></div><p className="mt-2 text-sm text-slate-400">Review workspace alerts and keep important operations visible.</p></div>
      <section className="space-y-3">{notifications.length ? notifications.map((notification) => <article key={notification.id} className={`rounded-2xl border p-4 ${notification.isRead ? "border-slate-800 bg-slate-900/60" : "border-amber-500/30 bg-amber-500/10"}`}><div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-white">{notification.title}</div><p className="mt-1 text-sm text-slate-300">{notification.message}</p><div className="mt-2 text-xs text-slate-500">{notification.type} · {new Date(notification.createdAt).toLocaleString()}</div></div>{!notification.isRead ? <button type="button" onClick={() => void markRead(notification.id)} className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Mark read</button> : null}</div></article>) : <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">No notifications yet.</div>}</section>
    </div>
  );
}