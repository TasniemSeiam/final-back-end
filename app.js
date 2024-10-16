const express = require("express");
const path = require("path");
const cookieParser =require("cookie-parser");
const HandleError = require("./util/AppHandleError");
const globalErrorHandler = require("./middleware/error.middleware");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const app = express();

const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const brandRoute = require("./routes/brand.route");
const categoryRoute = require("./routes/category.route");
const subCategoryRoute = require("./routes/subCategory.route");
const productsRoute = require("./routes/products.route");
const couponRoute = require("./routes/Coupon.route");
const wishlistRoute = require("./routes/wishList.route");
const cartRoute = require("./routes/Cart.route");
const orderRoute = require("./routes/Order.route");
const reviewRoute = require("./routes/review.router");
const { webhookCheckout } = require("./controllers/Order.controller");


const corsOptions = {
  origin: ['http://localhost:3000','http://localhost:3001'],
  credentials: true,         
  optionSuccessStatus: 200
}
app.use(cors(  corsOptions));
app.options('*', cors(  corsOptions));


// Set security HTTP headers
app.use(helmet());

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "stock",
      "ratingsAverage",
      "ratingsQuantity",
      "discount"
    ],
  })
);

// Checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

app.use(express.static(path.join(__dirname, 'uploads')));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
const env = process.env.NODE_ENV;
// Load product routes

// Set up morgan for logging based on the environment
//Global middle ware
if (env === "development") {
  app.use(morgan("dev"));
  console.log("env???", env);
}

// } else if (env === 'production') {
//     // Log concise output in Apache combined format for production
//     app.use(morgan('combined'));
// }

//limit requests from the same IP
// const Limiter = rateLimit({
//   max: 150,
//   windowMs: 60 * 60 * 1000,
//   message: "To many requests ,please try again in an hour....",
// });
// app.use("/", Limiter);


app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/subcategories", subCategoryRoute);
app.use("/api/v1/products", productsRoute);
app.use("/api/v1/coupons", couponRoute);
app.use("/api/v1/cart", cartRoute);
app.use('/api/v1/wishlist', wishlistRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/reviews", reviewRoute);

// Handle all unhandled routes (404 Not Found)
app.all("*", (req, res, next) => {
  const err = new HandleError(
    `Can't find ${req.originalUrl} on this server`,
    404
  );
  next(err);
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
