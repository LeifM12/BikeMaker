"use client";

import type { Discipline, Part, Selection } from "@/lib/types";

interface Props {
  selection: Selection;
  discipline: Discipline;
}

const ghost = "#262626";

const color = (p: Part | undefined, fallback = ghost) =>
  ((p?.attrs.color as string | undefined) ?? fallback);

export default function BikeCanvas({ selection, discipline }: Props) {
  const isDH = discipline === "downhill";
  const frame = selection.frame;
  const fork = selection.fork;
  const shock = selection.shock;
  const wheel = selection.wheelset;
  const tireF = selection.tire_front;
  const tireR = selection.tire_rear;
  const bar = selection.handlebar;
  const stem = selection.stem;
  const saddle = selection.saddle;
  const seatpost = selection.seatpost;
  const crank = selection.crank;

  // Mullet detection
  const ws = wheel?.attrs.size_rear ?? frame?.attrs.wheel_size;
  const mullet = ws === "275" || frame?.attrs.wheel_size === "mullet";

  const frameColor = color(frame);
  const forkColor = color(fork, frameColor);
  const wheelColor = color(wheel, "#3f3f46");
  const tireFColor = "#0a0a0a";
  const tireRColor = "#0a0a0a";
  const tireFWidth = Math.max(8, Math.min(16, Number(tireF?.attrs.width ?? 2.4) * 5.5));
  const tireRWidth = Math.max(8, Math.min(16, Number(tireR?.attrs.width ?? 2.4) * 5.5));
  const saddleColor = color(saddle, "#1a1a1a");
  const barColor = color(bar, "#1a1a1a");
  const seatpostColor = color(seatpost, "#1a1a1a");
  const crankColor = color(crank, "#1a1a1a");

  // Geometry
  const rearR = mullet ? 110 : 125;
  const frontR = 125;
  const groundY = 420;
  const rearCx = 180;
  const rearCy = groundY - rearR;
  const frontCx = isDH ? 660 : 640;
  const frontCy = groundY - frontR;

  // Frame triangle (XC-ish enduro geometry; DH a bit slacker/longer)
  const bbX = isDH ? 320 : 330;
  const bbY = groundY - 60;
  const headTopX = isDH ? 555 : 535;
  const headTopY = isDH ? 195 : 175;
  const headBotX = isDH ? 575 : 555;
  const headBotY = isDH ? 250 : 235;
  const seatTopX = bbX + 8;
  const seatTopY = isDH ? 230 : 205;
  // For DH the seat tube is shorter (rigid post), enduro has long dropper
  const saddleY = isDH ? seatTopY - 10 : seatTopY - 70;
  const saddleX = seatTopX - 10;

  // Fork: single-crown for enduro, dual-crown for DH
  const forkCrownTopY = headTopY - 10;
  const forkCrownBotY = headBotY + 10;

  return (
    <svg
      viewBox="0 0 800 500"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Bike preview"
    >
      <defs>
        <radialGradient id="floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wheelColor} stopOpacity="1" />
          <stop offset="100%" stopColor={wheelColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="400" cy={groundY + 50} rx="380" ry="22" fill="url(#floor)" />

      {/* Wheels: tire ring + rim + spokes */}
      <Wheel
        cx={rearCx}
        cy={rearCy}
        r={rearR}
        tireWidth={tireRWidth}
        tireColor={tireRColor}
        rimColor={wheelColor}
      />
      <Wheel
        cx={frontCx}
        cy={frontCy}
        r={frontR}
        tireWidth={tireFWidth}
        tireColor={tireFColor}
        rimColor={wheelColor}
      />

      {/* Brake rotors */}
      <circle cx={rearCx} cy={rearCy} r="38" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
      <circle cx={frontCx} cy={frontCy} r="40" fill="none" stroke="#3f3f46" strokeWidth="1.5" />

      {/* Chain stays */}
      <line x1={bbX} y1={bbY} x2={rearCx} y2={rearCy} stroke={frameColor} strokeWidth="11" strokeLinecap="round" />
      {/* Seat stays */}
      <line x1={seatTopX} y1={seatTopY} x2={rearCx} y2={rearCy} stroke={frameColor} strokeWidth="9" strokeLinecap="round" />
      {/* Seat tube */}
      <line x1={bbX} y1={bbY} x2={seatTopX} y2={seatTopY} stroke={frameColor} strokeWidth="13" strokeLinecap="round" />
      {/* Down tube */}
      <line x1={bbX} y1={bbY} x2={headBotX} y2={headBotY} stroke={frameColor} strokeWidth="15" strokeLinecap="round" />
      {/* Top tube */}
      <line x1={seatTopX} y1={seatTopY} x2={headTopX} y2={headTopY} stroke={frameColor} strokeWidth="13" strokeLinecap="round" />
      {/* Head tube */}
      <line x1={headTopX} y1={headTopY} x2={headBotX} y2={headBotY} stroke={frameColor} strokeWidth="18" strokeLinecap="round" />

      {/* Rear shock (between top tube/seat stay area) */}
      {isDH ? (
        <ShockLine x1={bbX + 30} y1={bbY - 30} x2={seatTopX + 10} y2={seatTopY + 30} color={color(shock, "#404040")} thick />
      ) : (
        <ShockLine x1={bbX + 5} y1={bbY - 50} x2={seatTopX + 5} y2={seatTopY + 30} color={color(shock, "#404040")} />
      )}

      {/* Fork */}
      {isDH ? (
        <>
          {/* Dual crown */}
          <rect x={headBotX - 18} y={forkCrownTopY - 10} width="40" height="10" rx="2" fill={forkColor} />
          <rect x={headBotX - 18} y={forkCrownBotY} width="40" height="10" rx="2" fill={forkColor} />
          {/* Stanchion + lowers */}
          <line x1={headBotX - 8} y1={forkCrownBotY + 10} x2={frontCx - 4} y2={frontCy} stroke={forkColor} strokeWidth="9" strokeLinecap="round" />
          <line x1={headBotX + 12} y1={forkCrownBotY + 10} x2={frontCx + 4} y2={frontCy} stroke={forkColor} strokeWidth="9" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Single crown stanchion */}
          <line x1={headBotX} y1={headBotY} x2={frontCx} y2={frontCy} stroke={forkColor} strokeWidth="11" strokeLinecap="round" />
        </>
      )}

      {/* Stem */}
      <line x1={headTopX} y1={headTopY} x2={headTopX + 32} y2={headTopY - 18} stroke={color(stem, "#262626")} strokeWidth="9" strokeLinecap="round" />
      {/* Bar */}
      <line x1={headTopX + 32} y1={headTopY - 28} x2={headTopX + 32} y2={headTopY - 8} stroke={barColor} strokeWidth="6" strokeLinecap="round" />
      {/* Bar grip */}
      <circle cx={headTopX + 32} cy={headTopY - 32} r="6" fill={barColor} />

      {/* Seatpost + saddle */}
      <line x1={seatTopX} y1={seatTopY} x2={saddleX} y2={saddleY + 8} stroke={seatpostColor} strokeWidth="7" strokeLinecap="round" />
      <ellipse cx={saddleX} cy={saddleY} rx="22" ry="5" fill={saddleColor} />

      {/* Crank arm + chainring */}
      <circle cx={bbX} cy={bbY} r="10" fill={crankColor} />
      <line x1={bbX} y1={bbY} x2={bbX + 30} y2={bbY + 24} stroke={crankColor} strokeWidth="5" strokeLinecap="round" />
      <circle cx={bbX + 30} cy={bbY + 24} r="6" fill="#1a1a1a" />

      {/* Cassette near rear hub */}
      <circle cx={rearCx} cy={rearCy} r="14" fill="none" stroke={color(selection.cassette, "#404040")} strokeWidth="3" />

      {/* Chain (visual hint) */}
      <path
        d={`M ${bbX + 12} ${bbY - 4} Q ${(bbX + rearCx) / 2} ${(bbY + rearCy) / 2 - 30}, ${rearCx + 10} ${rearCy - 6}`}
        fill="none"
        stroke="#525252"
        strokeWidth="2"
      />

      {/* Empty-state hint */}
      {!frame && (
        <text
          x="400"
          y="260"
          textAnchor="middle"
          fill="#525252"
          fontSize="14"
          fontFamily="ui-sans-serif, system-ui"
        >
          Pick a frame to start →
        </text>
      )}
    </svg>
  );
}

function Wheel({
  cx,
  cy,
  r,
  tireWidth,
  tireColor,
  rimColor,
}: {
  cx: number;
  cy: number;
  r: number;
  tireWidth: number;
  tireColor: string;
  rimColor: string;
}) {
  return (
    <g>
      {/* Tire */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={tireColor} strokeWidth={tireWidth} />
      {/* Rim */}
      <circle cx={cx} cy={cy} r={r - tireWidth / 2 - 4} fill="none" stroke="url(#rim)" strokeWidth="3" />
      {/* Spokes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const inner = 6;
        const outer = r - tireWidth / 2 - 4;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * inner}
            y1={cy + Math.sin(a) * inner}
            x2={cx + Math.cos(a) * outer}
            y2={cy + Math.sin(a) * outer}
            stroke={rimColor}
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        );
      })}
      {/* Hub */}
      <circle cx={cx} cy={cy} r="5" fill="#262626" />
    </g>
  );
}

function ShockLine({
  x1,
  y1,
  x2,
  y2,
  color,
  thick,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thick?: boolean;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={thick ? 14 : 10} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0a0a0a" strokeWidth={thick ? 4 : 3} strokeOpacity="0.5" strokeLinecap="round" />
    </g>
  );
}
