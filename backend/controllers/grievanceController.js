import { GoogleGenerativeAI } from '@google/generative-ai';
import Grievance from '../models/Grievance.js';
import User from '../models/User.js';
import { getRequestUserId } from '../utils/requestUser.js';
import { sendError } from '../utils/httpError.js';
import nodemailer from 'nodemailer';

// Deterministic keyword triage — runs offline so filing never depends on the
// Gemini key. Gemini text (when available) is stored as aiRaw context; the
// structured category/action below drive the queue + citizen display.
const RULES = [
  {
    category: 'Quantity',
    match: ['kam', 'less', 'short', 'quantity', 'kg', 'kilo', 'weight', 'measure', 'nap', 'tol'],
    action: 'Assigned to FPS Inspector for stock-measure verification.',
  },
  {
    category: 'Quality',
    match: ['sada', 'rotten', 'spoilt', 'spoiled', 'fungus', 'smell', 'quality', 'kharab', 'ganda', 'keeda', 'insect'],
    action: 'Assigned to Quality Inspector for grain-sample check.',
  },
  {
    category: 'Access',
    match: ['band', 'closed', 'open', 'timing', 'slot', 'rush', 'crowd', 'bheed', 'line', 'queue', 'denied', 'refused', 'mana'],
    action: 'Assigned to Depot Supervisor for access/slot review.',
  },
  {
    category: 'Corruption',
    match: ['paisa', 'money', 'bribe', 'rishwat', 'extra', 'black', 'chor', 'theft', 'overcharg', 'demand'],
    action: 'Escalated to District Ration Officer for enquiry.',
  },
  {
    category: 'Technical',
    match: ['otp', 'login', 'password', 'app', 'website', 'error', 'aadhaar', 'aadhar', 'biometric', 'ekyc', 'ekyc', 'card'],
    action: 'Assigned to Technical Helpdesk for account verification.',
  },
];

export const triageIssue = (issue) => {
  const hay = String(issue || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some((k) => hay.includes(k))) {
      return { category: rule.category, action: rule.action };
    }
  }
  return { category: 'Other', action: 'Assigned to District Ration Inspector for review.' };
};

const tryGeminiRaw = async (issue) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return '';
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = `You are an AI assistant for a Rural Ration Distribution System in India. Analyze this citizen complaint: "${issue}". Provide: 1) English Translation, 2) Issue Category, and 3) Recommended Administrative Action. Keep under 4 lines.`;
    const result = await model.generateContent(prompt);
    return result.response.text() || '';
  } catch (e) {
    console.warn('Grievance Gemini fallback activated:', e.message);
    return '';
  }
};

const publicGrievance = (g) => ({
  id: g._id,
  issue: g.issue,
  category: g.category,
  aiCategory: g.aiCategory,
  aiSummary: g.aiSummary,
  aiAction: g.aiAction,
  aiRaw: g.aiRaw,
  status: g.status,
  assignedTo: g.assignedTo || '',
  resolution: g.resolution || '',
  rationCardNumber: g.rationCardNumber || '',
  createdAt: g.createdAt,
  updatedAt: g.updatedAt,
});

// POST /grievances — citizen files an issue; server triages (rules + optional
// Gemini), persists the ticket, and returns analysis + ticket together so the
// Help Desk result screen doubles as a filing confirmation.
export const fileGrievance = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized.', code: 'UNAUTHORIZED' });
    }
    const { issue } = req.body || {};
    if (!issue || !String(issue).trim()) {
      return res.status(400).json({ message: 'Please describe your issue.' });
    }
    if (String(issue).length > 1000) {
      return res.status(400).json({ message: 'Issue must be under 1000 characters.' });
    }

    const clean = String(issue).trim();
    const { category, action } = triageIssue(clean);
    const aiRaw = await tryGeminiRaw(clean);

    const citizen = await User.findById(userId).select('rationCardNumber').lean().catch(() => null);

    const doc = await Grievance.create({
      user: userId,
      rationCardNumber: citizen?.rationCardNumber || '',
      issue: clean,
      category,
      aiCategory: category,
      aiSummary: clean.slice(0, 140),
      aiAction: action,
      aiRaw: String(aiRaw || '').slice(0, 2000),
      status: 'Open',
    });

    return res.status(201).json({
      message: 'Grievance filed successfully.',
      grievance: publicGrievance(doc),
      analysis: { category, summary: clean.slice(0, 140), action, response: aiRaw || '' },
    });
  } catch (error) {
    return sendError(res, error, { status: 400 });
  }
};

// GET /grievances/mine — citizen tracks own tickets (status + resolution).
export const getMyGrievances = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const list = await Grievance.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean();
    return res.status(200).json({ grievances: list.map(publicGrievance) });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load your grievances.',
      logLabel: 'My Grievances Error:',
    });
  }
};

// GET /grievances?status=Open|In Review|Resolved — staff queue (single-centre:
// distributors + admins share it; per-shop scoping lands with multi-shop).
export const getGrievanceQueue = async (req, res) => {
  try {
    const { status } = req.query || {};
    const filter = ['Open', 'In Review', 'Resolved'].includes(status) ? { status } : {};
    const list = await Grievance.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const counts = await Grievance.aggregate([
      { $group: { _id: '$status', n: { $sum: 1 } } },
    ]);
    const stats = { Open: 0, 'In Review': 0, Resolved: 0, total: 0 };
    for (const c of counts) {
      if (stats[c._id] !== undefined) stats[c._id] = c.n;
      stats.total += c.n;
    }
    return res.status(200).json({ grievances: list.map(publicGrievance), stats });
  } catch (error) {
    return sendError(res, error, {
      message: 'Failed to load grievance queue.',
      logLabel: 'Grievance Queue Error:',
    });
  }
};

const cleanStr = (v, max = 160) => String(v ?? '').trim().slice(0, max);

// PATCH /grievances/:id — staff assign/track/resolve. Resolving with a note
// notifies the citizen: in-app (resolution field) + email when available.
export const updateGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Grievance.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Grievance not found.' });
    }

    const { status, assignedTo, resolution, category } = req.body || {};
    const wasResolved = doc.status === 'Resolved';

    if (status !== undefined) {
      if (!['Open', 'In Review', 'Resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
      }
      doc.status = status;
    }
    if (assignedTo !== undefined) doc.assignedTo = cleanStr(assignedTo, 120);
    if (resolution !== undefined) doc.resolution = cleanStr(resolution, 1000);
    if (category !== undefined) {
      if (!['Quantity', 'Quality', 'Access', 'Corruption', 'Technical', 'Other'].includes(category)) {
        return res.status(400).json({ message: 'Invalid category.' });
      }
      doc.category = category;
    }
    if (doc.status === 'Resolved' && !doc.resolution) {
      return res.status(400).json({ message: 'A resolution note is required to resolve a grievance.' });
    }

    await doc.save();

    // Notify on fresh resolve: email the citizen when we know their address
    // and SMTP is configured; never fail the staff action when mail is down.
    if (doc.status === 'Resolved' && !wasResolved) {
      try {
        const citizen = await User.findById(doc.user).select('email name').lean();
        if (citizen?.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const mailer = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
          await mailer.sendMail({
            from: process.env.EMAIL_USER,
            to: citizen.email,
            subject: `[E-Ration] Grievance ${doc._id} resolved`,
            text: `Namaste ${citizen.name || ''},\n\nYour grievance "${doc.issue.slice(0, 120)}" has been resolved.\n\nResolution: ${doc.resolution}\n\n— E-Ration Staff`,
          });
        }
      } catch (mailError) {
        console.warn('Grievance notify email fallback activated:', mailError.message);
      }
    }

    return res.status(200).json({ message: 'Grievance updated.', grievance: publicGrievance(doc) });
  } catch (error) {
    return sendError(res, error, { status: 400 });
  }
};
