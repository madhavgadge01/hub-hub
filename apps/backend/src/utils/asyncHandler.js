/**
 * Wrapper for async Express route handlers to forward unhandled rejections to next(err).
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
