import { CheckCircle2, MinusCircle, Sparkles } from 'lucide-react';
import type { CompatibilityResult, DimensionScore } from '../types/housing.ts';

export function ScoreRing({
  score,
  size = 64,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 5.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 80
      ? '#0D9488' // teal-600
      : clamped >= 65
        ? '#0284C7' // sky-600
        : '#64748B'; // slate-500

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Compatibility score ${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute font-mono text-sm font-bold text-slate-900 tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}

export function DimensionMiniStrip({
  dimensions,
}: {
  dimensions: DimensionScore[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Preference Alignment</span>
        <span className="font-medium text-slate-700">
          {dimensions.filter((d) => d.status === 'match').length}/{dimensions.length} strong matches
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {dimensions.map((dim) => {
          const barClass =
            dim.status === 'match'
              ? 'bg-teal-600'
              : dim.status === 'close'
                ? 'bg-sky-500'
                : 'bg-slate-300';
          const textClass =
            dim.status === 'match'
              ? 'text-teal-800'
              : dim.status === 'close'
                ? 'text-sky-800'
                : 'text-slate-500';

          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className={`font-medium truncate ${textClass}`}>
                  {dim.label}
                </span>
                <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                  {dim.score}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barClass}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompatibilityRadarChart({
  result,
}: {
  result: CompatibilityResult;
}) {
  const size = 260;
  const center = size / 2;
  const maxRadius = 86;
  const dims = result.dimensions;
  const count = dims.length;

  const getPoint = (index: number, valuePercent: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = (valuePercent / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const rings = [25, 50, 75, 100];

  const candidatePolygon = dims
    .map((d, idx) => {
      const pt = getPoint(idx, d.score);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const idealPolygon = dims
    .map((_, idx) => {
      const pt = getPoint(idx, 100);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] h-auto"
        role="img"
        aria-label={`Visual compatibility radar for ${result.roommate.name}`}
      >
        {/* Concentric reference grids */}
        {rings.map((ring) => {
          const pts = dims
            .map((_, idx) => {
              const pt = getPoint(idx, ring);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={ring}
              points={pts}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis spokes */}
        {dims.map((dim, idx) => {
          const outer = getPoint(idx, 100);
          const labelPt = getPoint(idx, 122);
          return (
            <g key={dim.key}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 text-[10px] font-medium"
              >
                {dim.label}
              </text>
            </g>
          );
        })}

        {/* 100% Ideal Reference Outline */}
        <polygon
          points={idealPolygon}
          fill="none"
          stroke="#0284C7"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.35"
        />

        {/* Match Polygon */}
        <polygon
          points={candidatePolygon}
          fill="rgba(13, 148, 136, 0.22)"
          stroke="#0D9488"
          strokeWidth="2"
        />

        {/* Vertex Dots */}
        {dims.map((dim, idx) => {
          const pt = getPoint(idx, dim.score);
          const dotColor =
            dim.status === 'match'
              ? '#0D9488'
              : dim.status === 'close'
                ? '#0284C7'
                : '#94A3B8';
          return (
            <circle
              key={dim.key}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill={dotColor}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          Strong Match
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
          Close Fit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MinusCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          Difference
        </span>
      </div>
    </div>
  );
}
