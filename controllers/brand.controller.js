const BrandModel = require("../models/brand.model");
const factory = require("../controllers/handlersFactory.controller");
const ApiError = require("../util/AppHandleError");
const uploadMiddleware = require("../middleware/upload.middleware");

// Upload single brand image 
const upload = uploadMiddleware("brand-image");
const uploadImage = upload.single("image");

const handelUpload = (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No image uploaded", 400));
  }
  const fileUrl = req.file.path;
  req.body.image = fileUrl;
  next();
};

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
const createNewBrand = factory.createOne(BrandModel);

// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
const getAllBrands = factory.getAll(BrandModel);

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
const getBrandById = factory.getOne(BrandModel);

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
const updateBrand = factory.updateOne(BrandModel);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
const deleteBrand = factory.deleteOne(BrandModel);

module.exports = {
  createNewBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  uploadImage,
  handelUpload,
};
