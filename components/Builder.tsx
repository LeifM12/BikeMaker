"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, CategoryId, Discipline, Part, Selection } from "@/lib/types";
import { compat, buildIsComplete } from "@/lib/compat";
import BikeCanvas from "./BikeCanvas";
import PartPicker from "./PartPicker";
import CategoryRow from "./CategoryRow";
import Summary from "./Summary";

interface Props {
  categories: Category[];
  parts: Part[];
  initialDiscipline: Discipline;
}

export default function Builder({ categories, parts, initialDiscipline }: Props) {
  const [discipline, setDiscipline] = useState<Discipline>(initialDiscipline);
  const [selection, setSelection] = useState<Selection>({});
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null);

  const partsByCategory = useMemo(() => {
    const m = new Map<CategoryId, Part[]>();
    for (const p of parts) {
      const list = m.get(p.category_id) ?? [];
      list.push(p);
      m.set(p.category_id, list);
    }
    return m;
  }, [parts]);

  const issues = compat.validate(selection, discipline);

  function changeDiscipline(d: Discipline) {
    if (d === discipline) return;
    if (Object.keys(selection).length === 0 || confirm("Switching discipline will clear your build. Continue?")) {
      setDiscipline(d);
      setSelection({});
    }
  }

  function pickPart(categoryId: CategoryId, part: Part) {
    setSelection((s) => ({ ...s, [categoryId]: part }));
    setOpenCategory(null);
  }

  function clearPart(categoryId: CategoryId) {
    setSelection((s) => {
      const n = { ...s };
      delete n[categoryId];
      return n;
    });
  }

  const openCat = openCategory ? categories.find((c) => c.id === openCategory) : null;
  const candidates = openCategory ? (partsByCategory.get(openCategory) ?? []) : [];

  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-900/80 bg-ink/80 px-4 py-3 backdrop-blur md:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-base">
          <span className="inline-block size-2 rounded-full bg-accent" />
          <span className="font-semibold">BikeMaker</span>
        </Link>
        <div className="flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 p-1 text-sm">
          <button
            onClick={() => changeDiscipline("enduro")}
            className={`rounded-full px-3 py-1 transition ${
              discipline === "enduro" ? "bg-bone text-ink" : "text-neutral-400 hover:text-bone"
            }`}
          >
            Enduro
          </button>
          <button
            onClick={() => changeDiscipline("downhill")}
            className={`rounded-full px-3 py-1 transition ${
              discipline === "downhill" ? "bg-bone text-ink" : "text-neutral-400 hover:text-bone"
            }`}
          >
            Downhill
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Canvas */}
        <section className="lg:sticky lg:top-20 lg:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-900 bg-gradient-to-b from-neutral-900/60 to-neutral-950 sm:aspect-[16/10]">
            <BikeCanvas selection={selection} discipline={discipline} />
            <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-neutral-900/80 px-3 py-1 text-[11px] uppercase tracking-widest text-neutral-400 backdrop-blur">
              {discipline === "enduro" ? "Enduro Build" : "Downhill Build"}
            </div>
          </div>

          {issues.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
              <div className="mb-2 font-medium">Compatibility issues</div>
              <ul className="space-y-1 text-amber-100/80">
                {issues.map((i, idx) => (
                  <li key={idx}>· {i.message}</li>
                ))}
              </ul>
            </div>
          )}

          <Summary
            categories={categories}
            selection={selection}
            discipline={discipline}
            complete={buildIsComplete(selection, categories)}
          />
        </section>

        {/* Categories list */}
        <section className="space-y-2">
          <h2 className="px-1 pb-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Components
          </h2>
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              selected={selection[cat.id]}
              onOpen={() => setOpenCategory(cat.id)}
              onClear={() => clearPart(cat.id)}
              issues={issues.filter((i) => i.blocks.includes(cat.id))}
            />
          ))}
        </section>
      </div>

      {openCat && (
        <PartPicker
          category={openCat}
          discipline={discipline}
          selection={selection}
          candidates={candidates}
          onPick={(p) => pickPart(openCat.id, p)}
          onClose={() => setOpenCategory(null)}
        />
      )}
    </main>
  );
}
