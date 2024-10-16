const mongoose = require("mongoose");
const { Schema } = mongoose;

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "subCategory is required "],
      unique: [true, "subCategory should be unique"],
      minlength: [2, "subCategory should be at least 2 characters"],
      maxlength: [40, "subCategory should be at most 40 characters"],
    },
    slug: { type: String, lowercase: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "subCategory must be belong to a category"],
    },
  },
  { timestamps: true }
);
subCategorySchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name",
  });
  next();
});

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;
