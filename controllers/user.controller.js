// const asyncHandler = require("express-async-handler");
// const bcrypt = require("bcryptjs");
// const UserModel = require("../models/User.model");
// const factory = require("./handlersFactory.controller");
// const ApiError = require("../util/AppHandleError");
// const generateToken = require("../util/generateToken");

// // @desc    Get list of users
// // @route   GET /api/v1/users
// // @access  Private/Admin
// exports.getUsers = asyncHandler(async (req, res) => {
//   const users = await UserModel.find().select("-password");
//   if (users.length === 0) {
//     return res.status(404).json({ message: "No users found" });
//   }

//   res.json(users);
// });

// // @desc    Get specific user by id
// // @route   GET /api/v1/users/:id
// // @access  Private/Admin
// exports.getUser = factory.getOne(UserModel);

// // @desc    Create user
// // @route   POST  /api/v1/users
// // @access  Private/Admin
// exports.createUser = factory.createOne(UserModel);

// // @desc    Update specific user
// // @route   PUT /api/v1/users/:id
// // @access  Private/Admin
// exports.updateUser = asyncHandler(async (req, res, next) => {
//   const document = await User.findByIdAndUpdate(
//     req.params.id,
//     {
//      $set:{
//         username: req.body.username,
//       slug: req.body.slug,
//       phone: req.body.phone,
//       email: req.body.email,
//       profileImg: req.body.profileImg,
//       role: req.body.role,
//       // active: req.body.active,
//       // blocked: req.body.blocked

//     }

//     },
//     {
//       new: true,
//     }
//   );

//   if (!document) {
//     return next(new ApiError(`No document for this id ${req.params.id}`, 404));
//   }
//   res.status(200).json({ data: document });
// });

// exports.changeUserPassword = asyncHandler(async (req, res, next) => {
//   const document = await UserModel.findByIdAndUpdate(
//     req.params.id,
//     {
//       password: await bcrypt.hash(req.body.password, 12),
//       passwordChangedAt: Date.now(),
//     },
//     {
//       new: true,
//     }
//   );

//   if (!document) {
//     return next(new ApiError(`No document for this id ${req.params.id}`, 404));
//   }
//   res.status(200).json({ data: document });
// });

// // @desc    Delete specific user
// // @route   DELETE /api/v1/users/:id
// // @access  Private/Admin
// exports.deleteUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   if (req.user.id !== id) {
//     res.status(403);
//     throw new Error("You can delete only your account");
//   } else {
//     await UserModel.findByIdAndDelete(id);
//     res.status(200).json("User has been deleted");
//   }
// });

// // @desc    Get Logged user data
// // @route   GET /api/v1/users/getMe
// // @access  Private/Protect
// exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
//   req.params.id = req.user._id;
//   next();
// });

// // @route   PUT /api/v1/users/updateMyPassword
// exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
//   // 1) Update user password based user payload (req.user._id)
//   const user = await UserModel.findByIdAndUpdate(
//     req.user._id,
//     {
//       password: await bcrypt.hash(req.body.password, 12),
//       passwordChangedAt: Date.now(),
//     },
//     {
//       new: true,
//     }
//   );
//   const token = generateToken(user._id);

//   res.status(200).json({ data: user, token });
// });


// // @route   PUT /api/v1/users/updateMe
// exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
//   const updatedUser = await UserModel.findByIdAndUpdate(
//     req.user._id,
//     {
//       username: req.body.username,
//       email: req.body.email,
//       phone: req.body.phone,
//       profilePicture: req.body.profilePicture,
//       $addToSet: { addresses: req.body.address }, 
//     },
//     { new: true }
//   );

//   res.status(200).json({ data: updatedUser });
// });


// // @desc    Deactivate logged user
// // @route   DELETE /api/v1/users/deleteMe
// // @access  Private/Protect
// exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
//   await UserModel.findByIdAndUpdate(req.user._id, { active: false });

//   res.status(204).json({ status: "Success" });
// });
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/User.model");
const factory = require("./handlersFactory.controller");
const ApiError = require("../util/AppHandleError");
const generateToken = require("../util/generateToken");

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find().select("-password");
  if (users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  res.json(users);
});

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(UserModel);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createUser = factory.createOne(UserModel);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id) {
    res.status(403);
    throw new Error("You can delete only your account");
  } else {
    await UserModel.findByIdAndDelete(id);
    res.status(200).json("User has been deleted");
  }
});

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @route   PUT /api/v1/users/updateMyPassword
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});


// @route   PUT /api/v1/users/updateMe
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      profilePicture: req.body.profilePicture,
      // $addToSet: { addresses: req.body.address }, 
      addresses: req.body.addresses,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});


// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.activeUserByAdmin = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.params.id, { active: req.body.active });

  res.status(200).json({ status: "Success" });
});

exports.deleteUserByAdmin = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndDelete(req.params.id);

  res.status(200).json({ status: "Success" });
});



exports.blockUserByAdmin = asyncHandler(async (req, res, next) => {
  // await UserModel.findByIdAndUpdate(req.user._id, { blocked: true });
  // const {blocked} = req.body
const document =  await UserModel.findByIdAndUpdate(req.params.id, { $set:{ blocked: req.body.blocked} },{
    new: true
  });

  res.status(200).json({ status: "Success",data :document });
});
