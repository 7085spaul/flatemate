import { useState } from 'react';
import { Navbar, type AppPage } from './components/Navbar.tsx';
import { PropertyModal } from './components/PropertyModal.tsx';
import { RoommateModal } from './components/RoommateModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ExploreFlatsPage, type FlatFilterState } from './pages/ExploreFlatsPage.tsx';
import { FindFlatmatesPage } from './pages/FindFlatmatesPage.tsx';
import { AIAssistantPage } from './pages/AIAssistantPage.tsx';
import type {
  CompatibilityResult,
  PropertyListing,
  RoommateProfile,
  UserPreferences,
} from './types/housing.ts';
import {
  calculateCompatibility,
  DEFAULT_USER_PREFERENCES,
} from './utils/compatibility.ts';

const DEFAULT_FLAT_FILTERS: FlatFilterState = {
  search: '',
  locality: 'All Areas',
  maxBudget: 25000,
  type: 'All',
  metro: 'All Stations',
  sortBy: 'recommended',
};

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [flatFilters, setFlatFilters] = useState<FlatFilterState>(DEFAULT_FLAT_FILTERS);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES
  );
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<CompatibilityResult | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const navigateTo = (page: AppPage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSearchFlats = (locality: string, maxBudget: number) => {
    setFlatFilters({
      ...DEFAULT_FLAT_FILTERS,
      locality,
      maxBudget,
    });
    navigateTo('flats');
  };

  const handleFindFlatmatesForArea = (area: string) => {
    setUserPreferences((prev) => ({
      ...prev,
      preferredArea: area,
    }));
    navigateTo('flatmates');
  };

  const handleExploreAreaFlats = (area: string) => {
    setFlatFilters({
      ...DEFAULT_FLAT_FILTERS,
      locality: area,
    });
    navigateTo('flats');
  };

  const handleInspectSampleRoommate = (roommate: RoommateProfile) => {
    setSelectedMatch(calculateCompatibility(userPreferences, roommate));
  };

  const handleLaunchAIPrompt = (prompt: string) => {
    setAiInitialPrompt(prompt);
    navigateTo('assistant');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activePage={activePage} onNavigate={navigateTo} />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onQuickSearchFlats={handleQuickSearchFlats}
            onSelectProperty={setSelectedProperty}
            onInspectSampleMatch={handleInspectSampleRoommate}
            onLaunchAIPrompt={handleLaunchAIPrompt}
          />
        )}

        {activePage === 'flats' && (
          <ExploreFlatsPage
            filters={flatFilters}
            onChangeFilters={setFlatFilters}
            onResetFilters={() => setFlatFilters(DEFAULT_FLAT_FILTERS)}
            onSelectProperty={setSelectedProperty}
          />
        )}

        {activePage === 'flatmates' && (
          <FindFlatmatesPage
            preferences={userPreferences}
            onChangePreferences={setUserPreferences}
            onInspectMatch={setSelectedMatch}
          />
        )}

        {activePage === 'assistant' && (
          <AIAssistantPage
            initialPrompt={aiInitialPrompt}
            userPreferences={userPreferences}
            onSelectProperty={setSelectedProperty}
            onInspectMatch={setSelectedMatch}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <div className="font-display font-semibold text-slate-800 text-sm">
              FlatMate AI – Bengaluru
            </div>
            <p>
              Find your flat. Find your flatmate. Feel at home. Fictional sample properties, prices, and roommate profiles for demonstration.
            </p>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-slate-800"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigateTo('flats')}
              className="hover:text-slate-800"
            >
              Explore Flats
            </button>
            <button
              type="button"
              onClick={() => navigateTo('flatmates')}
              className="hover:text-slate-800"
            >
              Find Flatmates
            </button>
            <button
              type="button"
              onClick={() => navigateTo('assistant')}
              className="hover:text-slate-800"
            >
              AI Assistant
            </button>
          </div>
        </div>
      </footer>

      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onFindFlatmatesForArea={handleFindFlatmatesForArea}
      />

      <RoommateModal
        result={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onExploreAreaFlats={handleExploreAreaFlats}
      />
    </div>
  );
}
