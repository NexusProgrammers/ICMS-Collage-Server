import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import generateCode from "../utils/generateCode.js";
import sendEmail from "../utils/sendEmail.js";
import axios from "axios";

export const signUp = expressAsyncHandler(async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    return res.status(401).json({
      success: false,
      message: "Email Not Available",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Passwords Not Match",
    });
  }

  const { code, expiresAt } = generateCode();

  const user = await User.create({
    name,
    email,
    password,
    confirm_password,
    verificationCode: {
      code,
      expiresAt,
    },
  });

  const emailOptions = {
    email: user.email,
    subject: "Email Verification Code",
    message: `
        <h2>Welcome to our ICMS College!</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for signing up. Your verification code is:</p>
        <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3>
        <p>Please use this code to verify your email within 5 minutes.</p>
        <p>If you didn't sign up, you can ignore this email.</p>
        <p>Best regards,</p>
        <p>ICMS College</p>
      `,
  };

  await sendEmail(emailOptions);

  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    message: `Verification OTP Send To ${user.email}`,
    user,
    token,
  });
});

export const googleSignUp = async (req, res) => {
  const { idToken } = req.body;

  const response = await axios.post(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
  );

  let { email, name, picture } = response.data;

  let user = await User.findOne({ email });

  if (user) {
    return res.status(401).json({
      success: false,
      message: "User Already Exists",
    });
  }

  user = await User.create({
    name,
    email,
    emailVerified: true,
    image: picture,
  });

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Sign Up Successfully",
    user,
    token,
  });
};

export const resendVerificationCode = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email Not Registered",
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email Already Verified",
    });
  }

  const { code, expiresAt } = generateCode();

  user.verificationCode = {
    code,
    expiresAt,
  };

  await user.save();

  const emailOptions = {
    email: user.email,
    subject: "Email Verification Code",
    message: `
      <h2>Welcome to our ICMS College!</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for signing up. Your verification code is:</p>
      <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3>
      <p>Please use this code to verify your email within 5 minutes.</p>
      <p>If you didn't sign up, you can ignore this email.</p>
      <p>Best regards,</p>
      <p>ICMS College</p>
    `,
  };

  await sendEmail(emailOptions);

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: `A new OTP has been sent to your email ${user.email}`,
    user,
    token,
  });
});

export const verifyEmail = expressAsyncHandler(async (req, res) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    return res.status(401).json({
      success: false,
      message: "Please Provide Code",
    });
  }

  if (verificationCode.length !== 5) {
    return res.status(401).json({
      success: false,
      message: "Please Provide Complete Code",
    });
  }

  const user = await User.findOne({
    "verificationCode.code": verificationCode,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid Code",
    });
  }

  if (user.verificationCode.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "Verification Code Has Expired",
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email Already Verified",
    });
  }

  const token = generateToken(user._id);

  user.emailVerified = true;
  user.verificationCode = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email Verified Successfully",
    user,
    token,
  });
});

export const signIn = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email Not Registered",
    });
  }

  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email OR Password",
    });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Sign In Successfully",
    user,
    token,
  });
});

export const googleSignIn = expressAsyncHandler(async (req, res) => {
  const { idToken } = req.body;

  let response = await axios.post(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
  );

  console.log(response.data);

  let { email, name, picture, } = response.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      emailVerified: true,
      image: picture,
    });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Google Sign-In Successfully",
    user,
    token,
  });
});

export const forgotPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Email Not Registered",
    });
  }

  const { code, expiresAt } = generateCode();

  user.forgotPasswordCode = { code, expiresAt };
  await user.save();

  const emailOptions = {
    email: user.email,
    subject: "Forgot Password Verification Code",
    message: `
      <h2>Forgot Password Verification Code</h2>
      <p>Dear ${user.name},</p>
      <p>Your verification code for resetting the password is:</p>
      <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3>
      <p>Please use this code to reset your password within 5 minutes.</p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
      <p>Best regards,</p>
      <p>ICMS College</p>
    `,
  };

  await sendEmail(emailOptions);

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: `A code has been sent to your email (${user.email}).`,
    user,
    token,
  });
});

export const resendForgotPasswordCode = expressAsyncHandler(
  async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email Not Registered",
      });
    }

    const { code, expiresAt } = generateCode();

    user.forgotPasswordCode = {
      code,
      expiresAt,
    };

    await user.save();

    const emailOptions = {
      email: user.email,
      subject: "Forgot Password Verification Code",
      message: `
      <h2>Forgot Password Verification Code</h2>
      <p>Dear ${user.name},</p>
      <p>Your verification code for resetting the password is:</p>
      <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3>
      <p>Please use this code to reset your password within 5 minutes.</p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
      <p>Best regards,</p>
      <p>ICMS College</p>
    `,
    };

    await sendEmail(emailOptions);

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: `A new code has sent to your email ${user.email}`,
      token,
      user,
    });
  }
);

export const verifyCode = expressAsyncHandler(async (req, res) => {
  const { code } = req.body;

  const user = await User.findOne({
    "forgotPasswordCode.code": code,
  });

  if (!code) {
    return res.status(401).json({
      success: false,
      message: "Please Provide Code",
    });
  }

  if (code.length !== 5) {
    return res.status(401).json({
      success: false,
      message: "Please Provide Complete Code",
    });
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid Code",
    });
  }

  if (user.forgotPasswordCode.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "Code has expired",
    });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Code Verified Successfully",
    user,
    token,
  });
});

export const resetPassword = expressAsyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email Not Registered",
    });
  }
  user.password = newPassword;

  user.confirm_password = newPassword;

  user.forgotPasswordCode = undefined;

  const token = generateToken(user._id);

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password Reset Successfully",
    user,
    token,
  });
});

export const cancelForgotPasswordCode = expressAsyncHandler(
  async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email Not Registered",
      });
    }

    user.forgotPasswordCode = undefined;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Cancel Forgot Password Request Successfully",
      user,
      token,
    });
  }
);

export const getUserAccount = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User Not Found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

export const updateUserAccount = expressAsyncHandler(async (req, res) => {
  const { name, email, image } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User Not Found",
    });
  }

  if (name) {
    user.name = name;
  }

  if (email) {
    user.email = email;
  }
  if (image) {
    user.image = image;
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Account Updated Successfully",
    user,
  });
});

export const changeUserPassword = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User Not Found",
    });
  }

  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Required Fields",
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords Not Match",
    });
  }

  const isOldPasswordCorrect = await user.matchPassword(oldPassword);

  if (!isOldPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid Old Password",
    });
  }

  if (oldPassword === newPassword) {
    return res.status(401).json({
      success: false,
      message: "New password must be different from the old password",
    });
  }

  if (oldPassword === confirmNewPassword) {
    return res.status(401).json({
      success: false,
      message:
        "Cofirm New password must be different from the old confirm password",
    });
  }

  user.password = newPassword;
  user.confirm_password = confirmNewPassword;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password Updated Successfully",
    user,
  });
});

export const deleteUserAccount = expressAsyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Your password",
    });
  }

  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User Not Found",
    });
  }

  const isPasswordCorrect = await user.matchPassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid Password",
    });
  }

  await User.deleteOne({ _id: user._id });

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
