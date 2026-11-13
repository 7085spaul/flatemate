import { useMemo } from 'react';
import { RotateCcw, Search, SlidersHorizontal, TrainFront } from 'lucide-react';
import {
  BENGALURU_LOCALITIES,
  METRO_STATIONS,
  SAMPLE_PROPERTIES,
} from '../data/sampleData.ts';
import type { AccommodationType, PropertyListing } from '../types/housing.ts';
import { PropertyCard } from '../components/PropertyCard.tsx';

export interface FlatFilterState {
  search: string;
  locality: string;
  maxBudget: number;
  type: 'All' | AccommodationType;
  metro: string;
  sortBy: 'recommended' | 'rent-asc' | 'rent-desc' | 'metro-asc';
}

interface ExploreFlatsPageProps {
  filters: FlatFilterState;
  onChangeFilters: (next: FlatFilterState) => void;
  onResetFilters: () => void;
  onSelectProperty: (property: PropertyListing) => void;
}

const ACCOMMODATION_TYPES: ('All' | AccommodationType)[] = [
  'All',
  'Shared Flat',
  'Private 1BHK',
  'PG / Co-living',
];

export function ExploreFlatsPage({
  filters,
  onChangeFilters,
  onResetFilters,
  onSelectProperty,
}: ExploreFlatsPageProps) {
  const filteredProperties = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    const list = SAMPLE_PROPERTIES.filter((item) => {
      if (filters.locality !== 'All Areas' && item.locality !== filters.locality) {
        return false;
      }
      if (item.monthlyRent > filters.maxBudget) {
        return false;
      }
      if (filters.type !== 'All' && item.accommodationType !== filters.type) {
        return false;
      }
      if (filters.metro !== 'All Stations' && item.nearestMetro !== filters.metro) {
        return false;
      }
      if (q) {
        const haystack = [
          item.title,
          item.locality,
          item.subLocality,
          item.nearestMetro,
          item.accommodationType,
          ...item.amenities,
          ...item.commuteHubs,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (filters.sortBy === 'rent-asc') {
      sorted.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (filters.sortBy === 'rent-desc') {
      sorted.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else if (filters.sortBy === 'metro-asc') {
      sorted.sort((a, b) => a.metroMinutes - b.metroMinutes);
    }
    return sorted;
  }, [filters]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.locality !== 'All Areas' ||
    filters.maxBudget < 25000 ||
    filters.type !== 'All' ||
    filters.metro !== 'All Stations';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-teal-700">
            Explore Flats & PGs · Sample Bengaluru Dataset
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Find Accommodation Across Bengaluru
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Filter fictional sample listings by monthly budget, neighbourhood, accommodation format, and proximity to Namma Metro or tech corridors.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 shrink-0">
          All listings & rents shown are <strong className="text-slate-700">sample data</strong> for demonstration
        </div>
      </div>

      {/* Filter Panel */}
      <section
        aria-label="Flat search filters"
        className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 sm:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Text Search */}
          <div className="md:col-span-4">
            <label htmlFor="flat-search" className="block text-xs font-medium text-slate-600 mb-1.5">
              Keyword or Landmark
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="flat-search"
                type="text"
                value={filters.search}
                onChange={(e) =>
                  onChangeFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search ITPL, 100ft Rd, Wi-Fi, IISc..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Bengaluru Locality */}
          <div className="md:col-span-3">
            <label htmlFor="flat-locality" className="block text-xs font-medium text-slate-600 mb-1.5">
              Bengaluru Location
            </label>
            <select
              id="flat-locality"
              value={filters.locality}
              onChange={(e) =>
                onChangeFilters({ ...filters, locality: e.target.value })
              }
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {BENGALURU_LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Nearby Metro Station */}
          <div className="md:col-span-3">
            <label htmlFor="flat-metro" className="block text-xs font-medium text-slate-600 mb-1.5">
              Nearby Metro / Transit
            </label>
            <div className="relative">
              <TrainFront
                className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                id="flat-metro"
                value={filters.metro}
                onChange={(e) =>
                  onChangeFilters({ ...filters, metro: e.target.value })
                }
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {METRO_STATIONS.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <label htmlFor="flat-sort" className="block text-xs font-medium text-slate-600 mb-1.5">
              Sort Order
            </label>
            <select
              id="flat-sort"
              value={filters.sortBy}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  sortBy: e.target.value as FlatFilterState['sortBy'],
                })
              }
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="recommended">Featured</option>
              <option value="rent-asc">Rent: Low to High</option>
              <option value="rent-desc">Rent: High to Low</option>
              <option value="metro-asc">Closest to Metro</option>
            </select>
          </div>
        </div>

        {/* Bottom row: Accommodation Type Tabs + Budget Slider */}
        <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-600">
              Accommodation Type
            </span>
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {ACCOMMODATION_TYPES.map((typeOption) => {
                const active = filters.type === typeOption;
                return (
                  <button
                    key={typeOption}
                    type="button"
                    onClick={() =>
                      onChangeFilters({ ...filters, type: typeOption })
                    }
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {typeOption}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:min-w-[340px]">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="flat-budget-slider" className="font-medium text-slate-600">
                  Max Monthly Rent
                </label>
                <span className="font-mono font-semibold text-teal-700 tabular-nums">
                  Up to ₹{filters.maxBudget.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <input
                id="flat-budget-slider"
                type="range"
                min={9500}
                max={25000}
                step={500}
                value={filters.maxBudget}
                onChange={(e) =>
                  onChangeFilters({
                    ...filters,
                    maxBudget: Number(e.target.value),
                  })
                }
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 self-start sm:self-end"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <span>
            Showing <strong className="text-slate-900 tabular-nums">{filteredProperties.length}</strong> of{' '}
            <span className="tabular-nums">{SAMPLE_PROPERTIES.length}</span> sample listings
          </span>
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            No sample listings match those exact filters
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Try increasing your monthly budget ceiling or switching to "All Areas" and "All Stations" to view more options across Bengaluru.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
