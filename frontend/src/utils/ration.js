// Shared ration-allocation rule.
// Kept in one place so the Booking page, Family Profile, and the Terminal
// Hub always agree on how much a household receives.
//
// PDS rule: every household gets a fixed 35 kg minimum of food grains
// (rice/wheat/coarse grains, per depot stock) regardless of family size.
// Larger families scale at 10 kg per person once that exceeds the floor —
// entitlement = max(35, 10 x members). There is no separate pulses/sugar/oil
// entitlement — food grains are the only guaranteed item.
export const GRAIN_PER_MEMBER_KG = 10;
export const MIN_HOUSEHOLD_GRAIN_KG = 35;

export function computeTotalQuotaKg(memberCount) {
  const members = Math.max(Number(memberCount) || 0, 1);
  return Math.max(MIN_HOUSEHOLD_GRAIN_KG, GRAIN_PER_MEMBER_KG * members);
}

export function computeAllocatedItems(memberCount) {
  const total = computeTotalQuotaKg(memberCount);
  return [
    { name: 'Food grains (rice / wheat / coarse grains)', quantity: `${total} kg` },
  ];
}