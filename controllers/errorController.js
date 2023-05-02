const AppError = require("./../utils/appError");

const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = error => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value`
  return new AppError(message, 400);
}

const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(el => el.message);

  const message =  `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
}

const handleJWTError = () => {
  return new AppError("Invalid token, please login again", 401);
}

const handleJWTExpiredError = () => new AppError("Your token has expired. Please login again", 401);

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, res) => {
  // Operational error, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

  // Programming or other unknown error: don't leak error details
  } else {
    // 1.) Log error
    console.error("ERROR 💣", error);

    // 2.) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = function (error, req, res, next) {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let err = Object.assign(error);

    if (err.name === "CastError") {
      err = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }

    if (err.name === "ValidationError") {
      err = handleValidationErrorDB(err);
    }

    if (err.name === "JsonWebTokenError") {
      err = handleJWTError();
    }

    if (err.name === "TokenExpiredError") {
      err = handleJWTExpiredError();
    }
    sendErrorProd(err, res);
  }
};
