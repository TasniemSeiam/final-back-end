const asyncHandler = require("express-async-handler");
const ApiError = require("../util/AppHandleError");
const ApiFeatures = require("../util/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new ApiError("document not found", 404));
    }
    res.status(204).json({ message: "document deleted", data: {} });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const name = req.body.name;

    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new ApiError("document not found", 404));
    }
    res.status(200).json({ message: "document updated", data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ message: "new document created", data: document });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      // return res.status(404).json({ message: "document not found" });
      return next(new ApiError("document not found", 404));
    }
    res.status(200).json({ message: "document found", data: document });
  });

exports.getAll = (Model) => 
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    //build query
    const countDocs = await Model.countDocuments();

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(countDocs)
      .filter()
      .search()
      .limitFields()
      .sort();

    //execute query
    const { buildQuery, paginateResult } = apiFeatures;

    const documents = await buildQuery;

    res.status(200).json({
      message: "All documents",
      results: documents.length,
      paginateResult,
      data: { documents },
    });
  });

