import { sendResponse } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`💥 Error: ${err.message}`);

  sendResponse(
    res,
    statusCode,
    false,
    err.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};
