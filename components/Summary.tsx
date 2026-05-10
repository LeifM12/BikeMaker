"use client";

import { useState } from "react";
import type { Category, Discipline, Selection } from "@/lib/types";

interface Props {
  categories: Category[];
  selection: Selection;
  discipline: Discipline;
  complete: boolean;
}

export default function Summary({ categories, selection, discipline, complete }: Props) {
  const parts = categories.map((c) => selection[c.id]).filter((p) => !!p);
  const totalPrice = parts.reduce((sum, p) => sum + Number(p?.price_usd ?? 0), 0);
  const totalWeight = parts.reduce((sum, p) => sum + Number(p?.weight_g ?? 0), 0);
  const fillCount = parts.length;

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          discipline,
          selections: Object.fromEntries(
            Object.entries(selection).map(([k, v]) => [k, v?.id]),
          ),
        }),
      });
      const json = await res.json();
      if (json.id) setSavedId(json.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-neutral-900 bg-gradient-to-b from-neutral-900/40 to-neutral-950 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-base font-medium">Build summary</h3>
        <div className="text-xs text-neutral-500">
          {fillCount}/{categories.length} parts
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">
            Total weight
          </div>
          <div className="mt-1 font-display text-2xl tabular-nums">
            {(totalWeight / 1000).toFixed(2)}{" "}
            <span className="text-sm text-neutral-500">kg</span>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">
            Total price
          </div>
          <div className="mt-1 font-display text-2xl tabular-nums">
            ${totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your build (e.g. Park Mullet)"
          className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
        <button
          onClick={save}
          disabled={!complete || !name.trim() || saving}
          className="rounded-xl bg-bone px-4 py-2 text-sm font-medium text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {saving ? "Saving..." : savedId ? "Saved ✓" : complete ? "Save build" : "Complete build to save"}
        </button>
      </div>
      {savedId && (
        <div className="mt-2 text-xs text-neutral-500">
          Build saved · id <code className="rounded bg-neutral-900 px-1 py-0.5">{savedId.slice(0, 8)}</code>
        </div>
      )}
    </div>
  );
}
