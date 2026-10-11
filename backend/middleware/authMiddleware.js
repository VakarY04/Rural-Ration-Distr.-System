import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Phase 6.1 — no weak fallback. Boot refuses to start in production
  // without JWT_SECRET (server.js); dev still needs an explicit value.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('Auth Middleware: JWT_SECRET is not configured.');
    return res.status(500).json({ message: 'Server auth misconfigured.' });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      // Phase 6.5 log hygiene: stale/rotated-secret tokens are routine client
      // states (e.g. after a JWT_SECRET rotation), not server faults — one
      // line, no stack. Full traces stay for unexpected verify failures.
      if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
        console.warn(`Auth rejected (${error.name}) for ${req.method} ${req.path}.`);
      } else {
        console.error('Auth Middleware Token Error:', error);
      }
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no session token.' });
  }
};

export default protect;