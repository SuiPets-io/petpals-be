class AppError extends Error {
  constructor(status, data = {}, message) {
    super(message);
    this.message = message || status;
    this.status = status;
    this.data = data;
  }
}

const parseError = (error) => {
  if (error instanceof AppError) {
    return error;
  }
  return {
    stack: error.stack || error,
    message: error.message,
  };
};

module.exports = {
  AppError,
  parseError,
};
