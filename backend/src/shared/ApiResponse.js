/**
 * Standardized API Response format.
 * Ensures the frontend always receives a consistent structure.
 */
export class ApiResponse {
  /**
   * Send a success response
   * @param {Object} res Express response object
   * @param {number} statusCode HTTP status code
   * @param {string} message Success message
   * @param {any} data Payload
   * @param {Object} meta Pagination or extra meta info
   */
  static success(res, statusCode, message, data = null, meta = null) {
    const response = {
      success: true,
      message,
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    if (meta !== null) {
      response.meta = meta;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response (usually called by the global error handler)
   * @param {Object} res Express response object
   * @param {number} statusCode HTTP status code
   * @param {string} message Error message
   * @param {Array} errors Array of detailed errors (e.g. validation errors)
   * @param {string} stack Stack trace (only in development)
   */
  static error(res, statusCode, message, errors = null, stack = null) {
    const response = {
      success: false,
      message,
    };

    if (errors !== null) {
      response.errors = errors;
    }

    if (stack !== null) {
      response.stack = stack;
    }

    return res.status(statusCode).json(response);
  }
}
