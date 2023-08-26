import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    confirm_password: {
      type: String,
    },
    image: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isApply: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      code: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordCode: {
      code: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.confirm_password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") && !this.isModified("confirm_password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  if (this.password) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.confirm_password) {
    this.confirm_password = await bcrypt.hash(this.confirm_password, salt);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
