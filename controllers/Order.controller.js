const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const ApiError = require("../util/AppHandleError");

const UserModel = require("../models/User.model");
const Product = require("../models/products.model");
const Cart = require("../models/Cart.model");
const Order = require("../models/Order.model");
const Coupon = require("../models/Coupon.model");

// end point  POST /api/v1/orders/cartId
// allow to  /User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = req.body.shippingPrice ? req.body.shippingPrice : 0;

  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    shippingPrice,
    totalOrderPrice,
  });

  if (order) {
    const bulkOperations = [];

    cart.cartItems.forEach((item) => {
      bulkOperations.push({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              quantity: -item.quantity,
              sold: item.quantity,
            },
          },
        },
      });
    });

    await Product.bulkWrite(bulkOperations);

    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

// end point  POST /api/v1/orders
// allow to  /User-Admin-Manager
exports.findAllOrders = asyncHandler(async (req, res, next) => {
  if (req.filterObj) {
    const orders = await Order.find(req.filterObj);
    res.status(200).json({
      status: "success",
      numOfOrders: orders.length,
      data: orders,
    });
  } else {
    const orders = await Order.find();
    res.status(200).json({
      status: "success",
      numOfOrders: orders.length,
      data: orders,
    });
  }
});

// end point  POST /api/v1/orders/:id
// allow to  /User-Admin-Manager
exports.findSpecificOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ status: "success", data: order });
});

// end point  PUT /api/v1/orders/:id/pay
// allow to  /Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

// end point  PUT /api/v1/orders/:id/deliver
// allow to  /Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

// end point  PUT /api/v1/orders/:id/cancel
// allow to  /Admin-Manager
exports.updateOrderToCancel = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to canceled
  order.isCanceled = true;
  order.canceledAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

// end point  GET /api/v1/orders/checkout-session/cartId
// allow to  /User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const { shipping_price, line_items } = req.body;

  // 1) Fetch the coupon details if it exists
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  // 2) Fetch the cart details
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`No cart found with ID ${req.params.cartId}`, 404)
    );
  }

  // 3) Determine the cart price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  // Calculate the discount (if a coupon exists)
  let discountPercentage = 0;
  if (coupon) {
    discountPercentage = coupon.discount / 100; // e.g., 10% -> 0.10
  }

  // 4) Calculate total order price after discount
  const taxPrice = 0; // Add any tax logic if necessary
  const totalOrderPrice = cartPrice + taxPrice;

  try {
    // 5) Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items.map((item) => {
        // Apply the discount to the product price (if any)
        const discountedPrice = item.price * (1 - discountPercentage);

        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: item.title,
              description: item.description || "",
              images: item.imageCover
                ? [item.imageCover]
                : ["https://example.com/default-image.jpg"], // Fallback image
            },
            unit_amount: Math.round(discountedPrice * 100), // Price in cents
          },
          quantity: item.quantity,
        };
      }),

      // Shipping details
      shipping_address_collection: {
        allowed_countries: ["EG"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shipping_price * 100, // Shipping cost in cents
              currency: "egp",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 7,
              },
              maximum: {
                unit: "business_day",
                value: 14,
              },
            },
          },
        },
      ],

      // No Stripe discounts object used, we apply the discount directly in the product pricing
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/orders`,
      cancel_url: `${req.protocol}://${req.get("host")}/checkout`,
      customer_email: req.user.email, // Use the user's email from the request
      client_reference_id: req.params.cartId, // Reference to the cart
      metadata: {
        totalOrderPrice: totalOrderPrice.toFixed(2), // Send total order price as metadata
        shippingAddress: JSON.stringify(req.body.shippingAddress), // Save shipping address in metadata
      },
    });

    // 6) Respond with session details
    res.status(200).json({ status: "success", session });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return next(new ApiError("Error creating checkout session", 500));
  }
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const { shippingAddress, shippingPrice } = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await UserModel.findOne({ email: session.customer_email });

  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    shippingPrice,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  if (order) {
    const bulkOperations = [];

    cart.cartItems.forEach((item) => {
      bulkOperations.push({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              stock: -item.stock,
              sold: item.quantity,
            },
          },
        },
      });
    });

    await Product.bulkWrite(bulkOperations);

    await Cart.findByIdAndDelete(cartId);
  }
};

//  This webhook will run when stripe payment success paid
// end point  POST /webhook-checkout
// allow to  /User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
