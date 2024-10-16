const express = require("express");
const {
  getAllProducts,
  createNewProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  handelUploadForUpdate,
  setUserId,
  createFilterObj,
  createFilterSubCategory,
} = require("../controllers/products.controller");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../util/validators/products.validator");

const {
  handelUpload,
  uploadImage,
} = require("../controllers/products.controller");

const auth = require("../controllers/Auth.controller");
const reviewsRoute = require("./review.router");

// const router = express.Router();
const router = express.Router({ mergeParams: true });
router.use("/:productId/reviews", reviewsRoute);


router
  .route("/")
  .get(createFilterObj, getAllProducts)
  .post(
    auth.protect,
    auth.allowedTo("admin", "seller"),
    setUserId,
    uploadImage,
    handelUpload,
    createProductValidator,
    createNewProduct
);
  
// Route for filtering products by subcategory
router
  .route("/subcategory")
  .get(createFilterSubCategory, getAllProducts); // This will now filter by subcategory

router
  .route("/:id")
  .get(getProductValidator, getProductById)
  .put(
    auth.protect,
    auth.allowedTo("admin", "seller"),
    setUserId,
    uploadImage,
    handelUploadForUpdate,
    updateProductValidator,
    updateProduct
  )
  .delete(
    auth.protect,
    auth.allowedTo("admin", "seller"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
