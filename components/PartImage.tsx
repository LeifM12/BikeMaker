"use client";

import { useState } from "react";
import type { Part } from "@/lib/types";

interface Props {
  part: Part | undefined;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}

const dims = {
  sm: "size-9",
  md: "size-12",
  lg: "size-20",
  hero: "h-full w-full",
};

export default function PartImage({ part, size = "md", className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const url = part?.image_url;
  const fallbackColor = (part?.attrs.color as string | undefined) ?? "#171717";

  const cls = `${dims[size]} ${className} relative shrink-0 overflow-hidden rounded-lg border border-neutral-800`;

  if (url && !errored) {
    return (
      <div className={cls} style={{ backgroundColor: "#0a0a0a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={part ? `${part.brand} ${part.model}` : ""}
          className="h-full w-full object-contain"
          onError={() => setErrored(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cls}
      style={{ background: fallbackColor }}
      aria-hidden="true"
    />
  );
}
