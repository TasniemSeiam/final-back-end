const { body, param, check } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validator.middleware");
const UserModel = require("../../models/User.model");

const registerVaildation = [
  check("username")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      UserModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  validatorMiddleware,

  body("phone")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Please enter a valid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 to 15 digits"),

  body("address.country")
    .isString()
    .withMessage("Country must be a valid string")
    .trim()
    .escape(),

  body("address.city")
    .isString()
    .withMessage("City must be a valid string")
    .trim()
    .escape(),

  body("address.street")
    .isString()
    .withMessage("street must be a valid string")
    .trim()
    .escape(),

  body("address.zipcode")
    .optional()
    // .isPostalCode("any")
    // .withMessage("Please enter a valid zipcode")
    .trim(),
];

const signInValidation = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("email is required")
    .trim()
    .normalizeEmail(),

  body("password").not().isEmpty().withMessage("password is required").trim(),
];

const updateUserValidation = [
  check("username")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Please enter a valid phone number")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 to 15 digits"),

  body("address.country")
    .optional()
    .isString()
    .withMessage("Country must be a valid string")
    .trim()
    .escape(),

  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a valid string")
    .trim()
    .escape(),

  body("address.street")
    .optional()
    .isString()
    .withMessage("street must be a valid string")
    .trim()
    .escape(),

  body("address.zipcode")
    .optional()
    .isPostalCode("any")
    .withMessage("Please enter a valid zipcode")
    .trim(),

  param("id")
    .not()
    .isEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
];
const deleteUserValidation = [
  param("id")
    .not()
    .isEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
];

const emailForResetValidation = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("Please provide a valid email"),
];
const verifyOTPAndResetPasswordValidation = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .trim(),

  body("otp").not().isEmpty().withMessage("OTP is required"),

  check("newPassword")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];
const changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('currentPassword')
    .notEmpty()
    .withMessage('You must enter your current password'),
  body('passwordConfirm')
    .notEmpty()
    .withMessage('You must enter the password confirm'),
  body('password')
    .notEmpty()
    .withMessage('You must enter new password')
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error('There is no user for this id');
      }
      const isCorrectPassword = await UserModel.comparePassword(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),
  validatorMiddleware,
];
const getUserValidator = [
  param("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];
const changeMyPasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('You must enter your current password'),
  body('passwordConfirm')
    .notEmpty()
    .withMessage('You must enter the password confirm'),
  body('password')
    .notEmpty()
    .withMessage('You must enter new password')
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error('There is no user for this id');
      }
      const isCorrectPassword = await user.comparePassword(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),
  validatorMiddleware,
];

module.exports = {
  registerVaildation,
  signInValidation,
  updateUserValidation,
  deleteUserValidation,
  emailForResetValidation,
  verifyOTPAndResetPasswordValidation,
  changeUserPasswordValidator,
  getUserValidator,
  changeMyPasswordValidator,
};
