// Express identifies error handlers by their four-argument signature, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (config) => (err, req, res, next) => {
  // Malformed JSON bodies from express.json() arrive as 400s with `type`.
  const status = err.status ?? err.statusCode ?? 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message:
        isServerError && config.isProduction
          ? 'Internal server error'
          : err.type === 'entity.parse.failed'
            ? 'Request body must be valid JSON'
            : err.message,
      ...(err.details && { details: err.details }),
      ...(!config.isProduction && isServerError && { stack: err.stack }),
    },
  });
};
