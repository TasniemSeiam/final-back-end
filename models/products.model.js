const mongoose = require("mongoose");
const ReviewModel = require("./review.model");
const { Schema } = mongoose;

const generateProductId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "category is required "],
      unique: [true, "category should be unique"],
      minlength: [3, "category should be at least 3 characters"],
      maxlength: [100, "category should be at most 40 characters"],
    },

    slug: { type: String, lowercase: true, required: true },

    description: {
      type: String,
      required: [true, "description is required"],
      minlength: [3, "description should be at least 3 characters"],
    },

    price: {
      type: Number,
      trim: true,
      required: [true, "price is required"],
    },
    priceAfterDisc: {
      type: Number,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    colors: [String],
    size: [String],
    material: [String],

    imageCover: {
      type: String,
      required: [true, "image is required"],
    },

    images: [String],

    stock: {
      type: Number,
      required: [true, "stock is required"],
    },

    sold: {
      // How many times has this product been sold?
      type: Number,
      default: 0,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category must be belong to a category"],
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    // brand: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Brand",
    // },
    brand:{type:String},
    sellerId: {
      type: Schema.Types.ObjectId,
      require: [true, "seller id is required "],
      ref: "User",
    },
    productId: {
      type: String,
      unique: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  },
  { timestamps: true }
);

// Pre-save hook to generate a random productId if it doesn't already exist
productSchema.pre("save", function (next) {
  if (!this.productId) {
    this.productId = generateProductId();
  }
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name -_id",
  });
  this.populate({
    path: "sellerId",
    select: "username",
  });
  // this.populate({
  //   path: "subcategories",
  //   select: "name -_id",
  // });
  // this.populate({
  //   path: "brand",
  //   select: "name -_id",
  // });
  next();
});

// Middleware to remove reviews associated with the product after deleting it
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Delete all reviews that belong to the deleted product
    await ReviewModel.deleteMany({ product: doc._id });
    console.log(`Deleted all reviews related to product: ${doc._id}`);
  }
});


const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
