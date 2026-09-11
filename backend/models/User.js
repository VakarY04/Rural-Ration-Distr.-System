import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Citizen User',
    },
    avatar: {
      type: String, // base64 data URL of a small profile picture
      default: null,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows phone-only users without throwing duplicate/missing field errors
      trim: true,
      lowercase: true,
    },
    password: {
      type: String, // Optional for phone OTP users
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['citizen', 'distributor', 'admin'],
      default: 'citizen',
    },
    shopId: {
      type: String, // FPS identifier from the government registry (e.g. FPS-1001); null for citizens
      trim: true,
      default: null,
    },
    otp: {
      type: String,
      default: undefined,
    },
    otpExpire: {
      type: Date,
      default: undefined,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpire: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if present and modified
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Instance method to check password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export { User };
export default User;