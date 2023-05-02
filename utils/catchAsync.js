module.exports = (fn) => {
  // This function returns a middleware function
  return (req, res, next) => {
    fn(req, res, next).catch((error) => next(error));
  }
};