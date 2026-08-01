const ApiResponse = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  if (!schema || typeof schema.parse !== 'function') {
    console.error('❌ Validation Middleware Error: Schema is undefined or invalid');
    return next(new Error('Internal Server Error: Invalid validation schema in route'));
  }
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
    if (error.errors && error.errors.length > 0) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.length > 1 ? err.path.slice(1).join('.') : err.path.join('.'),
        message: err.message
      }));
      const firstErrorMsg = formattedErrors[0] ? `${formattedErrors[0].field}: ${formattedErrors[0].message}` : 'Validation Error';
      return ApiResponse.error(res, `Validation Error - ${firstErrorMsg}`, 400, formattedErrors);
    }
    next(error);
  }

};

module.exports = validate;
