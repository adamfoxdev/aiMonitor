export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.status === 400 && err.details) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.details.map(d => ({
        field: d.context.key,
        message: d.message,
      })),
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
};
