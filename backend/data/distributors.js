// Mock lookup of the local distributor assigned to each district. Once the
// distributor/admin module exists, this will come from the database and an
// admin will manage it — for now it's a small static list, keyed by district,
// so citizens still see a real "where do I collect my ration" answer.
const DISTRIBUTORS = [
  {
    district: 'Gautam Buddha Nagar',
    name: 'Sector 12 Ration Distribution Centre',
    address: 'Sector 12, Greater Noida, Uttar Pradesh',
    lat: 28.4744,
    lng: 77.5040,
  },
];

// Falls back to the first distributor on record if a citizen's district
// isn't in the list yet, so the page never shows a broken/empty state.
export const findDistributorForDistrict = (district) =>
  DISTRIBUTORS.find((d) => d.district.toLowerCase() === district?.toLowerCase().trim()) || DISTRIBUTORS[0];