import mongoose from 'mongoose';

// Fail-fast gate: while the database is unreachable, answer API calls with
// a clean 503 immediately instead of letting Mongoose buffer each query
// for 10s and blow up with timeout stack traces.
export const dbGate = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'The service is temporarily reconnecting to its database. Please try again shortly.',
    });
  }
  next();
};
