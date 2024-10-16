const express = require("express");
const {
  getAllBrands,
  createNewBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand.controller");
const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../util/validators/brand.validator");
const {
  handelUpload,
  uploadImage,
  handelUpdateImage,
} = require("../controllers/category.controller");
const auth = require('../controllers/Auth.controller');

const router = express.Router();

router
  .route("/")
  .get(getAllBrands)
  .post(auth.protect,auth.allowedTo('admin','seller'),uploadImage, handelUpload, createBrandValidator, createNewBrand);

router
  .route("/:id")
  .get(getBrandValidator, getBrandById)
  .put(auth.protect,auth.allowedTo('admin','seller'),uploadImage, handelUpdateImage, updateBrandValidator, updateBrand)
  .delete(auth.protect,auth.allowedTo('admin','seller'),deleteBrandValidator, deleteBrand);

module.exports = router;
