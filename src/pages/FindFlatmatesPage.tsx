import { useMemo, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import { BENGALURU_LOCALITIES, SAMPLE_ROOMMATES } from '../data/sampleData.ts';
import type {
  CompatibilityResult,
  DietPreference,
  SleepSchedule,
  SocialVibe,
  UserPreferences,
  WorkMode,
} from '../types/housing.ts';
import {
  calculateCompatibility,
  DEFAULT_USER_PREFERENCES,
} from '../utils/compatibility.ts';
import { RoommateCard } from '../components/RoommateCard.tsx';

interface FindFlatmatesPageProps {
  preferences: UserPreferences;
  onChangePreferences: (next: UserPreferences) => void;
  onInspectMatch: (result: CompatibilityResult) => void;
}

const SLEEP_OPTIONS: SleepSchedule[] = ['Early Bird', 'Balanced', 'Night Owl'];
const WORK_OPTIONS: WorkMode[] = ['WFH / Hybrid', 'Office Commute', 'Student'];
const DIET_OPTIONS: DietPreference[] = ['Vegetarian', 'Non-Veg Friendly', 'Flexible'];
const SOCIAL_OPTIONS: SocialVibe[] = ['Quiet & Private', 'Balanced', 'Social & Hosts Friends'];

export function FindFlatmatesPage({
  preferences,
  onChangePreferences,
  onInspectMatch,
}: FindFlatmatesPageProps) {
  const [onlyAreaMatches, setOnlyAreaMatches] = useState(false);

  const rankedMatches = useMemo(() => {
    const scored = SAMPLE_ROOMMATES.map((rm) =>
      calculateCompatibility(preferences, rm)
    ).sort((a, b) => b.overallScore - a.overallScore);

    if (onlyAreaMatches && preferences.preferredArea !== 'All Areas') {
      return scored.filter((item) =>
        item.roommate.preferredAreas.includes(preferences.preferredArea)
      );
    }
    return scored;
  }, [preferences, onlyAreaMatches]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-sky-700">
            Explainable Roommate Matching · Sample Profiles
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Find Compatible Flatmates in Bengaluru
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Adjust your budget, sleep schedule, cleanliness level, and lifestyle preferences. Every compatibility percentage updates live and shows exactly which traits match.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 shrink-0">
          No sign-up required · <strong className="text-slate-700">Sample profiles</strong> for demo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: User Lifestyle Preferences Panel */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Your Preferences
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                onChangePreferences(DEFAULT_USER_PREFERENCES);
                setOnlyAreaMatches(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="pref-budget" className="font-semibold text-slate-700">
                Monthly Budget Ceiling
              </label>
              <span className="font-mono font-semibold text-teal-700 tabular-nums">
                ₹{preferences.budgetMax.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              id="pref-budget"
              type="range"
              min={9000}
              max={25000}
              step={500}
              value={preferences.budgetMax}
              onChange={(e) =>
                onChangePreferences({
                  ...preferences,
                  budgetMax: Number(e.target.value),
                })
              }
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Preferred Area */}
          <div className="space-y-1.5">
            <label htmlFor="pref-area" className="block text-xs font-semibold text-slate-700">
              Preferred Bengaluru Area
            </label>
            <select
              id="pref-area"
              value={preferences.preferredArea}
              onChange={(e) =>
                onChangePreferences({ ...preferences, preferredArea: e.target.value })
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {BENGALURU_LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {preferences.preferredArea !== 'All Areas' && (
              <label className="flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAreaMatches}
                  onChange={(e) => setOnlyAreaMatches(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                />
                <span>Show only profiles seeking {preferences.preferredArea}</span>
              </label>
            )}
          </div>

          {/* Sleep Schedule */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">
              Sleep Schedule
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {SLEEP_OPTIONS.map((opt) => {
                const active = preferences.sleepSchedule === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      onChangePreferences({ ...preferences, sleepSchedule: opt })
                    }
                    className={`py-2 px-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cleanliness Level */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Cleanliness Standard</span>
              <span className="font-mono font-semibold text-sky-700 tabular-nums">
                {preferences.cleanliness} / 5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as const).map((lvl) => {
                const active = preferences.cleanliness === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      onChangePreferences({ ...preferences, cleanliness: lvl })
                    }
                    className={`h-9 rounded-xl text-xs font-mono font-semibold border transition-colors ${
                      active
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Relaxed</span>
              <span>Very Neat</span>
            </div>
          </div>

          {/* Work / Study Mode */}
          <div className="space-y-1.5">
            <label htmlFor="pref-work" className="block text-xs font-semibold text-slate-700">
              Work / Study Routine
            </label>
            <select
              id="pref-work"
              value={preferences.workMode}
              onChange={(e) =>
                onChangePreferences({
                  ...preferences,
                  workMode: e.target.value as WorkMode,
                })
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {WORK_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Diet & Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="pref-diet" className="block text-xs font-semibold text-slate-700">
                Food Preference
              </label>
              <select
                id="pref-diet"
                value={preferences.diet}
                onChange={(e) =>
                  onChangePreferences({
                    ...preferences,
                    diet: e.target.value as DietPreference,
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {DIET_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-social" className="block text-xs font-semibold text-slate-700">
                Home Social Vibe
              </label>
              <select
                id="pref-social"
                value={preferences.socialVibe}
                onChange={(e) =>
                  onChangePreferences({
                    ...preferences,
                    socialVibe: e.target.value as SocialVibe,
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {SOCIAL_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.noSmokingOnly}
              onChange={(e) =>
                onChangePreferences({
                  ...preferences,
                  noSmokingOnly: e.target.checked,
                })
              }
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            <span>Prefer non-smoking flatmates</span>
          </label>
        </aside>

        {/* Right: Ranked Roommate Cards */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Ranked <strong className="text-slate-900 tabular-nums">{rankedMatches.length}</strong> sample profiles by compatibility score
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Click "Inspect Match" for the 6-axis radar chart
            </span>
          </div>

          {rankedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rankedMatches.map((result) => (
                <RoommateCard
                  key={result.roommate.id}
                  result={result}
                  onInspect={onInspectMatch}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                No sample profiles strictly match {preferences.preferredArea}
              </h2>
              <p className="text-sm text-slate-600">
                Uncheck the locality filter to see all ranked Bengaluru profiles across nearby neighbourhoods.
              </p>
              <button
                type="button"
                onClick={() => setOnlyAreaMatches(false)}
                className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
              >
                Show All Ranked Profiles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
