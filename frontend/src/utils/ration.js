// Shared ration-allocation rules.
// Kept in one place so the Booking page and the Terminal Hub always agree
// on how much each household receives per member.

export const RATION_RATE_PER_MEMBER_KG = {
  Rice: 5,
  'Wheat Flour': 5,
  Sugar: 1,
};

export const RATION_FLAT_ITEMS = [{ name: 'Refined Oil', quantity: '1 Litre' }];

// Builds the same allocatedItems array shape stored on a Booking document.
export function computeAllocatedItems(memberCount) {
  const members = Math.max(Number(memberCount) || 0, 1);
  return [
    ...Object.entries(RATION_RATE_PER_MEMBER_KG).map(([name, perMember]) => ({
      name,
      quantity: `${members * perMember} kg`,
    })),
    ...RATION_FLAT_ITEMS,
  ];
}

// Total solid ration weight in kg (excludes oil, which is measured in litres).
export function computeTotalQuotaKg(memberCount) {
  const members = Math.max(Number(memberCount) || 0, 1);
  const perMemberTotal = Object.values(RATION_RATE_PER_MEMBER_KG).reduce((a, b) => a + b, 0);
  return members * perMemberTotal;
}
