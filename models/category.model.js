const mongoose = require("mongoose");
const ProductModel = require("./products.model");
const SubCategoryModel = require("./subCategory.model");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "category is required "],
      unique: [true, "category should be unique"],
      minlength: [3, "category should be at least 3 characters"],
      maxlength: [40, "category should be at most 40 characters"],
    },
    slug: { type: String, lowercase: true },
    image: {
      type: String,
    },
    // user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Middleware to remove products associated with the category after deleting it
categorySchema.post("findOneAndDelete", async function (doc) {
  if (doc) {

    // Delete all products that belong to the deleted category
    await ProductModel.deleteMany({ category: doc._id });

    // Delete all subcategories that belong to the deleted category

    await SubCategoryModel.deleteMany({ category: doc._id });
    // console.log(`Deleted all subcategories related to category: ${doc._id}`);
  }
});

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
