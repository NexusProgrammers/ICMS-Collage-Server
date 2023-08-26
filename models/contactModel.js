import mongoose from "mongoose";

const contactSchema = mongoose.Schema(
  {
    subject: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
