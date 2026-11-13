import { useEffect, useState } from 'react';
import { Building2, Check, MapPin, TrainFront, Users, X } from 'lucide-react';
import type { PropertyListing } from '../types/housing.ts';
import { PROPERTY_IMAGES } from '../utils/propertyImages.ts';

interface PropertyModalProps {
  property: PropertyListing | null;
  onClose: () => void;
  onFindFlatmatesForArea: (area: string) => void;
}

export function PropertyModal({
  property,
  onClose,
  onFindFlatmatesForArea,
}: PropertyModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    if (!property) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [property, onClose]);

  if (!property) return null;

  const imageSrc = PROPERTY_IMAGES[property.imageKey];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-slate-100">
          {!imageError && imageSrc ? (
            <img
              src={imageSrc}
              alt={`${property.title} interior`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-50 to-sky-100 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-teal-600" />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property details"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 text-slate-800 hover:bg-white flex items-center justify-center shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-teal-700">
                <span>Sample Listing</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{property.accommodationType}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-sky-700">{property.furnishing}</span>
              </div>
              <h2
                id="property-modal-title"
                className="font-display text-2xl font-bold text-slate-900"
              >
                {property.title}
              </h2>
              <p className="text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {property.subLocality}, {property.locality}, Bengaluru
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="font-mono text-2xl font-bold text-teal-700 tabular-nums">
                ₹{property.monthlyRent.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
              <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                Sample deposit: ₹{property.sampleDeposit.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-100 text-sm">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Nearest Metro / Transit</div>
              <div className="font-medium text-slate-900 flex items-center gap-1.5">
                <TrainFront className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
                <span>{property.nearestMetro}</span>
              </div>
              <div className="text-slate-600 mt-0.5 tabular-nums">
                {property.metroLine} · {property.metroDistanceText}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Room & Occupancy</div>
              <div className="font-medium text-slate-900">{property.roomConfig}</div>
              <div className="text-slate-600 mt-0.5">
                Preference: {property.genderPreference === 'Any' ? 'Open to all' : `${property.genderPreference} preferred`}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Why Newcomers & Professionals Pick This Area
            </h3>
            <ul className="space-y-2">
              {property.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 mb-2">
                Included Amenities
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {property.amenities.join(' · ')}
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 mb-2">
                Key Commute Estimates
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {property.commuteHubs.join(' · ')}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-xs text-slate-600">
            <strong className="text-slate-800">Sample Data Notice:</strong> {property.houseNotes} Prices and listings are fictional examples for demonstration.
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onFindFlatmatesForArea(property.locality);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              Find Flatmates in {property.locality}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
