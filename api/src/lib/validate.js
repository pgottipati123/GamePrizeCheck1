import { HttpError } from './httpError.js';

/** Parses `input` with a zod schema or throws a 400 listing each invalid field. */
export function validate(schema, input, label) {
  const result = schema.safeParse(input ?? {});
  if (result.success) return result.data;
  const details = result.error.issues.map((issue) => ({
    field: issue.path.length > 0 ? String(issue.path[0]) : label,
    message: issue.message,
  }));
  const summary = details.map((detail) => `${detail.field}: ${detail.message}`).join('; ');
  throw new HttpError(400, `Invalid ${label}: ${summary}`, details);
}
