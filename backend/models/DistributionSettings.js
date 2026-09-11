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

// Phase 7.2 — slot windows. One global template list (single-centre build);
// each window carries its own capacity + open flag so admins can tune
// crowding per window and close a window without deleting it.
export const DEFAULT_SLOT_CAPACITY = 6;
export const DEFAULT_SLOTS = [
  { key: 'slot-1', label: '09:00 AM - 11:00 AM', capacity: 6, isOpen: true },
  { key: 'slot-2', label: '11:00 AM - 01:00 PM', capacity: 6, isOpen: true },
  { key: 'slot-3', label: '02:00 PM - 04:00 PM', capacity: 6, isOpen: true },
  { key: 'slot-4', label: '04:00 PM - 06:00 PM', capacity: 6, isOpen: true },
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

const slotSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 100 },
    isOpen: { type: Boolean, default: true },
  },
  { _id: false }
);

// Singleton configuration document (key = 'global'). Holds the three things
// an admin edits from the distributor console:
//   1. delivery  → "Ration Delivery Details" (warehouse → collection centre)
//   2. items     → "Ration Items & Quantity" shown on citizen hubs
//   3. slots     → "Slot windows & capacity" (7.2) driving booking guards
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
    slots: { type: [slotSchema], default: DEFAULT_SLOTS },
  },
  { timestamps: true }
);

// Always resolves exactly one settings row, seeding defaults on first read
// so consumers never have to null-check. Backfills slots on older documents
// created before 7.2 added the field.
distributionSettingsSchema.statics.getSingleton = async function () {
  const existing = await this.findOne({ key: 'global' });
  if (existing) {
    if (!Array.isArray(existing.slots) || existing.slots.length === 0) {
      existing.slots = DEFAULT_SLOTS;
      await existing.save();
    }
    return existing;
  }
  return this.findOneAndUpdate({ key: 'global' }, { $setOnInsert: {} }, { new: true, upsert: true });
};

const DistributionSettings = mongoose.model('DistributionSettings', distributionSettingsSchema);

export const getDistributionSettings = () => DistributionSettings.getSingleton();

export { DistributionSettings };
export default DistributionSettings;
