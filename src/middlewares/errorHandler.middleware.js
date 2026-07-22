const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => ({
      field: el.path,
      message: el.message
    }));
    return ApiResponse.error(res, 'Database Validation Error', 400, errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.error(res, `Duplicate field value entered: ${field}`, 400);
  }

  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
    return ApiResponse.error(
      res,
      'Database Connection Error: Please verify MONGODB_URI in Vercel Environment Variables and ensure MongoDB Atlas IP Access List allows 0.0.0.0/0',
      500
    );
  }

  return ApiResponse.error(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500
  );
};

module.exports = errorHandler;
