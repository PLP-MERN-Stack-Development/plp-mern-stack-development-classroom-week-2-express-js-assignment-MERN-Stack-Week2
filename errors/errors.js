class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(message) {
    super(message, 404);
  }
}

class ValidationError extends ApiError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message) {
    super(message, 401);
  }
}

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError
};
