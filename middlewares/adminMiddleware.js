import asyncHandler from "express-async-handler";

const adminOnly = asyncHandler((req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not Authorized, Admin Only Can Perform This Action",
    });
  }

  next();
});

export default adminOnly;
