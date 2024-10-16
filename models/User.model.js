const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ReviewModel = require("./review.model");
const ProductModel = require("./products.model");
const OrderModel = require("./Order.model");
const CartModel = require("./Cart.model");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    // child reference (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        country: { type: String, trim: true, default: "" },
        city: { type: String, trim: true, default: "" },
        street: { type: String, trim: true, default: "" },
        zipcode: { type: String, trim: true, default: "" },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "wishlist",
    select: "title imageCover ",
  });

  next();
});

// Middleware to remove products, reviews, and orders associated with the user
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Delete all products that belong to the deleted user
    await ProductModel.deleteMany({ sellerId: doc._id });
    console.log(`Deleted all products related to user: ${doc._id}`);

    // Delete all reviews that belong to the deleted user
    await ReviewModel.deleteMany({ user: doc._id });
    console.log(`Deleted all reviews related to user: ${doc._id}`);

    // Delete all orders that belong to the deleted user
    await OrderModel.deleteMany({ user: doc._id });
    console.log(`Deleted all orders related to user: ${doc._id}`);
    
    // Delete all cart that belong to the deleted user
    await CartModel.deleteMany({ user: doc._id });
    console.log(`Deleted all cart related to user: ${doc._id}`);



  }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
