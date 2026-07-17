import { serialize } from './responseSerializer.js';

export class ApiSuccess {
  static send(res, statusCode, message, data = null, meta = null) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = serialize(data);
    }

    if (meta !== null) {
      response.meta = serialize(meta);
    }

    return res.status(statusCode).json(response);
  }
}
