import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

  // Replace just the forgotPassword function inside your authController.js file
  forgotPassword: async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Please provide a valid email address.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'No user profile associated with that email address.' });

    // Generate secure crypto token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour window
    await user.save();

    // Configure the real SMTP email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"E-Ration Portal Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Secure Password Reset Request - Digital India E-Ration Hub',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>National E-Ration Security Gateway</h2>
          <p>You requested a password reset for your citizen database profile account.</p>
          <p>Please click the link below to securely reset your credentials. This link expires in 60 minutes:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1A365D; color: white; text-decoration: none; rounded-radius: 8px; font-weight: bold;">Reset Credentials</a>
          <p style="margin-top: 20px; font-size: 11px; color: #777;">If you did not request this, please secure your profile parameters immediately.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'Password recovery link has been dispatched to your registered email address.'
    });
  } catch (err) {
    return res.status(500).json({ error: `Mail System Fault: ${err.message}` });
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