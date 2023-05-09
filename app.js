const path = require("path");
const hpp = require("hpp");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         "connect-src": ["'self'", "https://cdnjs.cloudflare.com"],
//       },
//     },
//   })
// );

// Pug engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

console.log(process.env.NODE_ENV);

//? MIDDLEWAREs
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", "http://127.0.0.1:3000/*"],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", "https:", "data:"],
//       scriptSrc: ["'self'", "https://*.cloudflare.com"],
//       scriptSrc: [
//         "'self'",
//         "https://*.stripe.com",
//         "https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js",
//       ],
//       frameSrc: ["'self'", "https://*.stripe.com"],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", "https:", "unsafe-inline"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limiter -> Middleware function -> Limits requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "To many requests from this IP, please try again in an hour",
});
app.use("/api", limiter);

// express.json() -> Middleware -> Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});

// Mounting Routes
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

//* Error handling middleware
app.all("*", (req, res, next) => {
  next(new AppError(`lol`, 304));
});

//* Global error handling middleware -> 4 Arguments
app.use(globalErrorHandler);

module.exports = app;
