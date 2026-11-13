import { BarChart3, Briefcase, Check, MapPin } from 'lucide-react';
import type { CompatibilityResult } from '../types/housing.ts';
import { DimensionMiniStrip, ScoreRing } from './CompatibilityVisual.tsx';

interface RoommateCardProps {
  result: CompatibilityResult;
  onInspect: (result: CompatibilityResult) => void;
  aiReason?: string;
}

const AVATAR_TONES: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
};

export function RoommateCard({ result, onInspect, aiReason }: RoommateCardProps) {
  const { roommate, overallScore, dimensions, matchingSummary } = result;
  const matchTier =
    overallScore >= 82
      ? 'High Compatibility'
      : overallScore >= 68
        ? 'Good Compatibility'
        : 'Partial Fit';

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 p-6 flex flex-col justify-between gap-5">
      <div className="space-y-4">
        {/* Top Row: Profile & Visual Score Ring */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-display font-bold text-base shrink-0 ${
                AVATAR_TONES[roommate.avatarTone] ?? AVATAR_TONES.teal
              }`}
            >
              {roommate.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500">
                Sample Profile · {roommate.moveInWindow}
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 truncate">
                {roommate.name}, {roommate.age}
              </h3>
              <p className="text-sm text-slate-600 flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{roommate.occupation}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <ScoreRing score={overallScore} size={60} />
            <span className="text-[11px] font-medium text-teal-700 mt-1">
              {matchTier}
            </span>
          </div>
        </div>

        {/* Unboxed Location & Budget metadata */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
            {roommate.preferredAreas.slice(0, 2).join(', ')}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-mono font-medium text-sky-700 tabular-nums">
            ₹{roommate.budgetMin.toLocaleString('en-IN')}–₹{roommate.budgetMax.toLocaleString('en-IN')}/mo
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{roommate.diet}</span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
          {aiReason || roommate.bio}
        </p>

        {/* Visual Compatibility Strip (Surprise Feature) */}
        <DimensionMiniStrip dimensions={dimensions} />

        {/* Matching Preferences Explainability */}
        {matchingSummary.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-teal-800 bg-teal-50/70 rounded-xl px-3.5 py-2.5">
            <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Matches on:</strong> {matchingSummary.join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 truncate">
          {roommate.sleepSchedule} · {roommate.workMode}
        </span>
        <button
          type="button"
          onClick={() => onInspect(result)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          <BarChart3 className="w-4 h-4" aria-hidden="true" />
          Inspect Match
        </button>
      </div>
    </article>
  );
}
