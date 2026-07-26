import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true }, // Fixed the type definition here
  role: { type: String, required: true }
});

const familySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rationCardNumber: { type: String, required: true, unique: true, trim: true },
  headOfFamily: { type: String, required: true, trim: true },
  totalMembers: { type: Number, required: true, default: 1 },
  members: [memberSchema],
  allocatedWeightKg: { type: Number, required: true, default: 0 },
  mockAadhaarToken: { type: String, default: 'auth_token_synchronized' }
}, { timestamps: true });

export const Family = mongoose.model('Family', familySchema);