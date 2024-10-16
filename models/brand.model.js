const mongoose = require("mongoose");
const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [2, "Too short Brand name"],
      maxlength: [32, "Too long Brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

// Middleware to delete products associated with the brand
brandSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Delete all products that belong to the deleted brand
    await ProductModel.deleteMany({ brand: doc._id });
    // console.log(`Deleted all products related to brand: ${doc._id}`);
  }
});

const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
