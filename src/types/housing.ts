export type AccommodationType = 'Shared Flat' | 'Private 1BHK' | 'PG / Co-living';

export type PropertyImageKey =
  | 'hero'
  | 'studio'
  | 'coliving'
  | 'hsr_pg'
  | 'whitefield';

export type SleepSchedule = 'Early Bird' | 'Balanced' | 'Night Owl';
export type WorkMode = 'WFH / Hybrid' | 'Office Commute' | 'Student';
export type DietPreference = 'Vegetarian' | 'Non-Veg Friendly' | 'Flexible';
export type SocialVibe = 'Quiet & Private' | 'Balanced' | 'Social & Hosts Friends';

export interface PropertyListing {
  id: string;
  title: string;
  locality: string;
  subLocality: string;
  accommodationType: AccommodationType;
  roomConfig: string;
  monthlyRent: number;
  sampleDeposit: number;
  nearestMetro: string;
  metroLine: 'Purple Line' | 'Green Line' | 'Yellow / ORR Corridor';
  metroDistanceText: string;
  metroMinutes: number;
  commuteHubs: string[];
  amenities: string[];
  highlights: string[];
  houseNotes: string;
  furnishing: 'Fully Furnished' | 'Semi-Furnished';
  genderPreference: 'Any' | 'Men' | 'Women';
  imageKey: PropertyImageKey;
  isSample: true;
}

export interface RoommateProfile {
  id: string;
  name: string;
  initials: string;
  age: number;
  occupation: string;
  companyOrCampus: string;
  hometown: string;
  preferredAreas: string[];
  budgetMin: number;
  budgetMax: number;
  sleepSchedule: SleepSchedule;
  cleanliness: 1 | 2 | 3 | 4 | 5;
  workMode: WorkMode;
  diet: DietPreference;
  smoking: 'No Smoking' | 'Outdoor Only';
  socialVibe: SocialVibe;
  moveInWindow: string;
  bio: string;
  interests: string[];
  avatarTone: 'teal' | 'blue' | 'sky' | 'cyan' | 'slate';
  isSample: true;
}

export interface UserPreferences {
  budgetMax: number;
  preferredArea: string;
  sleepSchedule: SleepSchedule;
  cleanliness: 1 | 2 | 3 | 4 | 5;
  workMode: WorkMode;
  diet: DietPreference;
  noSmokingOnly: boolean;
  socialVibe: SocialVibe;
}

export interface DimensionScore {
  key: 'budget' | 'sleep' | 'cleanliness' | 'work' | 'lifestyle' | 'locality';
  label: string;
  score: number;
  weight: number;
  status: 'match' | 'close' | 'mismatch';
  userValue: string;
  candidateValue: string;
  explanation: string;
}

export interface CompatibilityResult {
  roommate: RoommateProfile;
  overallScore: number;
  dimensions: DimensionScore[];
  matchingSummary: string[];
  frictionNotes: string[];
}

export interface AIRecommendedFlat {
  id: string;
  reason: string;
  matchHighlights: string[];
}

export interface AIRecommendedRoommate {
  id: string;
  reason: string;
}

export interface AIRecommendationResponse {
  mode: 'gemini' | 'demo';
  modelUsed: string;
  summary: string;
  budgetNote: string;
  metroTip: string;
  recommendedFlats: AIRecommendedFlat[];
  recommendedRoommates: AIRecommendedRoommate[];
  fallbackReason?: string;
}
