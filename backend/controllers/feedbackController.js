import nodemailer from 'nodemailer';
import Feedback from '../models/Feedback.js';
import { getRequestUserId } from '../utils/requestUser.js';
import { sendError } from '../utils/httpError.js';

// Citizen feedback (GIGW Q11): always stored in Mongo; emailed to the owner
// as well when SMTP is configured, otherwise logged for the owner to review
// in the database. Never fails the citizen when only email is down.
export const submitFeedback = async (req, res) => {
  try {
    const { category, message, contact } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Please write your feedback message.' });
    }

    const entry = await Feedback.create({
      user: getRequestUserId(req),
      category: category || 'Suggestion',
      message: String(message).trim().slice(0, 2000),
      contact: String(contact || '').trim().slice(0, 120),
    });

    const ownerInbox = process.env.FEEDBACK_TO || process.env.EMAIL_USER;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && ownerInbox) {
      try {
        const mailer = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: Number(process.env.EMAIL_PORT) || 587,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await mailer.sendMail({
          from: process.env.EMAIL_USER,
          to: ownerInbox,
          subject: `[E-Ration Feedback] ${entry.category} #${entry._id}`,
          text: `${entry.message}\n\n— Contact: ${entry.contact || 'not given'}`,
        });
      } catch (mailError) {
        console.warn('Feedback email fallback activated:', mailError.message);
      }
    }

    res.status(201).json({ message: 'Feedback received. Thank you!', id: entry._id });
  } catch (error) {
    return sendError(res, error, { status: 400 });
  }
};
