// Computes the ration entitlement for a household, following the PDS
// food-grain rule: a fixed household minimum of 35 kg regardless of family
// size, scaling up at 10 kg per person once the family grows past that
// floor (i.e. entitlement = max(35, 10 x members)). Government PDS only
// guarantees food grains (rice, wheat, or coarse grains, per depot stock) —
// there is no separate pulses/sugar/oil entitlement, so only one item is
// returned.
const GRAIN_PER_MEMBER_KG = 10;
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