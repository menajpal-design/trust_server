const ApiResponse = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.slice(1).join('.'),
        message: err.message
      }));
      return ApiResponse.error(res, 'Validation Error', 400, formattedErrors);
    }
    next(error);
  }
};

module.exports = validate;
