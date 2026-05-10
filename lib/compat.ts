import type {
  CategoryId,
  CompatIssue,
  Discipline,
  Part,
  Selection,
} from "./types";

type A = Record<string, unknown>;
const a = (p: Part | undefined) => (p?.attrs ?? {}) as A;

const eq = (x: unknown, y: unknown) =>
  x !== undefined && y !== undefined && String(x) === String(y);

const hasIntersection = <T,>(xs: T[] | undefined, ys: T[] | undefined) =>
  !!xs && !!ys && xs.some((x) => ys.includes(x));

// Mullet means a 29" front wheel and 27.5" rear wheel.
// A "mullet" frame accepts a 29" fork. A "mullet" wheelset has size_front=29, size_rear=275.
const wheelSizeMatch = (
  frameSize: string | undefined,
  forkOrWheelSize: string | undefined,
) => {
  if (!frameSize || !forkOrWheelSize) return true;
  if (frameSize === "mullet") return forkOrWheelSize === "29" || forkOrWheelSize === "mullet";
  return frameSize === forkOrWheelSize;
};

export interface Compat {
  filterCandidates(
    target: CategoryId,
    candidates: Part[],
    selection: Selection,
    discipline: Discipline,
  ): Part[];
  validate(selection: Selection, discipline: Discipline): CompatIssue[];
}

export const compat: Compat = {
  filterCandidates(target, candidates, sel, discipline) {
    return candidates.filter((part) => {
      // Always filter by discipline first
      if (!part.disciplines.includes(discipline)) return false;
      return checks.every((rule) => rule.allowsCandidate(target, part, sel));
    });
  },
  validate(sel, discipline) {
    const issues: CompatIssue[] = [];
    for (const rule of checks) {
      const r = rule.validate?.(sel, discipline);
      if (r) issues.push(...r);
    }
    return issues;
  },
};

interface Rule {
  allowsCandidate(target: CategoryId, part: Part, sel: Selection): boolean;
  validate?(sel: Selection, discipline: Discipline): CompatIssue[];
}

// helper: for a candidate, check it against a rule that compares two attrs across categories
const pairRule = (
  catA: CategoryId,
  attrA: string,
  catB: CategoryId,
  attrB: string,
  message: string,
  comparator: (x: unknown, y: unknown) => boolean = eq,
): Rule => ({
  allowsCandidate(target, part, sel) {
    if (target === catA) {
      const other = sel[catB];
      if (!other) return true;
      return comparator(part.attrs[attrA], other.attrs[attrB]);
    }
    if (target === catB) {
      const other = sel[catA];
      if (!other) return true;
      return comparator(other.attrs[attrA], part.attrs[attrB]);
    }
    return true;
  },
  validate(sel) {
    const x = sel[catA];
    const y = sel[catB];
    if (!x || !y) return [];
    if (!comparator(x.attrs[attrA], y.attrs[attrB])) {
      return [{ message, blocks: [catA, catB] }];
    }
    return [];
  },
});

const checks: Rule[] = [
  // Frame ↔ Fork wheel size
  {
    allowsCandidate(target, part, sel) {
      if (target === "fork" && sel.frame) {
        return wheelSizeMatch(
          sel.frame.attrs.wheel_size as string,
          part.attrs.wheel_size as string,
        );
      }
      if (target === "frame" && sel.fork) {
        return wheelSizeMatch(
          part.attrs.wheel_size as string,
          sel.fork.attrs.wheel_size as string,
        );
      }
      return true;
    },
    validate(sel) {
      if (
        sel.frame &&
        sel.fork &&
        !wheelSizeMatch(
          sel.frame.attrs.wheel_size as string,
          sel.fork.attrs.wheel_size as string,
        )
      ) {
        return [
          {
            message: `Frame wheel size (${sel.frame.attrs.wheel_size}) doesn't fit fork wheel size (${sel.fork.attrs.wheel_size})`,
            blocks: ["frame", "fork"],
          },
        ];
      }
      return [];
    },
  },

  // Frame rear axle ↔ Wheelset rear hub
  pairRule(
    "frame",
    "rear_axle",
    "wheelset",
    "hub_axle_rear",
    "Frame rear axle and rear hub axle must match",
  ),

  // Fork axle ↔ Wheelset front hub
  pairRule(
    "fork",
    "axle",
    "wheelset",
    "hub_axle_front",
    "Fork axle and front hub axle must match",
  ),

  // Frame BB ↔ Crank BB
  pairRule(
    "frame",
    "bb",
    "crank",
    "bb",
    "Bottom bracket standard mismatch between frame and crankset",
  ),

  // Frame seat tube ↔ Seatpost
  pairRule(
    "frame",
    "seattube_diameter",
    "seatpost",
    "diameter",
    "Seatpost diameter must match the frame seat tube",
  ),

  // Frame headtube ↔ Headset (top + bottom)
  pairRule(
    "frame",
    "headtube_top",
    "headset",
    "top",
    "Headset upper cup doesn't match frame headtube",
  ),
  pairRule(
    "frame",
    "headtube_bottom",
    "headset",
    "bottom",
    "Headset lower cup doesn't match frame headtube",
  ),

  // Fork steerer ↔ Headset steerer
  pairRule(
    "fork",
    "steerer",
    "headset",
    "steerer",
    "Headset steerer size must match the fork steerer",
  ),

  // Fork steerer ↔ Stem steerer clamp
  pairRule(
    "fork",
    "steerer",
    "stem",
    "steerer_clamp",
    "Stem steerer clamp must match the fork steerer",
  ),

  // Stem ↔ Handlebar clamp
  pairRule(
    "stem",
    "bar_clamp",
    "handlebar",
    "clamp_diameter",
    "Stem bar clamp must match handlebar clamp diameter",
  ),

  // Cassette freehub ↔ Wheelset freehub
  pairRule(
    "cassette",
    "freehub",
    "wheelset",
    "freehub",
    "Cassette freehub body must match the rear hub",
  ),

  // Speeds across drivetrain
  pairRule(
    "cassette",
    "speeds",
    "chain",
    "speeds",
    "Chain speeds must match cassette speeds",
  ),
  pairRule(
    "cassette",
    "speeds",
    "derailleur",
    "speeds",
    "Derailleur speeds must match cassette speeds",
  ),
  pairRule(
    "shifter",
    "speeds",
    "derailleur",
    "speeds",
    "Shifter speeds must match derailleur speeds",
  ),
  pairRule(
    "shifter",
    "brand",
    "derailleur",
    "brand",
    "Shifter and derailleur must be the same brand/system",
  ),

  // Brake rotor mount ↔ Wheelset rotor mount
  pairRule(
    "brakeset",
    "rotor_mount",
    "wheelset",
    "rotor_mount",
    "Brake rotor mount must match the wheel hub rotor mount",
  ),

  // Frame rear shock fitment
  {
    allowsCandidate(target, part, sel) {
      if (target === "shock" && sel.frame) {
        return (
          eq(part.attrs.e2e, sel.frame.attrs.shock_e2e) &&
          eq(part.attrs.stroke, sel.frame.attrs.shock_stroke) &&
          eq(part.attrs.mount, sel.frame.attrs.shock_mount)
        );
      }
      if (target === "frame" && sel.shock) {
        return (
          eq(part.attrs.shock_e2e, sel.shock.attrs.e2e) &&
          eq(part.attrs.shock_stroke, sel.shock.attrs.stroke) &&
          eq(part.attrs.shock_mount, sel.shock.attrs.mount)
        );
      }
      return true;
    },
    validate(sel) {
      if (!sel.frame || !sel.shock) return [];
      const f = a(sel.frame);
      const s = a(sel.shock);
      if (
        !eq(f.shock_e2e, s.e2e) ||
        !eq(f.shock_stroke, s.stroke) ||
        !eq(f.shock_mount, s.mount)
      ) {
        return [
          {
            message: `Shock (${s.e2e}×${s.stroke} ${s.mount}) doesn't fit frame (${f.shock_e2e}×${f.shock_stroke} ${f.shock_mount})`,
            blocks: ["frame", "shock"],
          },
        ];
      }
      return [];
    },
  },

  // Front tire ↔ Fork wheel size + max width
  {
    allowsCandidate(target, part, sel) {
      if (target === "tire_front") {
        const fork = sel.fork;
        const ws = sel.wheelset;
        if (fork) {
          if (!wheelSizeMatch(fork.attrs.wheel_size as string, part.attrs.size as string)) return false;
          const max = Number(fork.attrs.max_tire_width ?? 99);
          if (Number(part.attrs.width ?? 0) > max) return false;
        }
        if (ws && !wheelSizeMatch(ws.attrs.size_front as string, part.attrs.size as string)) return false;
      }
      return true;
    },
    validate(sel) {
      const tire = sel.tire_front;
      if (!tire) return [];
      const issues: CompatIssue[] = [];
      if (sel.fork) {
        if (!wheelSizeMatch(sel.fork.attrs.wheel_size as string, tire.attrs.size as string)) {
          issues.push({
            message: `Front tire size (${tire.attrs.size}) doesn't fit fork (${sel.fork.attrs.wheel_size})`,
            blocks: ["tire_front", "fork"],
          });
        }
        const max = Number(sel.fork.attrs.max_tire_width ?? 99);
        if (Number(tire.attrs.width ?? 0) > max) {
          issues.push({
            message: `Front tire width ${tire.attrs.width}" exceeds fork max ${max}"`,
            blocks: ["tire_front", "fork"],
          });
        }
      }
      return issues;
    },
  },

  // Rear tire ↔ Frame wheel size + max width
  {
    allowsCandidate(target, part, sel) {
      if (target === "tire_rear") {
        const frame = sel.frame;
        const ws = sel.wheelset;
        if (frame) {
          const frameRear =
            frame.attrs.wheel_size === "mullet" ? "275" : (frame.attrs.wheel_size as string);
          if (!wheelSizeMatch(frameRear, part.attrs.size as string)) return false;
          const max = Number(frame.attrs.max_tire_width ?? 99);
          if (Number(part.attrs.width ?? 0) > max) return false;
        }
        if (ws && !wheelSizeMatch(ws.attrs.size_rear as string, part.attrs.size as string)) return false;
      }
      return true;
    },
    validate(sel) {
      const tire = sel.tire_rear;
      if (!tire) return [];
      const issues: CompatIssue[] = [];
      if (sel.frame) {
        const frameRear =
          sel.frame.attrs.wheel_size === "mullet"
            ? "275"
            : (sel.frame.attrs.wheel_size as string);
        if (!wheelSizeMatch(frameRear, tire.attrs.size as string)) {
          issues.push({
            message: `Rear tire size (${tire.attrs.size}) doesn't fit frame (${sel.frame.attrs.wheel_size})`,
            blocks: ["tire_rear", "frame"],
          });
        }
        const max = Number(sel.frame.attrs.max_tire_width ?? 99);
        if (Number(tire.attrs.width ?? 0) > max) {
          issues.push({
            message: `Rear tire width ${tire.attrs.width}" exceeds frame max ${max}"`,
            blocks: ["tire_rear", "frame"],
          });
        }
      }
      return issues;
    },
  },

  // Wheelset overall sizes match frame layout (mullet vs 29 vs 27.5)
  {
    allowsCandidate(target, part, sel) {
      if (target !== "wheelset" || !sel.frame) return true;
      const fs = sel.frame.attrs.wheel_size as string;
      const wf = part.attrs.size_front as string;
      const wr = part.attrs.size_rear as string;
      if (fs === "mullet") return wf === "29" && wr === "275";
      return wf === fs && wr === fs;
    },
    validate(sel) {
      if (!sel.frame || !sel.wheelset) return [];
      const fs = sel.frame.attrs.wheel_size as string;
      const wf = sel.wheelset.attrs.size_front as string;
      const wr = sel.wheelset.attrs.size_rear as string;
      const ok = fs === "mullet" ? wf === "29" && wr === "275" : wf === fs && wr === fs;
      return ok
        ? []
        : [
            {
              message: `Wheelset (F:${wf} R:${wr}) doesn't match frame (${fs})`,
              blocks: ["wheelset", "frame"],
            },
          ];
    },
  },
];

export function buildIsComplete(sel: Selection, cats: { id: CategoryId; required: boolean }[]) {
  return cats.filter((c) => c.required).every((c) => sel[c.id]);
}
