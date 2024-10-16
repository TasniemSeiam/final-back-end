const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateOTP = require("../util/generateOTP.js");
const generateToken = require("../util/generateToken.js");
const asyncHandler = require("express-async-handler");

const ApiError = require("../util/AppHandleError");
const sendEmail = require("../util/sendEmail");

const UserModel = require("../models/User.model");

const htmlForResetPAssword = (otpNumber, name) => {
  return `   <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              hello ${name}
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Thank you for choosing our Company. Use the following OTP
              to complete the procedure to change your password. OTP is
              valid for
              <span style="font-weight: 600; color: #1f1f1f;">10 minutes</span>.
              Do not share this code with others, including Archisketch
              employees.
            </p>
            <p
              style="
                margin: 0;
                margin-top: 60px;
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #ba3d4f;
              "
            >
              ${otpNumber}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:moustafaashraf20@gmail.com"
            style="color: #499fb6; text-decoration: none;"
            >moustafaashraf20@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none;"
            >Help Center</a
          >
        </p>
      </main>`;
};

const congratulationsRegister = (name) => {
  return `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px; background-color: #4CAF50; color: #fff; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations! 🎉</h1>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 18px; color: #333;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 18px; color: #333;">We are thrilled to congratulate you on your recent success!</p>
            <p style="font-size: 18px; color: #333;">You have achieved something truly remarkable, and we are excited to celebrate this special moment with you.</p>
            <p style="font-size: 16px; color: #333;">Keep up the great work, and we wish you continued success in all your future endeavors.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
            <p>Best regards,</p>
            <p>e commerce</p>
        </div>
    </div>
</body>`;
};

exports.signup = asyncHandler(async (req, res) => {
  const { password, email, address, ...otherData } = req.body;
  const existedUser = await UserModel.findOne({ email });

  if (existedUser) {
    res.status(409);
    throw new Error("User already existed");
  }

  const userData = {
    ...otherData,
    email: email,
    password,
    addresses: [address],
  };
  await UserModel.create(userData);
  res.status(201).json({ message: "User added successfully" });
  sendEmail(
    userData.email,
    "Thank You For Registration",
    congratulationsRegister(userData.username)
  );
});
// login as user or seller
exports.login = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const validUser = await UserModel.findOne({ email });
  if (!validUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const checkPassword = await validUser.comparePassword(
    req.body.password,
    validUser.password
  );
  console.log("==", checkPassword);
  console.log("Plain password: ", req.body.password);
  console.log("Hashed password from DB: ", validUser.password);

  if (!checkPassword) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(validUser._id);
  const { password, ...rest } = validUser._doc;
  res
    .cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json(rest);
});

// login as admin
exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const validUser = await UserModel.findOne({ email });
  if (!validUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const checkPassword = await validUser.comparePassword(
    req.body.password,
    validUser.password
  );
  // console.log("==", checkPassword);
  // console.log("Plain password: ", req.body.password);
  // console.log("Hashed password from DB: ", validUser.password);

  if (!checkPassword) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

if (validUser.role !== "admin") {
    res.status(401);
    throw new Error("not autherized");
  }

  const token = generateToken(validUser._id);
  const { password, ...rest } = validUser._doc;
  res
    .cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json(rest);
});

// sign in with google
exports.authWithGoogle = asyncHandler(async (req, res) => {
  // check if user already existed in database
  const user = await UserModel.findOne({ email: req.body.email });
  if (user) {
    const token = generateToken(user._id);
    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, //  This is 1 hour
      })
      .status(200)
      .json(user);
  } else {
    // if user doesn't exist in database
    const generatePassword = Math.random().toString(36).slice(-8);
    // const hashedPassword = bcrypt.hashSync(generatePassword, 10);
    const { username, email, photo } = req.body;
    const newUser = new UserModel({
      username,
      email,
      password: generatePassword,
      profilePicture: photo,
    });

    await newUser.save();
    const token = generateToken(newUser._id);
    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 60 * 60 * 1000, // Note: This is 1 hour
      })
      .status(201)
      .json(newUser);
  }
});

// sign out
exports.signOut = asyncHandler(async (req, res) => {
  res.clearCookie("access_token").status(200).json("Sign out success");
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get

  const token = req.cookies["access_token"];
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await UserModel.findById(decoded.id);

  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// handle reset password with send OTP mail

exports.sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const otp = generateOTP();
  user.otp = otp; // to check valid otp or not
  user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  await user.save();

  // send otp to user
  await sendEmail(
    email,
    "Password Reset OTP",
    htmlForResetPAssword(otp, user.username)
  );
  res.status(200).json({ msg: "OTP sent to your email" });
});

// Verify OTP and reset password

exports.verifyOTPAndResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await UserModel.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });
  console.log(user);

  if (!user) {
    res.status(400);
    throw new Error("Invalid OTP or OTP expired");
  }
  // hash new password
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined; // Clear OTP
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});
