import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = expressAsyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not Authorized, User Not Found",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Invalid Token",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not Authorized, No Token Provided",
    });
  }
});

export default protect;
