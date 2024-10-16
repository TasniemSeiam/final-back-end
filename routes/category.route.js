const express = require("express");
const {
  createNewCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  uploadImage,
  handelUpload,
  handelUpdateImage,
} = require("../controllers/category.controller");
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../util/validators/category.validator");
const subCategoriesRoute = require("./subCategory.route");
const auth = require('../controllers/Auth.controller');

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoriesRoute);

router
  .route("/")
  .get(getAllCategories)
  .post(auth.protect,auth.allowedTo('admin','seller'),uploadImage, handelUpload, createCategoryValidator, createNewCategory);

router
  .route("/:id")
  .get(getCategoryValidator, getCategoryById)
  .put(auth.protect,auth.allowedTo('admin','seller'),uploadImage, handelUpdateImage, updateCategoryValidator, updateCategory)
  .delete(auth.protect,auth.allowedTo('admin','seller'),deleteCategoryValidator, deleteCategory);

module.exports = router;
