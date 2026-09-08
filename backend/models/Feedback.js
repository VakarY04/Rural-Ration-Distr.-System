import mongoose from 'mongoose';

// Citizen feedback inbox (GIGW Q11). Stored in Mongo so nothing is lost when
// email isn't configured; the controller also emails the owner when SMTP is.
const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true, default: '' },
    contact: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['Suggestion', 'Issue', 'Question', 'Accessibility', 'Other'],
      default: 'Suggestion',
    },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 2000 },
    status: { type: String, enum: ['Open', 'Reviewed'], default: 'Open' },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
