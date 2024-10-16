const Coupon = require("../models/Coupon.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../util/AppHandleError");

// end point   GET /api/v1/coupons
// allow to  Admin-Manager
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    status: "success",
    numOfCoupons: coupons.length,
    data: coupons,
  });
});

// end point   GET /api/v1/coupons/:id
// allow to  Admin-Manager
exports.getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(
      new ApiError(`There is no coupon for this id : ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

// end point   POST  /api/v1/coupons
// allow to  Admin-Manager
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({
    status: "success",
    data: coupon,
  });
});

// end point   PUT /api/v1/coupons/:id
// allow to  Admin-Manager
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

// end point   DELETE /api/v1/coupons/:id
// allow to  Admin-Manager
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});
