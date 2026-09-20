"use client";

import { Eye, EyeOff, UserPlus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type Field = {
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "email" | "number" | "date" | "password" | "textarea" | "select" | "customer";
  options?: string[];
};

export function ActionDialogButton({
  label,
  title,
  description,
  submitLabel,
  fields,
  children,
  size = "default",
  onSubmit,
  successMessage = "Saved successfully to the workspace.",
}: {
  label: string;
  title: string;
  description: string;
  submitLabel?: string;
  fields: Field[];
  children?: ReactNode;
  size?: "default" | "compact";
  onSubmit?: (formData: FormData) => void | Promise<void>;
  successMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [inlineCustomers, setInlineCustomers] = useState<Record<string, boolean>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  function closeDialog() {
    setOpen(false);
    setSubmitted(false);
    setError("");
    setInlineCustomers({});
    setVisiblePasswords({});
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-xl bg-emerald-500 font-semibold text-slate-950 transition hover:bg-emerald-400 ${
          size === "compact" ? "px-3 py-2 text-sm" : "px-4 py-2 text-sm"
        }`}
      >
        {children}
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {successMessage}
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  setError("");
                  event.preventDefault();
                  try {
                    await onSubmit?.(new FormData(event.currentTarget));
                    setSubmitted(true);
                  } catch (submissionError) {
                    setError(submissionError instanceof Error ? submissionError.message : "Unable to save this record.");
                  }
                }}
              >
                {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  {fields.map((field) => {
                    const isCreatingCustomer = inlineCustomers[field.name] ?? false;

                    if (field.type === "customer") {
                      return (
                        <div key={field.name} className="block md:col-span-2">
                          <span className="mb-2 block text-sm text-slate-300">{field.label}</span>
                          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                              <select
                                name={field.name}
                                disabled={isCreatingCustomer}
                                className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {field.options?.map((option) => (
                                  <option key={option}>{option}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() =>
                                  setInlineCustomers((current) => ({
                                    ...current,
                                    [field.name]: !isCreatingCustomer,
                                  }))
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 text-sm text-slate-200 transition hover:bg-slate-800"
                                aria-pressed={isCreatingCustomer}
                              >
                                <UserPlus className="h-4 w-4 text-emerald-300" />
                                {isCreatingCustomer ? "Use existing" : "New customer"}
                              </button>
                            </div>

                            {isCreatingCustomer ? (
                              <div className="grid gap-3 border-t border-slate-800 pt-3 md:grid-cols-2">
                                <input
                                  name={`${field.name}Name`}
                                  placeholder="Customer name"
                                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                                />
                                <select
                                  name={`${field.name}Type`}
                                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-emerald-500"
                                >
                                  {["INDIVIDUAL", "COMPANY", "NGO", "GOVERNMENT", "AGENCY", "OTHER"].map((option) => (
                                    <option key={option}>{option}</option>
                                  ))}
                                </select>
                                <input
                                  name={`${field.name}Phone`}
                                  placeholder="+255..."
                                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                                />
                                <input
                                  name={`${field.name}Email`}
                                  placeholder="orders@example.com"
                                  type="email"
                                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                                />
                                <input
                                  name={`${field.name}Address`}
                                  placeholder="Customer address"
                                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500 md:col-span-2"
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <label key={field.name} className={field.type === "textarea" ? "block md:col-span-2" : "block"}>
                        <span className="mb-2 block text-sm text-slate-300">{field.label}</span>
                        {field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            placeholder={field.placeholder}
                            className="min-h-28 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                          />
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-emerald-500"
                          >
                            {field.options?.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === "password" ? (
                          <span className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
                            <input
                              name={field.name}
                              placeholder={field.placeholder}
                              type={visiblePasswords[field.name] ? "text" : "password"}
                              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => setVisiblePasswords((current) => ({ ...current, [field.name]: !current[field.name] }))}
                              className="text-slate-400 hover:text-white"
                              aria-label={visiblePasswords[field.name] ? "Hide password" : "Show password"}
                            >
                              {visiblePasswords[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </span>
                        ) : (
                          <input
                            name={field.name}
                            placeholder={field.placeholder}
                            type={field.type ?? "text"}
                            className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
                    {submitLabel ?? "Save"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
