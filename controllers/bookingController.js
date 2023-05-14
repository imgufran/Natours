const Stripe = require("stripe");

const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1.) Get the current booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2.) Create checkout session
  const session = await stripe.checkout.sessions.create({
    // Information about the session
    payment_method_types: ["card"],
    mode: 'payment',
    // The page that is loaded if the payment is successful.
    success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    // The page that is loaded if the payment is failed
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // Information about the product
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });

  // 3.) Create session as response
  res.status(200).json({
    status: "success",
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary, because its unsecure. Everyone can make bookings without paying.
  const {tour, user, price} = req.query;
  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({tour, user, price});
  res.redirect(req.originalUrl.split("?")[0]);
  // next()
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
