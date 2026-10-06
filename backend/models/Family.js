import mongoose from 'mongoose';

// Schema for individual dependents in the family grid
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Member age is required'],
    min: [0, 'Age cannot be negative'],
  },
  relation: {
    type: String,
    trim: true,
  },
});

// Main Family Profile Schema
const familySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rationCardNumber: {
      type: String,
      required: [true, 'Ration Card Document ID is required'],
      trim: true,
    },
    headOfFamily: {
      type: String,
      required: [true, 'Head of Family representative name is required'],
      trim: true,
    },
    address: {
      village: { type: String, required: [true, 'Village/town is required'], trim: true },
      block: { type: String, trim: true },
      district: { type: String, required: [true, 'District is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      pincode: { type: String, trim: true },
    },

    members: [memberSchema],
  },
  {
    timestamps: true,
  }
);

const Family = mongoose.model('Family', familySchema);

// Export BOTH named and default to ensure compatibility across all controller import styles
export { Family };
export default Family;