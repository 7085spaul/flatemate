import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, MapPin, Sparkles, X } from 'lucide-react';
import type { CompatibilityResult } from '../types/housing.ts';
import { CompatibilityRadarChart, ScoreRing } from './CompatibilityVisual.tsx';

interface RoommateModalProps {
  result: CompatibilityResult | null;
  onClose: () => void;
  onExploreAreaFlats: (area: string) => void;
}

export function RoommateModal({
  result,
  onClose,
  onExploreAreaFlats,
}: RoommateModalProps) {
  useEffect(() => {
    if (!result) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [result, onClose]);

  if (!result) return null;

  const { roommate, overallScore, dimensions } = result;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roommate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">
              Explainable Visual Compatibility · Sample Profile
            </div>
            <h2
              id="roommate-modal-title"
              className="font-display text-2xl font-bold text-slate-900"
            >
              {roommate.name}, {roommate.age} — {roommate.occupation}
            </h2>
            <p className="text-sm text-slate-600 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4 text-teal-600" aria-hidden="true" />
                {roommate.preferredAreas.join(', ')}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{roommate.companyOrCampus}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>From {roommate.hometown}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ScoreRing score={overallScore} size={68} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close compatibility breakdown"
              className="w-10 h-10 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-200/70">
          {roommate.bio} <span className="text-slate-500">Interests: {roommate.interests.join(', ')}.</span>
        </p>

        {/* Visual Radar + Dimension Table */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          <div className="md:col-span-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4">
            <div className="text-xs font-semibold text-slate-700 text-center mb-2">
              6-Axis Lifestyle Alignment
            </div>
            <CompatibilityRadarChart result={result} />
          </div>

          <div className="md:col-span-7 space-y-3.5">
            {dimensions.map((dim) => {
              const Icon =
                dim.status === 'match'
                  ? CheckCircle2
                  : dim.status === 'close'
                    ? Sparkles
                    : AlertCircle;
              const iconColor =
                dim.status === 'match'
                  ? 'text-teal-600'
                  : dim.status === 'close'
                    ? 'text-sky-600'
                    : 'text-slate-400';
              const barColor =
                dim.status === 'match'
                  ? 'bg-teal-600'
                  : dim.status === 'close'
                    ? 'bg-sky-500'
                    : 'bg-slate-300';

              return (
                <div key={dim.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} aria-hidden="true" />
                      {dim.label}
                      <span className="text-xs font-normal text-slate-400">({dim.weight}% weight)</span>
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                      {dim.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span>
                      You: <strong className="text-slate-800">{dim.userValue}</strong> · {roommate.name.split(' ')[0]}: <strong className="text-slate-800">{dim.candidateValue}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{dim.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Scores update live based on your lifestyle preferences. Fictional sample profile.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onExploreAreaFlats(roommate.preferredAreas[0]);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              Explore Flats in {roommate.preferredAreas[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
