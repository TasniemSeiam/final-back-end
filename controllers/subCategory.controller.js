const SubCategoryModel = require("../models/subCategory.model");
const factory = require("../controllers/handlersFactory.controller");

// @desc    Get specific subcategories for a given category
exports.setCategoryId = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};

// @desc    Create subCategory
// @route   POST  /api/v1/subcategories
// @access  admin , seller
exports.createSubCategory = factory.createOne(SubCategoryModel);
/*
asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const subCategory = await SubCategoryModel.create({
    name,
    slug: slugify(name),
    category,
  });
  res
    .status(201)
    .json({ message: "new subCategory created", data: subCategory });
});
*/

// Nested route
// @route GET /api/v1/categories/:categoryId/subcategories
// @route GET /api/v1/categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId) filterObj = { category: req.params.categoryId };
  req.filterObj = filterObj;
  next();
};

// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = factory.getAll(SubCategoryModel);

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategoryById = factory.getOne(SubCategoryModel);

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  admin , seller
exports.updateSubCategory = factory.updateOne(SubCategoryModel);

// @desc    Delete specific subCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  admin , seller
exports.deleteSubCategory = factory.deleteOne(SubCategoryModel);