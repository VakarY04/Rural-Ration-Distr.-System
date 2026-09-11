import mongoose from 'mongoose';

// Grievance queue (Phase 7.3) — every AI Help Desk analysis becomes a tracked
// ticket: citizen files (issue + AI triage snapshot), staff assign/track/
// resolve, citizen sees status + resolution in-app (and by email when SMTP +
// citizen email exist). Single-centre build: no shop scoping yet; staff roles
// share one queue (distributors resolve, admins assign/escalate per matrix).
const grievanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rationCardNumber: { type: String, trim: true, default: '' },
    issue: { type: String, required: [true, 'Issue is required'], trim: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ['Quantity', 'Quality', 'Access', 'Corruption', 'Technical', 'Other'],
      default: 'Other',
    },
    aiCategory: { type: String, trim: true, default: '' },
    aiSummary: { type: String, trim: true, default: '' },
    aiAction: { type: String, trim: true, default: '' },
    aiRaw: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Open', 'In Review', 'Resolved'],
      default: 'Open',
    },
    assignedTo: { type: String, trim: true, default: '' },
    resolution: { type: String, trim: true, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

grievanceSchema.index({ user: 1, createdAt: -1 });
grievanceSchema.index({ status: 1, createdAt: -1 });

export const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;
