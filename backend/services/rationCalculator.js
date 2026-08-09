// Computes the ration entitlement for a household, following the actual
// PDS food-grain rule: 5 kg per person per month, with a fixed household
// minimum of 35 kg regardless of family size (so a 1-3 member household
// still gets the full 35 kg floor). Government PDS only guarantees food
// grains (rice, wheat, or coarse grains, per depot stock) — there is no
// separate pulses/sugar/oil entitlement, so only one item is returned.
const GRAIN_PER_MEMBER_KG = 5;
const MIN_HOUSEHOLD_GRAIN_KG = 35;

export const computeRationBreakdown = (totalMembers) => {
  const members = Math.max(Number(totalMembers) || 0, 0);
  const totalKg = Math.max(MIN_HOUSEHOLD_GRAIN_KG, GRAIN_PER_MEMBER_KG * members);

  return {
    totalMembers: members,
    totalKg,
    items: [{ key: 'grains', label: 'Food grains (rice / wheat / coarse grains)', quantity: totalKg, unit: 'kg' }],
  };
};