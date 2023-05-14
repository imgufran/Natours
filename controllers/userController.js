const multer = require("multer");
const sharp = require("sharp");

const AppError = require("./../utils/appError");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

//* MulterStorage -> Kind of definition on how we want to store out files.
// const multerStorage = multer.diskStorage({
//   //? req -> current http request, file -> current file that is being saved, cb -> callback function (similar to next in express), null -> error
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename(req, file, cb) {
//     const fileExtention = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${fileExtention}`);
//   }
// });

//* used to handle the file upload and store the file in memory as a buffer, rather than on disk.
const multerStorage = multer.memoryStorage();

//* In multerFilter, the goal is to test if the uploaded file is an image. If it is we pass boolean `true` to the callback function otherwise `false` along with the error;
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//* upload.single() -> Middleware that handles a single file upload field in the form data.It takes a field name as a parameter and returns middleware that can be used in an Express route handler to handle the file upload.
exports.uploadUserPhoto = upload.single("photo");

// Image processing middleware
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // req.file.buffer property contains the file data as a Buffer object, which can be manipulated and processed.
  await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({
    quality: 90,
  }).toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]; // We're assigning the value of `el` property of obj (given object) to the `el` property of newObj (filter object)
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async function (req, res, next) {
  // 1.) Create error of user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use '/updateMyPassword'",
        400
      )
    );
  }

  // 2.) Filter out unwanted field names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, "name", "email"); // returns for example {name: "Gufran", email: "abc@gmail.com"}

  // Check if there is an image upload, if there is then, update the photo property in the database containing the file name.
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  // 3.) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = function (req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead.",
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // Do not update passwords with this.
exports.deleteUser = factory.deleteOne(User);
