import type { Category, CompatIssue, Part } from "@/lib/types";

interface Props {
  category: Category;
  selected: Part | undefined;
  onOpen: () => void;
  onClear: () => void;
  issues: CompatIssue[];
}

export default function CategoryRow({
  category,
  selected,
  onOpen,
  onClear,
  issues,
}: Props) {
  const hasIssue = issues.length > 0;
  return (
    <div
      className={`group flex items-center justify-between gap-3 rounded-2xl border bg-neutral-900/30 p-3 transition hover:bg-neutral-900/60 ${
        hasIssue ? "border-amber-700/60" : "border-neutral-900"
      }`}
    >
      <button onClick={onOpen} className="flex flex-1 items-center gap-3 text-left">
        <div
          className="size-9 shrink-0 rounded-lg border border-neutral-800"
          style={{
            background: (selected?.attrs.color as string) ?? "#171717",
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">
            {category.label}
          </div>
          {selected ? (
            <div className="truncate text-sm">
              <span className="text-neutral-400">{selected.brand}</span>{" "}
              <span className="font-medium">{selected.model}</span>
              {selected.variant && (
                <span className="text-neutral-500"> · {selected.variant}</span>
              )}
            </div>
          ) : (
            <div className="truncate text-sm text-neutral-500">Choose a {category.label.toLowerCase()}</div>
          )}
        </div>
        <div className="text-right">
          {selected?.price_usd ? (
            <div className="text-sm tabular-nums text-neutral-300">
              ${Math.round(Number(selected.price_usd))}
            </div>
          ) : (
            <span className="text-xs text-neutral-600 group-hover:text-neutral-300">
              Pick →
            </span>
          )}
        </div>
      </button>
      {selected && (
        <button
          onClick={onClear}
          className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-bone"
          aria-label="Clear selection"
        >
          ×
        </button>
      )}
    </div>
  );
}
