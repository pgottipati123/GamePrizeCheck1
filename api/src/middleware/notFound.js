import { HttpError } from '../lib/httpError.js';

export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));
}
