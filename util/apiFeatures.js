class ApiFeatures {
  constructor(buildQuery, queryString) {
    this.buildQuery = buildQuery;
    this.queryString = queryString;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1;
    const skip = (page - 1) * limit;

    const paginate = {};
    paginate.page = page;
    paginate.limit = limit;
    paginate.NumOfPages = Math.ceil(countDocuments / limit);

    if (page * limit < countDocuments) {
      paginate.NextPage = page + 1;
    }
    if (skip > 0) {
      paginate.PreviousPage = page - 1;
    }

    this.buildQuery = this.buildQuery.skip(skip).limit(limit);

    this.paginateResult = paginate;
    return this;
  }

  filter() {
    const queryStrObj = { ...this.queryString };
    const excludeFields = [
      "page",
      "sort",
      "field",
      "fields",
      "limit",
      "keyword",
    ];
    excludeFields.forEach((field) => delete queryStrObj[field]);
    let queryStr = JSON.stringify(queryStrObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.buildQuery.find(queryStr ? JSON.parse(queryStr) : {});

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.buildQuery = this.buildQuery.sort(sortBy);
    } else {
      this.buildQuery = this.buildQuery.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.buildQuery = this.buildQuery.select(fields);
    } else {
      this.buildQuery = this.buildQuery.select("-__v");
    }
    return this;
  }
  search() {
    if (this.queryString.keyword) {
      const searchQuery = {};
      searchQuery.$or = [
        { title: { $regex: this.queryString.keyword, $options: "i" } },
        { name: { $regex: this.queryString.keyword, $options: "i" } },
        { description: { $regex: this.queryString.keyword, $options: "i" } },
      ];
      this.buildQuery = this.buildQuery.find(searchQuery);
    }
    return this;
  }
  // populate() {
  //   this.buildQuery= this.buildQuery.populate({ path: "category", select: "name" });
  //   return this;
  // }
}

module.exports = ApiFeatures;
