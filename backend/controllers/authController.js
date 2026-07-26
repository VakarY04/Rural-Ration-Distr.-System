import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const authController = {
  register: async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ error: 'Email identity already registered.' });

      const user = await User.create({ email, password, role });
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, email: user.email, role: user.role }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: { id: user._id, email: user.email, role: user.role }
        });
      }
      return res.status(401).json({ error: 'Invalid email authentication metrics or password.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(444).json({ error: 'No user profile associated with that email.' });

      // Create raw token to mock out self-service recovery links
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour window
      await user.save();

      return res.json({
        success: true,
        message: 'Password recovery verification token generated.',
        demoResetTokenUrl: `/api/auth/reset-password/${resetToken}`
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) return res.status(400).json({ error: 'Recovery token invalid or expired.' });

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({ success: true, message: 'Password metrics securely updated.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};