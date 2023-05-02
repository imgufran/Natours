const AppError = require("./../utils/appError");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]; // We're assigning the value of `el` property of obj (given object) to the `el` property of newObj (filter object)
    }
  });
  return newObj;
}

exports.updateMe = catchAsync(async function (req, res, next) {
  // 1.) Create error of user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use '/updateMyPassword'", 400));
  }

  // 2.) Filter out unwanted field names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, "name", "email"); // returns for example {name: "Gufran", email: "abc@gmail.com"}

  // 3.) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false});

  res.status(204).json({
    status: "success", 
    data: null
  });
})

exports.createUser = function (req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead."
  });
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // Do not update passwords with this.
exports.deleteUser = factory.deleteOne(User);