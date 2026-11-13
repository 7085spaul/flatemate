import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Loader2,
  Send,
  Sparkles,
  TrainFront,
  Wallet,
} from 'lucide-react';
import { SAMPLE_PROPERTIES, SAMPLE_ROOMMATES } from '../data/sampleData.ts';
import type {
  AIRecommendationResponse,
  CompatibilityResult,
  PropertyListing,
  UserPreferences,
} from '../types/housing.ts';
import { calculateCompatibility } from '../utils/compatibility.ts';
import { PropertyCard } from '../components/PropertyCard.tsx';
import { RoommateCard } from '../components/RoommateCard.tsx';

interface AIAssistantPageProps {
  initialPrompt?: string;
  userPreferences: UserPreferences;
  onSelectProperty: (property: PropertyListing) => void;
  onInspectMatch: (result: CompatibilityResult) => void;
}

const SAMPLE_PROMPTS = [
  'I am a software engineer working near Whitefield ITPL. Budget around ₹17,000, prefer walking distance to Purple Line Metro and a neat vegetarian flatmate.',
  'New student / intern in Bengaluru looking for an affordable PG under ₹12,500 near BTM Layout or HSR Layout with food options.',
  'Looking for a quiet WFH-friendly 1BHK or sunlit 2BHK in Indiranagar up to ₹22,000 close to metro.',
  'Working hybrid near Bellandur Ecospace, budget ₹17,000, want shared flat with cook/maid and clean flatmates.',
];

export function AIAssistantPage({
  initialPrompt,
  userPreferences,
  onSelectProperty,
  onInspectMatch,
}: AIAssistantPageProps) {
  const [query, setQuery] = useState(initialPrompt || '');
  const [forceDemoMode, setForceDemoMode] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIRecommendationResponse | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setGeminiAvailable(Boolean(data?.geminiConfigured));
      })
      .catch(() => {
        setGeminiAvailable(false);
      });
  }, []);

  const runQuery = async (promptText: string, useDemo: boolean) => {
    const trimmed = promptText.trim();
    if (trimmed.length < 3) {
      setError('Please describe your accommodation needs in a few words.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          mode: useDemo ? 'demo' : 'auto',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Could not generate recommendations.');
      }
      setResult(data as AIRecommendationResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach the recommendation server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 3) {
      setQuery(initialPrompt);
      void runQuery(initialPrompt, forceDemoMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runQuery(query, forceDemoMode);
  };

  const matchedFlats = (result?.recommendedFlats ?? [])
    .map((rec) => {
      const property = SAMPLE_PROPERTIES.find((p) => p.id === rec.id);
      return property ? { property, reason: rec.reason } : null;
    })
    .filter((item): item is { property: PropertyListing; reason: string } => item !== null);

  const matchedRoommates = (result?.recommendedRoommates ?? [])
    .map((rec) => {
      const rm = SAMPLE_ROOMMATES.find((r) => r.id === rec.id);
      if (!rm) return null;
      return {
        compatibility: calculateCompatibility(userPreferences, rm),
        reason: rec.reason,
      };
    })
    .filter((item): item is { compatibility: CompatibilityResult; reason: string } => item !== null);

  const effectiveModeLabel =
    forceDemoMode || geminiAvailable === false
      ? 'Demo Mode (Local Sample Recommender)'
      : geminiAvailable === true
        ? 'Live Google Gemini Mode (gemini-4-hydrogen)'
        : 'Checking AI Backend...';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Honest Mode Status */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-teal-700">
            Natural Language Housing Advisor
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Ask FlatMate AI About Bengaluru Flats & Flatmates
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Describe your workplace, commute, monthly budget, and living habits. Recommendations are grounded strictly in our Bengaluru sample dataset.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2">
            Engine: <strong className="text-teal-700">{effectiveModeLabel}</strong>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceDemoMode}
              onChange={(e) => setForceDemoMode(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            <span>Force Demo Mode</span>
          </label>
        </div>
      </div>

      {/* Prompt Input Card */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="ai-query-input"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              What kind of flat or flatmate are you looking for?
            </label>
            <textarea
              id="ai-query-input"
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Moving to Bengaluru for a software role near Indiranagar or Whitefield. Budget ₹18,000/mo, want metro access and a clean non-smoking flatmate..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              API requests run securely through the Express backend. Sample data only.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Matching Recommendations...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Recommend Flats & Flatmates
                </>
              )}
            </button>
          </div>
        </form>

        {/* Example Prompts */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-xs font-medium text-slate-500">
            Try an example prompt:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  void runQuery(sample, forceDemoMode);
                }}
                className="text-left text-xs text-slate-700 hover:text-teal-800 bg-slate-50 hover:bg-teal-50/60 border border-slate-200/70 hover:border-teal-200 rounded-xl p-3 transition-colors"
              >
                “{sample}”
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-800"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-8">
          {/* AI Summary & Insights */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
                <Bot className="w-5 h-5" aria-hidden="true" />
                <span>
                  {result.mode === 'gemini'
                    ? `Gemini Recommendation (${result.modelUsed})`
                    : 'Demo Mode Recommendation (Sample Dataset Rules)'}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Grounded in 9 sample flats & 8 sample profiles
              </span>
            </div>

            {result.fallbackReason && (
              <div className="rounded-xl bg-sky-50 border border-sky-200/80 px-4 py-2.5 text-xs text-sky-900">
                <strong>Demo Mode Active:</strong> {result.fallbackReason}
              </div>
            )}

            <p className="text-base text-slate-800 leading-relaxed">
              {result.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
                <Wallet className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="block text-slate-900 mb-0.5">Bengaluru Budget Context</strong>
                  {result.budgetNote}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
                <TrainFront className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="block text-slate-900 mb-0.5">Commute & Metro Insight</strong>
                  {result.metroTip}
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Flats */}
          {matchedFlats.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Recommended Sample Flats & PGs
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedFlats.map(({ property, reason }) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    aiReason={reason}
                    onSelect={onSelectProperty}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recommended Roommates */}
          {matchedRoommates.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Recommended Sample Flatmates
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedRoommates.map(({ compatibility, reason }) => (
                  <RoommateCard
                    key={compatibility.roommate.id}
                    result={compatibility}
                    aiReason={reason}
                    onInspect={onInspectMatch}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
