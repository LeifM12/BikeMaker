"use client";

import { useState } from "react";
import type { CategoryId, Discipline, Part, Selection } from "@/lib/types";

interface Props {
  selection: Selection;
  discipline: Discipline;
}

const calloutOrder: { id: CategoryId; label: string }[] = [
  { id: "fork", label: "Fork" },
  { id: "shock", label: "Shock" },
  { id: "wheelset", label: "Wheels" },
  { id: "brakeset", label: "Brakes" },
  { id: "derailleur", label: "Drivetrain" },
  { id: "handlebar", label: "Cockpit" },
  { id: "seatpost", label: "Seatpost" },
  { id: "tire_rear", label: "Tire" },
];

export default function BikeCanvas({ selection, discipline }: Props) {
  const frame = selection.frame;
  const callouts = calloutOrder
    .map(({ id, label }) => ({ id, label, part: selection[id] }))
    .filter((c) => c.part);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative flex-1">
        {frame?.image_url ? (
          <FrameHero frame={frame} />
        ) : (
          <PlaceholderSVG discipline={discipline} />
        )}
      </div>

      {callouts.length > 0 && (
        <div className="scroll-thin shrink-0 overflow-x-auto border-t border-neutral-900 bg-neutral-950/80 px-3 py-2 backdrop-blur">
          <div className="flex gap-2">
            {callouts.map((c) => (
              <Callout key={c.id} label={c.label} part={c.part!} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FrameHero({ frame }: { frame: Part }) {
  const [errored, setErrored] = useState(false);
  if (errored || !frame.image_url) return <PlaceholderSVG discipline="enduro" />;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frame.image_url}
        alt={`${frame.brand} ${frame.model}`}
        className="absolute inset-0 h-full w-full object-contain p-6"
        onError={() => setErrored(true)}
        loading="eager"
      />
      <div className="absolute right-4 top-4 max-w-[55%] rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 backdrop-blur">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500">
          Frame
        </div>
        <div className="text-sm font-medium">
          {frame.brand} <span className="text-neutral-400">{frame.model}</span>
        </div>
      </div>
    </>
  );
}

function Callout({ label, part }: { label: string; part: Part }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-1.5 pr-3">
      <div className="size-9 shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
        {part.image_url && !errored ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={part.image_url}
            alt={part.brand}
            className="h-full w-full object-contain"
            onError={() => setErrored(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: (part.attrs.color as string) ?? "#171717" }}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-widest text-neutral-500">
          {label}
        </div>
        <div className="truncate text-xs font-medium">
          {part.brand}{" "}
          <span className="text-neutral-400">
            {part.model.length > 14 ? part.model.slice(0, 14) + "…" : part.model}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlaceholderSVG({ discipline }: { discipline: Discipline }) {
  const isDH = discipline === "downhill";
  return (
    <svg
      viewBox="0 0 800 500"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Bike preview placeholder"
    >
      <defs>
        <radialGradient id="floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="400" cy="470" rx="380" ry="22" fill="url(#floor)" />
      {/* Wheels */}
      <circle cx="180" cy="295" r="125" fill="none" stroke="#262626" strokeWidth="14" />
      <circle cx="180" cy="295" r="100" fill="none" stroke="#3f3f46" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx={isDH ? 660 : 640} cy="295" r="125" fill="none" stroke="#262626" strokeWidth="14" />
      <circle cx={isDH ? 660 : 640} cy="295" r="100" fill="none" stroke="#3f3f46" strokeOpacity="0.5" strokeWidth="2" />
      {/* Frame triangle (hint) */}
      <line x1="330" y1="360" x2="180" y2="295" stroke="#262626" strokeWidth="11" strokeLinecap="round" />
      <line x1="338" y1="205" x2="180" y2="295" stroke="#262626" strokeWidth="9" strokeLinecap="round" />
      <line x1="330" y1="360" x2="338" y2="205" stroke="#262626" strokeWidth="13" strokeLinecap="round" />
      <line x1="330" y1="360" x2="555" y2="235" stroke="#262626" strokeWidth="15" strokeLinecap="round" />
      <line x1="338" y1="205" x2="535" y2="175" stroke="#262626" strokeWidth="13" strokeLinecap="round" />
      <line x1="535" y1="175" x2="555" y2="235" stroke="#262626" strokeWidth="18" strokeLinecap="round" />
      {/* Fork */}
      {isDH ? (
        <>
          <line x1="555" y1="225" x2={660} y2="295" stroke="#262626" strokeWidth="9" strokeLinecap="round" />
          <line x1="565" y1="225" x2={660} y2="295" stroke="#262626" strokeWidth="9" strokeLinecap="round" />
        </>
      ) : (
        <line x1="555" y1="235" x2={640} y2="295" stroke="#262626" strokeWidth="11" strokeLinecap="round" />
      )}
      <text
        x="400"
        y="245"
        textAnchor="middle"
        fill="#525252"
        fontSize="14"
        fontFamily="ui-sans-serif, system-ui"
      >
        Pick a frame to start →
      </text>
    </svg>
  );
}
