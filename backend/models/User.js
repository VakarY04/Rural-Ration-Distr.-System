import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'distributor'], default: 'citizen' },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Automatically hash password before saving to the database
userSchema.pre('save', async function () {
  // If the password field hasn't changed (like during a password reset request), skip hashing
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to verify passwords during login operations
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);