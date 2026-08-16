// Shared ration-allocation rule.
// Kept in one place so the Booking page, Family Profile, and the Terminal
// Hub always agree on how much a household receives.
//
// Real PDS rule: 5 kg of food grains (rice/wheat/coarse grains, per depot
// stock) per person per month, with a fixed 35 kg minimum per household
// regardless of family size. There is no separate pulses/sugar/oil
// entitlement — food grains are the only guaranteed item.
export const GRAIN_PER_MEMBER_KG = 5;
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