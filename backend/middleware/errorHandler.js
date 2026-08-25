// Central Express error handler — converts parser/body failures and any
// thrown route errors into clean JSON instead of HTML stack dumps.
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON bodies (body-parser sets err.type on parse failures)
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed request body — expected valid JSON.' });
  }

  // Client errors with meaningful messages (payload too large, etc.)
  if (err?.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message || 'Request rejected.' });
  }

  console.error('[Unhandled Server Error]:', err);
  return res.status(500).json({ message: 'Internal server error.' });
};
