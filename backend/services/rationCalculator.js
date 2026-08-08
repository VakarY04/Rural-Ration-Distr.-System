// Computes the ration entitlement for a household based on its member count.
//
// The per-member rates below are placeholder defaults for this prototype.
// Once the distributor/admin module exists, an administrator will be able to
// configure these per depot/scheme instead of using a fixed rate.
const PER_MEMBER_RATES = [
  { key: 'rice', label: 'Rice', amountPerMember: 5, unit: 'kg' },
  { key: 'grains', label: 'Grains', amountPerMember: 3, unit: 'kg' },
  { key: 'pulses', label: 'Pulses', amountPerMember: 1.5, unit: 'kg' },
  { key: 'oil', label: 'Oil', amountPerMember: 0.5, unit: 'L' },
];

export const computeRationBreakdown = (totalMembers) => {
  const members = Math.max(Number(totalMembers) || 0, 0);

  const items = PER_MEMBER_RATES.map((rate) => ({
    key: rate.key,
    label: rate.label,
    quantity: Math.round(rate.amountPerMember * members * 100) / 100,
    unit: rate.unit,
  }));

  const totalKg = items
    .filter((item) => item.unit === 'kg')
    .reduce((sum, item) => sum + item.quantity, 0);

  return { totalMembers: members, totalKg, items };
};
