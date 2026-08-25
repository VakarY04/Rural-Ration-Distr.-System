import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { updateRegistryPassword } from '../utils/distributorRegistry.js';

// Extension of authController.js — hosts the password-recovery flow
// (forgot + reset) so each controller file stays under 300 lines.

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // Generate a secure, unique reset token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 Hour from now
    await user.save();

    // Mapped precisely to your .env keys using Port 587 TLS upgrading configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"E-Ration" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'E-Ration Portal - Security Password Reset Verification Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e3a8a; text-align: center; text-transform: uppercase;">E-Ration System Workspace</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Greetings,</p>
          <p>A password modification request has been logged against your citizen profile account registry parameters.</p>
          <p>Please click the operational secure bridge link below to execute verification updates:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Reset My E-Ration Password
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b;">This secure authorization link is strictly active for 60 minutes. If you did not request this update, please disregard this email safely.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Recovery email successfully dispatched!" });

  } catch (error) {
    console.error("Mailer Error:", error);
    res.status(500).json({ message: "Internal server error dispatching verification token." });
  }
};

// Reset Password Execution Controller
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Authorization verification failed, token compromised or expired." });
    }

    // Assign the new password (User.js pre-save hook handles automatic hashing automatically)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Keep the government registry file in sync: if this account belongs to
    // a provisioned distributor/admin, their department-issued password in
    // backend/data/distributorRegistry.js is updated with the same value.
    try {
      updateRegistryPassword(user.email, user.phone, password);
    } catch (registryError) {
      console.error('Registry Password Sync Error:', registryError);
    }

    res.status(200).json({ message: "Password updated successfully. Proceed to login." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating authentication parameters." });
  }
};
