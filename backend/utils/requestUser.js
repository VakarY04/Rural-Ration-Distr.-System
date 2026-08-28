// Resolves the authenticated user's id regardless of whether the session
// token populated `id` or the Mongoose document exposes `_id`. Centralizing
// this removes the repeated, slightly inconsistent `req.user?.id || req.user?._id`
// fallback that appeared in several controllers.
export const getRequestUserId = (req) => req.user?.id || req.user?._id;
