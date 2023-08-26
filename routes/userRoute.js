import express from "express";
import {
  cancelForgotPasswordCode,
  changeUserPassword,
  deleteUserAccount,
  forgotPassword,
  getUserAccount,
  googleSignIn,
  googleSignUp,
  resendForgotPasswordCode,
  resendVerificationCode,
  resetPassword,
  signIn,
  signUp,
  updateUserAccount,
  verifyCode,
  verifyEmail,
} from "../controller/userController.js";
import {
  signInValidator,
  signUpValidator,
} from "../validators/userValidator.js";
import protect from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/signup", signUpValidator, signUp);

userRouter.post("/google/signup", googleSignUp);

userRouter.post("/google/signin", googleSignIn);

userRouter.post("/resend/verification/code", protect, resendVerificationCode);

userRouter.post("/verify/email", protect, verifyEmail);

userRouter.post("/signin", signInValidator, signIn);

userRouter.post("/forgot/password", forgotPassword);

userRouter.post(
  "/resend/forgot/password/code",
  protect,
  resendForgotPasswordCode
);

userRouter.post("/verify/code", protect, verifyCode);

userRouter.post("/reset/password/:id", protect, resetPassword);

userRouter.get("/cancel/forgot/password", protect, cancelForgotPasswordCode);

userRouter.get("/account", protect, getUserAccount);

userRouter.put("/update/account", protect, updateUserAccount);

userRouter.put("/change/password", protect, changeUserPassword);

userRouter.delete("/delete/account", protect, deleteUserAccount);

export default userRouter;
