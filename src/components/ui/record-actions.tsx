"use client";

import { Pencil, Trash2, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

export type EditableField<TRecord extends Record<string, unknown>> = {
  label: string;
  name: keyof TRecord;
  type?: "text" | "email" | "number" | "date" | "textarea" | "select";
  options?: readonly string[];
};

export function RecordActions<TRecord extends Record<string, unknown>>({
  record,
  title,
  fields,
  onSave,
  onDelete,
}: {
  record: TRecord;
  title: string;
  fields: readonly EditableField<TRecord>[];
  onSave: (record: TRecord) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const updatedRecord = { ...record };

    fields.forEach((field) => {
      updatedRecord[field.name] = String(formData.get(String(field.name)) ?? "") as TRecord[keyof TRecord];
    });

    onSave(updatedRecord);
    setOpen(false);
  }

  function confirmDelete() {
    if (window.confirm(`Delete ${title}?`)) {
      onDelete();
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-cyan-300 transition hover:bg-slate-800"
          aria-label={`Edit ${title}`}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-rose-300 transition hover:bg-rose-500/10"
          aria-label={`Delete ${title}`}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Edit {title}</h2>
                <p className="mt-1 text-sm text-slate-400">Update this record for the current workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={submitEdit}>
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <label key={String(field.name)} className={field.type === "textarea" ? "block md:col-span-2" : "block"}>
                    <span className="mb-2 block text-sm text-slate-300">{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        name={String(field.name)}
                        defaultValue={String(record[field.name] ?? "")}
                        className="min-h-28 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={String(field.name)}
                        defaultValue={String(record[field.name] ?? "")}
                        className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-emerald-500"
                      >
                        {field.options?.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={String(field.name)}
                        defaultValue={String(record[field.name] ?? "")}
                        type={field.type ?? "text"}
                        className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
                  Save changes
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
