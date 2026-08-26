import mongoose from 'mongoose';

// Default route origin — the central state warehouse every consignment
// leaves from. Used to seed the singleton settings document.
export const DEFAULT_WAREHOUSE = {
  label: 'Regional Ration Warehouse',
  address: 'Sector 20 Central Warehouse, Greater Noida, Uttar Pradesh',
  lat: 28.4744,
  lng: 77.5040,
};

// Default collection point — mirrors the seeded distributor registry entry
// until per-distributor accounts manage their own records.
export const DEFAULT_COLLECTION_CENTRE = {
  label: 'Sector 12 Ration Distribution Centre',
  address: 'Sector 12, Greater Noida, Uttar Pradesh',
  lat: 28.4711,
  lng: 77.5040,
};

// PDS-aligned default stock split: 35 kg household floor divided across
// rice and wheat. Admins can edit these freely from the console.
export const DEFAULT_ITEMS = [
  { key: 'rice', label: 'Rice', quantity: 20, unit: 'kg' },
  { key: 'wheat', label: 'Wheat', quantity: 15, unit: 'kg' },
];

const itemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg', trim: true },
  },
  { _id: false }
);

// Singleton configuration document (key = 'global'). Holds the two things
// an admin edits from the distributor console:
//   1. delivery  → "Ration Delivery Details" (warehouse → collection centre)
//   2. items     → "Ration Items & Quantity" shown on citizen hubs
const distributionSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'global' },
    delivery: {
      from: {
        label: { type: String, default: DEFAULT_WAREHOUSE.label, trim: true },
        address: { type: String, default: DEFAULT_WAREHOUSE.address, trim: true },
      },
      to: {
        label: { type: String, default: DEFAULT_COLLECTION_CENTRE.label, trim: true },
        address: { type: String, default: DEFAULT_COLLECTION_CENTRE.address, trim: true },
      },
    },
    items: { type: [itemSchema], default: DEFAULT_ITEMS },
  },
  { timestamps: true }
);

// Always resolves exactly one settings row, seeding defaults on first read
// so consumers never have to null-check.
distributionSettingsSchema.statics.getSingleton = async function () {
  const existing = await this.findOne({ key: 'global' });
  if (existing) return existing;
  return this.findOneAndUpdate({ key: 'global' }, { $setOnInsert: {} }, { new: true, upsert: true });
};

const DistributionSettings = mongoose.model('DistributionSettings', distributionSettingsSchema);

export const getDistributionSettings = () => DistributionSettings.getSingleton();

export { DistributionSettings };
export default DistributionSettings;
