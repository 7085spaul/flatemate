import { SAMPLE_PROPERTIES, SAMPLE_ROOMMATES } from '../data/sampleData.ts';
import type {
  AIRecommendationResponse,
  CompatibilityResult,
  DimensionScore,
  RoommateProfile,
  UserPreferences,
} from '../types/housing.ts';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  budgetMax: 18000,
  preferredArea: 'Indiranagar',
  sleepSchedule: 'Balanced',
  cleanliness: 4,
  workMode: 'WFH / Hybrid',
  diet: 'Vegetarian',
  noSmokingOnly: true,
  socialVibe: 'Balanced',
};

function formatCurrency(val: number): string {
  return `₹${val.toLocaleString('en-IN')}`;
}

export function calculateCompatibility(
  user: UserPreferences,
  candidate: RoommateProfile
): CompatibilityResult {
  const dimensions: DimensionScore[] = [];

  // 1. Budget Alignment (25%)
  let budgetScore = 100;
  let budgetStatus: DimensionScore['status'] = 'match';
  let budgetExplanation = `Fits comfortably within your ${formatCurrency(user.budgetMax)}/mo cap.`;

  if (user.budgetMax >= candidate.budgetMin && user.budgetMax <= candidate.budgetMax) {
    budgetScore = 100;
    budgetStatus = 'match';
    budgetExplanation = `Your ${formatCurrency(user.budgetMax)} budget overlaps directly with their ${formatCurrency(candidate.budgetMin)}–${formatCurrency(candidate.budgetMax)} range.`;
  } else if (user.budgetMax > candidate.budgetMax) {
    const gap = user.budgetMax - candidate.budgetMax;
    if (gap <= 3000) {
      budgetScore = 88;
      budgetStatus = 'match';
      budgetExplanation = `Their max (${formatCurrency(candidate.budgetMax)}) is just ₹${gap.toLocaleString('en-IN')} below yours — easy to align on a shared flat.`;
    } else {
      budgetScore = 68;
      budgetStatus = 'close';
      budgetExplanation = `They target lower-cost flats up to ${formatCurrency(candidate.budgetMax)}, while your ceiling reaches ${formatCurrency(user.budgetMax)}.`;
    }
  } else {
    const gap = candidate.budgetMin - user.budgetMax;
    if (gap <= 2000) {
      budgetScore = 72;
      budgetStatus = 'close';
      budgetExplanation = `Only ₹${gap.toLocaleString('en-IN')} below their minimum budget (${formatCurrency(candidate.budgetMin)}).`;
    } else {
      budgetScore = Math.max(25, 65 - Math.round(gap / 250));
      budgetStatus = 'mismatch';
      budgetExplanation = `Their minimum (${formatCurrency(candidate.budgetMin)}) exceeds your ${formatCurrency(user.budgetMax)} target.`;
    }
  }

  dimensions.push({
    key: 'budget',
    label: 'Budget Fit',
    score: budgetScore,
    weight: 25,
    status: budgetStatus,
    userValue: `Up to ${formatCurrency(user.budgetMax)}`,
    candidateValue: `${formatCurrency(candidate.budgetMin)}–${formatCurrency(candidate.budgetMax)}`,
    explanation: budgetExplanation,
  });

  // 2. Sleep Schedule (20%)
  let sleepScore = 100;
  let sleepStatus: DimensionScore['status'] = 'match';
  let sleepExplanation = `Both follow a ${user.sleepSchedule} routine.`;

  if (user.sleepSchedule === candidate.sleepSchedule) {
    sleepScore = 100;
    sleepStatus = 'match';
  } else if (user.sleepSchedule === 'Balanced' || candidate.sleepSchedule === 'Balanced') {
    sleepScore = 75;
    sleepStatus = 'close';
    sleepExplanation = `${candidate.sleepSchedule} pairs flexibly with ${user.sleepSchedule} hours.`;
  } else {
    sleepScore = 30;
    sleepStatus = 'mismatch';
    sleepExplanation = `${user.sleepSchedule} vs. ${candidate.sleepSchedule} — quiet hours will need clear boundaries.`;
  }

  dimensions.push({
    key: 'sleep',
    label: 'Sleep Schedule',
    score: sleepScore,
    weight: 20,
    status: sleepStatus,
    userValue: user.sleepSchedule,
    candidateValue: candidate.sleepSchedule,
    explanation: sleepExplanation,
  });

  // 3. Cleanliness (20%)
  const cleanDiff = Math.abs(user.cleanliness - candidate.cleanliness);
  const cleanScore = cleanDiff === 0 ? 100 : cleanDiff === 1 ? 82 : cleanDiff === 2 ? 52 : 25;
  const cleanStatus: DimensionScore['status'] =
    cleanDiff === 0 ? 'match' : cleanDiff === 1 ? 'close' : 'mismatch';
  const cleanExplanation =
    cleanDiff === 0
      ? `Exact ${user.cleanliness}/5 cleanliness standard match.`
      : cleanDiff === 1
        ? `Within 1 point (${user.cleanliness}/5 vs ${candidate.cleanliness}/5) — very compatible.`
        : `Noticeable gap (${user.cleanliness}/5 vs ${candidate.cleanliness}/5) on tidiness expectations.`;

  dimensions.push({
    key: 'cleanliness',
    label: 'Cleanliness',
    score: cleanScore,
    weight: 20,
    status: cleanStatus,
    userValue: `${user.cleanliness}/5`,
    candidateValue: `${candidate.cleanliness}/5`,
    explanation: cleanExplanation,
  });

  // 4. Work & Study Routine (15%)
  let workScore = 100;
  let workStatus: DimensionScore['status'] = 'match';
  let workExplanation = `Both follow a ${user.workMode} rhythm.`;

  if (user.workMode === candidate.workMode) {
    workScore = 100;
    workStatus = 'match';
  } else if (
    (user.workMode === 'Office Commute' && candidate.workMode === 'Student') ||
    (user.workMode === 'Student' && candidate.workMode === 'Office Commute')
  ) {
    workScore = 78;
    workStatus = 'close';
    workExplanation = 'Complementary daytime schedules outside the flat.';
  } else {
    workScore = 70;
    workStatus = 'close';
    workExplanation = `One works from home while the other commutes (${candidate.workMode}), keeping shared space balanced.`;
  }

  dimensions.push({
    key: 'work',
    label: 'Work Routine',
    score: workScore,
    weight: 15,
    status: workStatus,
    userValue: user.workMode,
    candidateValue: candidate.workMode,
    explanation: workExplanation,
  });

  // 5. Lifestyle & Habits (10%)
  let lifePoints = 0;
  const dietMatch =
    user.diet === candidate.diet || user.diet === 'Flexible' || candidate.diet === 'Flexible';
  const smokingMatch = !user.noSmokingOnly || candidate.smoking === 'No Smoking';
  const socialMatch = user.socialVibe === candidate.socialVibe;

  if (dietMatch) lifePoints += 40;
  else lifePoints += 15;

  if (smokingMatch) lifePoints += 35;
  else lifePoints += 0;

  if (socialMatch) lifePoints += 25;
  else if (user.socialVibe === 'Balanced' || candidate.socialVibe === 'Balanced') lifePoints += 15;
  else lifePoints += 5;

  const lifeStatus: DimensionScore['status'] =
    lifePoints >= 80 ? 'match' : lifePoints >= 55 ? 'close' : 'mismatch';

  const lifeParts: string[] = [];
  lifeParts.push(dietMatch ? `Diet aligns (${candidate.diet})` : `Diet differs (${candidate.diet})`);
  lifeParts.push(smokingMatch ? candidate.smoking : 'Outdoor smoking');
  lifeParts.push(socialMatch ? `${candidate.socialVibe} vibe` : `${candidate.socialVibe}`);

  dimensions.push({
    key: 'lifestyle',
    label: 'Food & Habits',
    score: lifePoints,
    weight: 10,
    status: lifeStatus,
    userValue: `${user.diet} · ${user.noSmokingOnly ? 'No Smoking' : 'Flexible'}`,
    candidateValue: `${candidate.diet} · ${candidate.smoking}`,
    explanation: lifeParts.join(' · '),
  });

  // 6. Locality Preference (10%)
  let areaScore = 100;
  let areaStatus: DimensionScore['status'] = 'match';
  let areaExplanation = `Both prefer ${user.preferredArea}.`;

  if (user.preferredArea === 'All Areas' || candidate.preferredAreas.includes(user.preferredArea)) {
    areaScore = 100;
    areaStatus = 'match';
    areaExplanation =
      user.preferredArea === 'All Areas'
        ? `Open across ${candidate.preferredAreas.slice(0, 2).join(' & ')}.`
        : `${candidate.name.split(' ')[0]} is actively looking in ${user.preferredArea}.`;
  } else {
    areaScore = 45;
    areaStatus = 'mismatch';
    areaExplanation = `Focuses on ${candidate.preferredAreas.join(', ')} rather than ${user.preferredArea}.`;
  }

  dimensions.push({
    key: 'locality',
    label: 'Locality Match',
    score: areaScore,
    weight: 10,
    status: areaStatus,
    userValue: user.preferredArea,
    candidateValue: candidate.preferredAreas[0],
    explanation: areaExplanation,
  });

  const overallScore = Math.round(
    dimensions.reduce((acc, d) => acc + (d.score * d.weight) / 100, 0)
  );

  const matchingSummary = dimensions
    .filter((d) => d.status === 'match')
    .map((d) => d.label);

  const frictionNotes = dimensions
    .filter((d) => d.status === 'mismatch')
    .map((d) => d.explanation);

  return {
    roommate: candidate,
    overallScore,
    dimensions,
    matchingSummary,
    frictionNotes,
  };
}

export function runDemoRecommender(query: string): AIRecommendationResponse {
  const q = query.toLowerCase();

  // Extract budget hint from numbers like 15k, 15000, 20,000
  let targetBudget: number | null = null;
  const kMatch = q.match(/(\d{1,2})\s*k\b/);
  const fullNumMatch = q.match(/(?:rs\.?|₹|inr|under|below|around|budget|max)?\s*(\d{4,5})/);
  if (kMatch) {
    targetBudget = parseInt(kMatch[1], 10) * 1000;
  } else if (fullNumMatch) {
    const parsed = parseInt(fullNumMatch[1], 10);
    if (parsed >= 5000 && parsed <= 80000) targetBudget = parsed;
  }

  const localityKeywords = [
    'indiranagar',
    'koramangala',
    'hsr',
    'whitefield',
    'btm',
    'jp nagar',
    'bellandur',
    'malleswaram',
  ];
  const mentionedAreas = localityKeywords.filter((loc) => q.includes(loc));

  const wantsPG = q.includes('pg') || q.includes('coliving') || q.includes('co-living') || q.includes('meal') || q.includes('food');
  const wantsPrivate = q.includes('1bhk') || q.includes('studio') || q.includes('private') || q.includes('alone');
  const wantsShared = q.includes('2bhk') || q.includes('3bhk') || q.includes('shared') || q.includes('flatmate');
  const wantsMetro = q.includes('metro') || q.includes('purple line') || q.includes('green line') || q.includes('commute');
  const wantsWFH = q.includes('wfh') || q.includes('remote') || q.includes('desk') || q.includes('quiet');
  const wantsStudent = q.includes('student') || q.includes('intern') || q.includes('college') || q.includes('iisc') || q.includes('christ');
  const wantsVeg = q.includes('veg') && !q.includes('non-veg');

  const scoredFlats = SAMPLE_PROPERTIES.map((flat) => {
    let score = 10;
    const reasons: string[] = [];

    if (mentionedAreas.length > 0) {
      const flatLoc = flat.locality.toLowerCase();
      if (mentionedAreas.some((area) => flatLoc.includes(area))) {
        score += 40;
        reasons.push(`Located directly in ${flat.locality}`);
      }
    }

    if (targetBudget !== null) {
      if (flat.monthlyRent <= targetBudget) {
        score += 30;
        reasons.push(`Fits within ₹${targetBudget.toLocaleString('en-IN')}/mo at ₹${flat.monthlyRent.toLocaleString('en-IN')}`);
      } else if (flat.monthlyRent <= targetBudget + 2500) {
        score += 12;
        reasons.push(`Slightly above target at ₹${flat.monthlyRent.toLocaleString('en-IN')}/mo`);
      } else {
        score -= 15;
      }
    }

    if (wantsPG && flat.accommodationType === 'PG / Co-living') {
      score += 22;
      reasons.push('Matches PG / Co-living preference');
    }
    if (wantsPrivate && flat.accommodationType === 'Private 1BHK') {
      score += 22;
      reasons.push('Private 1BHK independence');
    }
    if (wantsShared && flat.accommodationType === 'Shared Flat') {
      score += 20;
      reasons.push('Shared flat setup ideal for splitting rent');
    }
    if (wantsMetro && flat.metroMinutes <= 9) {
      score += 18;
      reasons.push(`${flat.metroDistanceText} to ${flat.nearestMetro}`);
    }
    if (wantsWFH && (flat.amenities.some((a) => a.toLowerCase().includes('desk') || a.toLowerCase().includes('wi-fi') || a.toLowerCase().includes('fiber')) || flat.title.toLowerCase().includes('quiet'))) {
      score += 15;
      reasons.push('WFH-ready connectivity & quiet workspace');
    }
    if (wantsStudent && (flat.monthlyRent <= 15000 || flat.highlights.some((h) => h.toLowerCase().includes('student') || h.toLowerCase().includes('iisc')))) {
      score += 18;
      reasons.push('Student & newcomer friendly budget');
    }
    if (wantsVeg && flat.houseNotes.toLowerCase().includes('vegetarian')) {
      score += 15;
      reasons.push('Vegetarian kitchen preference');
    }

    // Commute hub mentions like ITPL, Ecospace, MG Road, Tech Park
    if (q.includes('itpl') && flat.locality === 'Whitefield') {
      score += 25;
      reasons.push('5 mins from ITPL Main Road');
    }
    if ((q.includes('ecospace') || q.includes('orr') || q.includes('outer ring')) && (flat.locality === 'Bellandur' || flat.locality === 'HSR Layout')) {
      score += 25;
      reasons.push('Direct Outer Ring Road / Ecospace corridor access');
    }
    if (q.includes('iisc') && flat.locality === 'Malleswaram') {
      score += 30;
      reasons.push('10 mins from IISc Campus');
    }

    if (reasons.length === 0) {
      reasons.push(`${flat.accommodationType} in ${flat.locality} near ${flat.nearestMetro}`);
    }

    return { flat, score, reasons };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const scoredRoommates = SAMPLE_ROOMMATES.map((rm) => {
    let score = 10;
    const reasons: string[] = [];

    if (mentionedAreas.length > 0) {
      const areaHit = rm.preferredAreas.find((a) =>
        mentionedAreas.some((m) => a.toLowerCase().includes(m))
      );
      if (areaHit) {
        score += 35;
        reasons.push(`also looking in ${areaHit}`);
      }
    }
    if (targetBudget !== null && targetBudget >= rm.budgetMin - 1500 && targetBudget <= rm.budgetMax + 3000) {
      score += 25;
      reasons.push(`matches your budget range (₹${rm.budgetMin.toLocaleString('en-IN')}–₹${rm.budgetMax.toLocaleString('en-IN')})`);
    }
    if (wantsVeg && rm.diet === 'Vegetarian') {
      score += 25;
      reasons.push('prefers a vegetarian kitchen');
    }
    if (wantsWFH && rm.workMode === 'WFH / Hybrid') {
      score += 20;
      reasons.push('shares a hybrid WFH routine');
    }
    if (wantsStudent && rm.workMode === 'Student') {
      score += 25;
      reasons.push('fellow student/researcher');
    }
    if (q.includes('clean') && rm.cleanliness >= 4) {
      score += 15;
      reasons.push(`${rm.cleanliness}/5 cleanliness standard`);
    }
    if (q.includes('night') && rm.sleepSchedule === 'Night Owl') {
      score += 20;
      reasons.push('fellow Night Owl');
    }
    if (q.includes('early') && rm.sleepSchedule === 'Early Bird') {
      score += 20;
      reasons.push('fellow Early Bird');
    }

    if (reasons.length === 0) {
      reasons.push(`${rm.occupation} targeting ${rm.preferredAreas[0]} with ${rm.cleanliness}/5 cleanliness`);
    }

    return {
      rm,
      score,
      reason: `${rm.name} (${rm.occupation}) ${reasons.join(', ')}.`,
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return {
    mode: 'demo',
    modelUsed: 'Local Demo Recommender (Sample Rules)',
    summary: `Matched ${scoredFlats.length} sample Bengaluru listings and ${scoredRoommates.length} compatible flatmate profiles based on your description${targetBudget ? ` around ₹${targetBudget.toLocaleString('en-IN')}/mo` : ''}.`,
    budgetNote: targetBudget
      ? `In Bengaluru, a budget around ₹${targetBudget.toLocaleString('en-IN')}/mo works best for ${targetBudget <= 13000 ? 'twin/single PGs in BTM or HSR Layout' : targetBudget <= 19000 ? 'private rooms in shared 2BHKs in Indiranagar, Whitefield, or Bellandur' : 'independent 1BHK studios or premium shared flats'}.`
      : 'Shared 2BHK/3BHK flats in Bengaluru typically average ₹14,500–₹18,500 per person, while PGs start around ₹9,500–₹13,000.',
    metroTip:
      'Tip: Picking a flat within 800m of Purple Line (Indiranagar–Whitefield) or Green Line (JP Nagar–Malleswaram) stations saves 35–50 minutes of peak traffic daily.',
    recommendedFlats: scoredFlats.map((item) => ({
      id: item.flat.id,
      reason: `${item.reasons.join('. ')}.`,
      matchHighlights: item.reasons.slice(0, 3),
    })),
    recommendedRoommates: scoredRoommates.map((item) => ({
      id: item.rm.id,
      reason: item.reason,
    })),
  };
}
