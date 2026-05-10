"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Discipline, Part, Selection } from "@/lib/types";
import { compat } from "@/lib/compat";

interface Props {
  category: Category;
  discipline: Discipline;
  selection: Selection;
  candidates: Part[];
  onPick: (p: Part) => void;
  onClose: () => void;
}

export default function PartPicker({
  category,
  discipline,
  selection,
  candidates,
  onPick,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const { compatible, incompatible } = useMemo(() => {
    const ok: Part[] = [];
    const blocked: Part[] = [];
    const inDiscipline = candidates.filter((p) => p.disciplines.includes(discipline));
    const compatList = compat.filterCandidates(category.id, inDiscipline, selection, discipline);
    const compatIds = new Set(compatList.map((p) => p.id));
    for (const p of inDiscipline) {
      (compatIds.has(p.id) ? ok : blocked).push(p);
    }
    const q = query.trim().toLowerCase();
    const f = (xs: Part[]) =>
      q
        ? xs.filter(
            (p) =>
              p.brand.toLowerCase().includes(q) ||
              p.model.toLowerCase().includes(q) ||
              (p.variant ?? "").toLowerCase().includes(q),
          )
        : xs;
    return { compatible: f(ok), incompatible: f(blocked) };
  }, [candidates, category.id, discipline, selection, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        className="scroll-thin flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-neutral-800 bg-neutral-950 md:max-h-[80vh] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-900 p-5">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-neutral-500">
              Choose a part
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold">{category.label}</h2>
            {category.description && (
              <p className="mt-1 max-w-lg text-sm text-neutral-400">{category.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-800 px-3 py-1 text-sm text-neutral-400 hover:border-neutral-600 hover:text-bone"
          >
            Close
          </button>
        </header>

        <div className="border-b border-neutral-900 p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by brand or model..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto p-4">
          {compatible.length > 0 ? (
            <>
              <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Compatible · {compatible.length}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {compatible.map((p) => (
                  <PartCard key={p.id} part={p} category={category.id} onPick={() => onPick(p)} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-sm text-neutral-400">
              No compatible parts. Try changing earlier selections.
            </div>
          )}

          {incompatible.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer select-none text-xs text-neutral-500 hover:text-neutral-300">
                Show {incompatible.length} incompatible part{incompatible.length === 1 ? "" : "s"}
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-2 opacity-50 sm:grid-cols-2">
                {incompatible.map((p) => (
                  <PartCard
                    key={p.id}
                    part={p}
                    category={category.id}
                    onPick={() => onPick(p)}
                    incompatible
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function PartCard({
  part,
  category,
  onPick,
  incompatible,
}: {
  part: Part;
  category: string;
  onPick: () => void;
  incompatible?: boolean;
}) {
  return (
    <button
      onClick={onPick}
      className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition ${
        incompatible
          ? "border-neutral-900 hover:border-amber-700"
          : "border-neutral-800 hover:border-bone hover:bg-neutral-900"
      }`}
    >
      <div
        className="size-12 shrink-0 rounded-md border border-neutral-800"
        style={{ background: (part.attrs.color as string) ?? "#171717" }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] uppercase tracking-widest text-neutral-500">
          {part.brand}
        </div>
        <div className="truncate text-sm font-medium">{part.model}</div>
        {part.variant && (
          <div className="truncate text-xs text-neutral-500">{part.variant}</div>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] text-neutral-400">
          {summarizeAttrs(category, part.attrs).map((s, i) => (
            <span key={i} className="rounded bg-neutral-900 px-1.5 py-0.5">{s}</span>
          ))}
        </div>
      </div>
      <div className="text-right">
        {part.price_usd && (
          <div className="text-sm tabular-nums text-neutral-200">
            ${Math.round(Number(part.price_usd))}
          </div>
        )}
        {part.weight_g && (
          <div className="text-[10px] tabular-nums text-neutral-500">{part.weight_g} g</div>
        )}
      </div>
    </button>
  );
}

function summarizeAttrs(category: string, a: Record<string, unknown>): string[] {
  const out: string[] = [];
  switch (category) {
    case "frame":
      if (a.wheel_size) out.push(`${a.wheel_size}"`);
      if (a.travel_rear) out.push(`${a.travel_rear}mm`);
      if (a.rear_axle) out.push(String(a.rear_axle));
      if (a.bb) out.push(String(a.bb));
      break;
    case "fork":
      if (a.travel) out.push(`${a.travel}mm`);
      if (a.axle) out.push(String(a.axle));
      if (a.steerer) out.push(String(a.steerer));
      break;
    case "shock":
      if (a.e2e && a.stroke) out.push(`${a.e2e}×${a.stroke}`);
      if (a.mount) out.push(String(a.mount));
      if (a.spring) out.push(String(a.spring));
      break;
    case "wheelset":
      if (a.size_front && a.size_rear) {
        out.push(a.size_front === a.size_rear ? `${a.size_front}"` : `${a.size_front}/${a.size_rear} MX`);
      }
      if (a.freehub) out.push(String(a.freehub));
      if (a.rotor_mount) out.push(String(a.rotor_mount));
      break;
    case "tire_front":
    case "tire_rear":
      if (a.size && a.width) out.push(`${a.size}×${a.width}`);
      break;
    case "brakeset":
      if (a.pistons) out.push(`${a.pistons}-piston`);
      if (a.rotor_mount) out.push(String(a.rotor_mount));
      break;
    case "crank":
      if (a.length) out.push(`${a.length}mm`);
      if (a.bb) out.push(String(a.bb));
      if (a.brand) out.push(brandLabel(String(a.brand)));
      break;
    case "cassette":
      if (a.range) out.push(String(a.range));
      if (a.freehub) out.push(String(a.freehub));
      if (a.brand) out.push(brandLabel(String(a.brand)));
      break;
    case "chain":
    case "derailleur":
    case "shifter":
      if (a.speeds) out.push(`${a.speeds}-spd`);
      if (a.brand) out.push(brandLabel(String(a.brand)));
      break;
    case "handlebar":
      if (a.clamp_diameter) out.push(`${a.clamp_diameter}mm`);
      if (a.width) out.push(`${a.width}mm`);
      if (a.rise) out.push(`${a.rise}mm rise`);
      break;
    case "stem":
      if (a.bar_clamp) out.push(`${a.bar_clamp}mm`);
      if (a.length) out.push(`${a.length}mm`);
      if (a.steerer_clamp) out.push(String(a.steerer_clamp));
      break;
    case "headset":
      if (a.top && a.bottom) out.push(`${a.top}/${a.bottom}`);
      if (a.steerer) out.push(String(a.steerer));
      break;
    case "seatpost":
      if (a.diameter) out.push(`${a.diameter}mm`);
      if (a.travel && Number(a.travel) > 0) out.push(`${a.travel}mm drop`);
      else if (a.type === "rigid") out.push("rigid");
      break;
  }
  return out;
}

function brandLabel(b: string): string {
  if (b === "sram-t-type") return "SRAM T-Type";
  if (b === "sram-eagle") return "SRAM Eagle";
  if (b === "shimano-12") return "Shimano 12sp";
  return b;
}
