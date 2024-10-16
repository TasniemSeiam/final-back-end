const slugify = require("slugify");
const { check, body } = require("express-validator");
const validationMiddleware = require("../../middleware/validator.middleware");

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validationMiddleware,
];

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2, max: 40 })
    .withMessage("name must be between 3 and 40 characters long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validationMiddleware,
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validationMiddleware,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validationMiddleware,
];
