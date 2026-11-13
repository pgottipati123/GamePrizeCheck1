import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpError } from '../lib/httpError.js';

const digest = (value) => createHash('sha256').update(value).digest();

/** Protects write endpoints with the shared ADMIN_API_KEY sent as `X-Admin-Key`. */
export const requireAdminKey = (config) => (req, res, next) => {
  if (!config.adminApiKey) {
    return next(new HttpError(503, 'Write endpoint is disabled: ADMIN_API_KEY is not configured'));
  }
  const provided = req.get('X-Admin-Key');
  if (!provided || !timingSafeEqual(digest(provided), digest(config.adminApiKey))) {
    return next(new HttpError(401, 'Missing or invalid X-Admin-Key header'));
  }
  next();
};
