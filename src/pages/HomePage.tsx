import { useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Search, Sparkles, TrainFront, Users } from 'lucide-react';
import { BENGALURU_LOCALITIES, SAMPLE_PROPERTIES, SAMPLE_ROOMMATES } from '../data/sampleData.ts';
import { PROPERTY_IMAGES } from '../utils/propertyImages.ts';
import { calculateCompatibility, DEFAULT_USER_PREFERENCES } from '../utils/compatibility.ts';
import type { PropertyListing, RoommateProfile } from '../types/housing.ts';
import { PropertyCard } from '../components/PropertyCard.tsx';
import { CompatibilityRadarChart, ScoreRing } from '../components/CompatibilityVisual.tsx';
import type { AppPage } from '../components/Navbar.tsx';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
  onQuickSearchFlats: (locality: string, maxBudget: number) => void;
  onSelectProperty: (property: PropertyListing) => void;
  onInspectSampleMatch: (roommate: RoommateProfile) => void;
  onLaunchAIPrompt: (prompt: string) => void;
}

const CORRIDORS = [
  {
    title: 'Indiranagar & Purple Line',
    subtitle: '₹18,500–₹22,000/mo · 6 min walk to Metro',
    locality: 'Indiranagar',
    line: 'Purple Line',
  },
  {
    title: 'Koramangala & HSR Hub',
    subtitle: '₹12,500–₹15,500/mo · Startup & PG belt',
    locality: 'Koramangala',
    line: 'ORR / Feeder',
  },
  {
    title: 'Whitefield ITPL Corridor',
    subtitle: '₹16,000/mo · Pattandur Agrahara Metro',
    locality: 'Whitefield',
    line: 'Purple Line East',
  },
  {
    title: 'South & Central Green Line',
    subtitle: '₹9,500–₹15,000/mo · BTM, JP Nagar, IISc',
    locality: 'JP Nagar',
    line: 'Green Line',
  },
];

export function HomePage({
  onNavigate,
  onQuickSearchFlats,
  onSelectProperty,
  onInspectSampleMatch,
  onLaunchAIPrompt,
}: HomePageProps) {
  const [quickArea, setQuickArea] = useState('All Areas');
  const [quickBudget, setQuickBudget] = useState(20000);
  const [aiPreviewInput, setAiPreviewInput] = useState('');

  const featuredFlats = SAMPLE_PROPERTIES.slice(0, 3);
  const sampleMatch = calculateCompatibility(DEFAULT_USER_PREFERENCES, SAMPLE_ROOMMATES[1]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearchFlats(quickArea, quickBudget);
  };

  const handleAIPreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunchAIPrompt(
      aiPreviewInput.trim() ||
        'Looking for a clean shared 2BHK near Indiranagar or Whitefield metro under ₹19,000 with a quiet vegetarian flatmate.'
    );
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Proposition & Quick Search */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <p className="text-sm font-medium text-teal-700">
                  Bengaluru Housing & Roommate Guide · Sample MVP Dataset
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12] [text-wrap:balance]">
                  Find your flat. Find your flatmate. Feel at home.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Built for Bengaluru students, tech professionals, and newcomers. Compare sample flats near Namma Metro stations, evaluate roommates with an explainable compatibility score, or ask our AI advisor in plain English.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('flats')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600"
                  >
                    Explore Sample Flats
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('flatmates')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <Users className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    Match Flatmates
                  </button>
                </div>
              </div>

              {/* Compact Quick Search Bar */}
              <form
                onSubmit={handleQuickSubmit}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <div className="text-xs font-semibold text-slate-700">
                  Quick Search Sample Bengaluru Listings
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label htmlFor="hero-area" className="sr-only">
                      Bengaluru Locality
                    </label>
                    <select
                      id="hero-area"
                      value={quickArea}
                      onChange={(e) => setQuickArea(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      {BENGALURU_LOCALITIES.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="hero-budget" className="sr-only">
                      Maximum Monthly Budget
                    </label>
                    <select
                      id="hero-budget"
                      value={quickBudget}
                      onChange={(e) => setQuickBudget(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value={12000}>Up to ₹12,000/mo</option>
                      <option value={16000}>Up to ₹16,000/mo</option>
                      <option value={20000}>Up to ₹20,000/mo</option>
                      <option value={25000}>Up to ₹25,000/mo</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-11 inline-flex items-center justify-center gap-1.5 px-4 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <Search className="w-4 h-4" aria-hidden="true" />
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Dominant Visual Anchor */}
            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[300px] lg:min-h-[420px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-card">
                <img
                  src={PROPERTY_IMAGES.hero}
                  alt="Sunlit 2BHK apartment living room in Indiranagar, Bengaluru"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/80 via-slate-900/35 to-transparent"
                />
                <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                  <div>
                    <div className="text-xs font-medium text-teal-200">
                      Sample Listing · Indiranagar 100ft Road
                    </div>
                    <div className="font-display text-lg font-semibold">
                      Sunlit 2BHK Room · 450m to Indiranagar Metro
                    </div>
                  </div>
                  <div className="font-mono text-base font-semibold tabular-nums shrink-0">
                    ₹18,500/mo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Bengaluru Transit Corridors Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-100">
            {CORRIDORS.map((corridor) => (
              <button
                key={corridor.title}
                type="button"
                onClick={() => onQuickSearchFlats(corridor.locality, 25000)}
                className="text-left p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-teal-300 hover:shadow-card transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-medium text-sky-700 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <TrainFront className="w-3.5 h-3.5" aria-hidden="true" />
                    {corridor.line}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <div className="font-display text-sm font-semibold text-slate-900">
                  {corridor.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 tabular-nums">
                  {corridor.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sample Flats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-teal-700">
              Sample Accommodation Dataset
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Bengaluru Flats & PGs
            </h2>
            <p className="text-sm text-slate-600">
              Transparent sample rents, metro walking distances, and house notes across key neighbourhoods.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('flats')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap self-start sm:self-auto"
          >
            View all 9 sample listings
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredFlats.map((flat) => (
            <PropertyCard
              key={flat.id}
              property={flat}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      </section>

      {/* Surprise Feature & AI Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Explainable Visual Compatibility Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-sky-700">
                  Visual Roommate Compatibility
                </p>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  See exactly which habits align before moving in
                </h2>
                <p className="text-sm text-slate-600 max-w-lg">
                  Instead of guessing from a short bio, inspect how your budget, sleep schedule, cleanliness, and WFH routine align across six weighted dimensions.
                </p>
              </div>
              <ScoreRing score={sampleMatch.overallScore} size={68} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-slate-50/80 rounded-2xl border border-slate-200/70 p-5">
              <div className="sm:col-span-6">
                <CompatibilityRadarChart result={sampleMatch} />
              </div>
              <div className="sm:col-span-6 space-y-3">
                <div className="text-xs font-medium text-slate-500">
                  Sample Match Preview · {sampleMatch.roommate.name} ({sampleMatch.roommate.occupation})
                </div>
                <div className="space-y-2">
                  {sampleMatch.dimensions.slice(0, 4).map((dim) => (
                    <div key={dim.key} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          dim.status === 'match' ? 'text-teal-600' : 'text-sky-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-slate-900">{dim.label}:</strong> {dim.explanation}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('flatmates')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                  >
                    Customize Your Preferences
                  </button>
                  <button
                    type="button"
                    onClick={() => onInspectSampleMatch(sampleMatch.roommate)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Open Full Breakdown
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Natural Language AI Advisor Launcher */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-card">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Google Gemini Housing Advisor
              </div>
              <h2 className="font-display text-2xl font-bold leading-snug">
                Describe what you need in plain English
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tell FlatMate AI your workplace, monthly budget, metro preference, and living habits. We recommend the best-fitting sample flats and flatmates with clear reasoning.
              </p>
            </div>

            <form onSubmit={handleAIPreviewSubmit} className="space-y-3">
              <label htmlFor="home-ai-prompt" className="sr-only">
                Describe your accommodation needs
              </label>
              <textarea
                id="home-ai-prompt"
                rows={3}
                value={aiPreviewInput}
                onChange={(e) => setAiPreviewInput(e.target.value)}
                placeholder="e.g., Moving near Bellandur Ecospace, budget ₹17,000, prefer a clean quiet 2BHK or 3BHK and a vegetarian flatmate..."
                className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Get AI Recommendations
              </button>
            </form>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
              <span>Grounded strictly in our Bengaluru sample dataset · Demo mode supported</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
