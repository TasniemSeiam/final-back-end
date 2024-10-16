const express = require("express");
const {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  setCategoryId,
  createFilterObj,
} = require("../controllers/subCategory.controller");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../util/validators/subCategory.validator");
const auth = require('../controllers/Auth.controller');
const productsRoute = require("./products.route");


const router = express.Router({ mergeParams: true });
router.use("/:subcategoryId/products", productsRoute);


router
  .route("/")
  .get(createFilterObj ,getSubCategories)
  .post(auth.protect,auth.allowedTo('admin','seller'),setCategoryId,createSubCategoryValidator, createSubCategory);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(auth.protect,auth.allowedTo('admin','seller'),setCategoryId,updateSubCategoryValidator, updateSubCategory)
  .delete(auth.protect,auth.allowedTo('admin','seller'),deleteSubCategoryValidator, deleteSubCategory);

module.exports = router;