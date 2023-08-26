import mongoose from "mongoose";

const applySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: String,
      enum: ["pre-medical", "pre-engineering", "computer-science", "arts"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "view", "accepted", "rejected"],
      default: "pending",
    },
    marks: {
      type: String,
      default: "600",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    rejectionReason: {
      type: String, 
      default: "", 
    },
    phoneNumber: {
      type: String,
      default: "+92",
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: Date.now,
    },
    address: {
      type: String,
      default: "Not specified",
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Apply = mongoose.model("Apply", applySchema);
export default Apply;
