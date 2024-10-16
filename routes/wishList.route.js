const express = require('express');

const auth = require('../controllers/Auth.controller');

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require('../controllers/wishList.controller');

const router = express.Router();

router.use(auth.protect, auth.allowedTo('user'));

router.route('/').post(addProductToWishlist).get(getLoggedUserWishlist);

router.delete('/:productId', removeProductFromWishlist);

module.exports = router;