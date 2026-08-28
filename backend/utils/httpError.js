// Consistent controller error response. Replaces the repeated try/catch
// `console.error` + `res.status(...).json(...)` boilerplate while preserving
// the exact status code and message each handler used to return.
//
//   sendError(res, error, { status: 400 })            → echoes error.message
//   sendError(res, error, { message: '...' })         → fixed message, 500
//   sendError(res, error, { status, message, logLabel })
export const sendError = (res, error, options = {}) => {
  const { status = 500, message, logLabel } = options;
  if (logLabel) console.error(logLabel, error);
  const body = message ?? error?.message ?? 'Internal server error.';
  return res.status(status).json({ message: body });
};
