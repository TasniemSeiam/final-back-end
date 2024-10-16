const CategoryModel = require("../models/category.model");
const ApiError = require("../util/AppHandleError");
const uploadMiddleware = require("../middleware/upload.middleware");
const factory = require("../controllers/handlersFactory.controller");

// Upload single image category cover
const upload = uploadMiddleware("category-image");
const uploadImage = upload.single("image");

const handelUpload = (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No image uploaded", 400));
  }
  const fileUrl = req.file.path;
  req.body.image = fileUrl;
  next();
};
const handelUpdateImage = (req, res, next) => {
  if (req.file) {
    const fileUrl = req.file.path;
    req.body.image = fileUrl;
  }
  next();
};

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  admin , seller
const createNewCategory = factory.createOne(CategoryModel);

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
const getAllCategories = factory.getAll(CategoryModel);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategoryById = factory.getOne(CategoryModel);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  admin , seller
const updateCategory = factory.updateOne(CategoryModel);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  admin , seller
const deleteCategory = factory.deleteOne(CategoryModel);

module.exports = {
  createNewCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  uploadImage,
  handelUpload,
  handelUpdateImage,
};
