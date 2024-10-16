const express = require("express");
const {
  getUserValidator,
  deleteUserValidation,
  changeUserPasswordValidator,
  changeMyPasswordValidator,
  updateUserValidation,
} = require("../util/validators/user.validator");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  activeUserByAdmin,
  blockUserByAdmin,
  deleteUserByAdmin
} = require("../controllers/user.controller");
const productsRoute = require("./products.route");

const auth = require("../controllers/Auth.controller");
const validationMiddleware = require("../middleware/validator.middleware");

const router = express.Router();
router.use("/:userId/products", productsRoute);


router.use(auth.protect);
router.get("/getMe", getLoggedUserData, getUser);
router.put("/changeMyPassword", changeMyPasswordValidator,updateLoggedUserPassword);
router.put("/updateMe", updateUserValidation, updateLoggedUserData);


// // Admin
router.use(auth.allowedTo("admin", "seller"));
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

// User
router.route("/").get(auth.allowedTo("admin"), getUsers);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  // .put( updateUserValidation, updateUser)
  .delete(deleteUserValidation, deleteUser);

router.put(
  "/update/:id",
  auth.protect,
  updateUserValidation,
  validationMiddleware,
  updateUser
);
router.delete(
  "/delete/:id",
  auth.protect,
  deleteUserValidation,
  validationMiddleware,
  deleteUser
);

router.put("/block/:id",auth.protect, auth.allowedTo("admin"), blockUserByAdmin);
router.put("/active/:id",auth.protect, auth.allowedTo("admin"), activeUserByAdmin);
router.delete("/delete-user/:id",auth.protect, auth.allowedTo("admin"), deleteUserByAdmin);
module.exports = router;
