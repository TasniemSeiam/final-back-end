require("dotenv/config");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const  UserModel = require("./../models/User.model");

const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.access_token) {
    try {
      token = req.cookies.access_token;
      // token = req.header.authorization.split(" ")[1]
      let decode = jwt.verify(token, process.env.SECRET_TOKEN);
      req.user = await UserModel.findById(decode.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(403);
    throw new Error("Not authorized, no token");
  }
});

module.exports = verifyToken;
