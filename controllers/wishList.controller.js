const asyncHandler = require('express-async-handler');

const UserModel = require('../models/User.model');


// end point   POST /api/v1/wishlist
// allow to User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product added successfully to your wishlist.',
    data: user.wishlist,
  });
});


// end point   DELETE /api/v1/wishlist/:productId
// allow to User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull => remove productId from wishlist array if productId exist
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product removed successfully from your wishlist.',
    data: user.wishlist,
  });
});


// end point   GET /api/v1/wishlist
// allow to User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: user.wishlist,
  });
});