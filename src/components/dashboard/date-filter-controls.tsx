"use client";

import { useState } from "react";

const dateFilters = ["Today", "This week", "This month", "Last month", "Custom range"];

export function DateFilterControls() {
  const [selected, setSelected] = useState("This month");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {dateFilters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => setSelected(filter)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            filter === selected
              ? "bg-emerald-500 text-slate-950"
              : "border border-slate-700 bg-slate-950/60 text-slate-300 hover:bg-slate-800"
          }`}
          aria-pressed={filter === selected}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
