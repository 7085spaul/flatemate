import { useState } from 'react';
import { ArrowUpRight, Building2, MapPin, TrainFront } from 'lucide-react';
import type { PropertyListing } from '../types/housing.ts';
import { PROPERTY_IMAGES } from '../utils/propertyImages.ts';

interface PropertyCardProps {
  property: PropertyListing;
  onSelect: (property: PropertyListing) => void;
  aiReason?: string;
}

export function PropertyCard({ property, onSelect, aiReason }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = PROPERTY_IMAGES[property.imageKey];

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {!imageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={`${property.title} in ${property.locality}, Bengaluru`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-50 via-sky-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center">
            <Building2 className="w-10 h-10 text-teal-600 mb-2" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-700">{property.title}</span>
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent"
        />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
          <span className="text-xs font-medium tracking-wide text-white/95">
            Sample Listing · {property.furnishing}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            ₹{property.monthlyRent.toLocaleString('en-IN')}/mo
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          {/* Unboxed metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-teal-700">
            <span>{property.locality}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-sky-700">{property.accommodationType}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">{property.roomConfig}</span>
          </div>

          <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
            {property.title}
          </h3>

          <div className="space-y-1.5 text-sm text-slate-600 pt-0.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{property.subLocality}, Bengaluru</span>
            </div>
            <div className="flex items-center gap-2">
              <TrainFront className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {property.nearestMetro} · <span className="tabular-nums">{property.metroDistanceText}</span>
              </span>
            </div>
          </div>

          {aiReason && (
            <p className="text-sm text-slate-700 bg-teal-50/70 border border-teal-200/70 rounded-xl px-3.5 py-2.5 leading-relaxed">
              {aiReason}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 truncate">
            {property.amenities.slice(0, 3).join(' · ')}
          </p>
          <button
            type="button"
            onClick={() => onSelect(property)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
          >
            View Details
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
