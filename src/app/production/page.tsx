"use client";

import { CheckCircle2, Clock3, Factory, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { productionJobs } from "@/lib/constants";

const statusLabels: Record<string, string> = {
  ORDER_CONFIRMED: "Order confirmed",
  DESIGNING: "Designing",
  DESIGN_APPROVAL: "Design approval",
  PRINTING: "Printing",
  FINISHING: "Finishing",
  QUALITY_CHECK: "Quality check",
  READY: "Ready",
  DELIVERED: "Delivered",
};

type JobStatus = keyof typeof statusLabels;
type ProductionJob = {
  job: string;
  order: string;
  customer: string;
  title: string;
  status: JobStatus;
  designer: string;
  deadline: string;
  approval: string;
};

export default function ProductionPage() {
  const [jobs, setJobs] = useState<ProductionJob[]>([...productionJobs]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Phase 3 operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Production jobs</h1>
          <p className="mt-2 text-sm text-slate-400">Track design approval, production progress, deadlines, and assigned staff.</p>
        </div>
        <ActionDialogButton
          label="New job"
          title="Create production job"
          description="Create a lightweight job record. Artwork files are never uploaded or stored here."
          submitLabel="Create job"
          fields={[
            { label: "Job title", name: "title", placeholder: "Shop signage package" },
            { label: "Order number", name: "order", placeholder: "ORD-1049" },
            { label: "Deadline", name: "deadline", type: "date" },
            { label: "Production notes", name: "notes", type: "textarea", placeholder: "Materials, finishing, or customer notes" },
          ]}
        >
          <Plus className="h-4 w-4" />
        </ActionDialogButton>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          { label: "Active jobs", value: jobs.length.toString(), Icon: Factory },
          { label: "Awaiting approval", value: jobs.filter((job) => job.status === "DESIGN_APPROVAL").length.toString(), Icon: Clock3 },
          { label: "Ready for pickup", value: "4", Icon: CheckCircle2 },
          { label: "Assigned designers", value: "2", Icon: UserRound },
        ].map(({ label, value, Icon }) => (
          <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon className="h-4 w-4 text-emerald-300" />
              {label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.job} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{job.job} · {job.order}</div>
                <h2 className="mt-2 text-xl font-semibold text-white">{job.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{job.customer}</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{statusLabels[job.status]}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                <div className="text-xs text-slate-500">Designer</div>
                <div className="mt-1 text-sm text-slate-200">{job.designer}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                <div className="text-xs text-slate-500">Deadline</div>
                <div className="mt-1 text-sm text-slate-200">{job.deadline}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                <div className="text-xs text-slate-500">Approval</div>
                <div className="mt-1 text-sm text-slate-200">{job.approval}</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {Object.keys(statusLabels).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setJobs((current) => current.map((item) => item.job === job.job ? { ...item, status: status as JobStatus } : item))}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${job.status === status ? "border-emerald-500 bg-emerald-500/15 text-emerald-300" : "border-slate-700 text-slate-400 hover:bg-slate-800"}`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
