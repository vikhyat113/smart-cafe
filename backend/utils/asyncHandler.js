/**
 * Wraps an async Express route handler so that any rejected promise /
 * thrown error is forwarded to next(err) and caught by the centralized
 * errorHandler middleware, instead of crashing the process.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
