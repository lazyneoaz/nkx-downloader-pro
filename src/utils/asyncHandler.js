// Wraps an async route handler so rejected promises are passed to next(err)
// instead of crashing the process or hanging the request.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
