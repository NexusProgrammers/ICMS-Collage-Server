import expressAsyncHandler from "express-async-handler";
import moment from "moment";
import User from "../models/userModel.js";
import Apply from "../models/applyModel.js";

export const apply = expressAsyncHandler(async (req, res) => {
  const { course, marks, gender, phoneNumber, dateOfBirth, address } = req.body;

  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User Not Found",
    });
  }

  const existingApply = await Apply.findOne({ user: userId });
  if (existingApply) {
    return res.status(400).json({
      success: false,
      message: "Apply Submitted Already",
    });
  }

  const formattedDateOfBirth = moment(dateOfBirth, "DD-MM-YYYY").toDate();

  const apply = await Apply.create({
    user: userId,
    course,
    marks,
    gender,
    phoneNumber,
    dateOfBirth: formattedDateOfBirth,
    address,
  });

  user.isApply = true;
  await user.save();

  const formattedResponse = {
    ...apply.toJSON(),
    dateOfBirth: moment(formattedDateOfBirth).format("DD-MM-YYYY"),
  };

  res.status(201).json({
    success: true,
    message: "Apply Submitted Successfully",
    form: formattedResponse,
  });
});

export const updateApply = expressAsyncHandler(async (req, res) => {
  const { course, marks, gender, phoneNumber, dateOfBirth, address } = req.body;

  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User Not Found",
    });
  }

  const existingApply = await Apply.findOne({ user: userId });

  if (!existingApply) {
    return res.status(401).json({
      success: false,
      message: "Apply not found for the user",
    });
  }

  if (existingApply.status === "view") {
    return res.status(401).json({
      success: false,
      message: "Cannot Update Viewed Application.",
    });
  }
  if (existingApply.status === "accepted") {
    return res.status(401).json({
      success: false,
      message: "Cannot Update Accepted Application.",
    });
  }
  if (existingApply.status === "rejected") {
    return res.status(401).json({
      success: false,
      message: "Cannot Update Rejected Application.",
    });
  }

  if (course) existingApply.course = course;
  if (marks) existingApply.marks = marks;
  if (gender) existingApply.gender = gender;
  if (phoneNumber) existingApply.phoneNumber = phoneNumber;
  if (dateOfBirth)
    existingApply.dateOfBirth = moment(dateOfBirth, "DD-MM-YYYY").toDate();
  if (address) existingApply.address = address;

  const updatedFields = [];

  if (existingApply.isModified("course")) {
    updatedFields.push("Course");
  }
  if (existingApply.isModified("marks")) {
    updatedFields.push("Marks");
  }
  if (existingApply.isModified("gender")) {
    updatedFields.push("Gender");
  }
  if (existingApply.isModified("phoneNumber")) {
    updatedFields.push("Phone Number");
  }
  if (existingApply.isModified("dateOfBirth")) {
    updatedFields.push("Date of Birth");
  }
  if (existingApply.isModified("address")) {
    updatedFields.push("Address");
  }

  if (updatedFields.length > 0) {
    const updatedApply = await existingApply.save();

    const formattedResponse = {
      ...updatedApply.toJSON(),
      dateOfBirth: moment(updatedApply.dateOfBirth).format("DD-MM-YYYY"),
    };

    const updatedFieldsMessage = `${updatedFields.join(", ")}`;

    res.status(200).json({
      success: true,
      message: `${updatedFieldsMessage} Updated Successfully. `,
      apply: formattedResponse,
    });
  } else {
    res.status(200).json({
      success: true,
      message: "No fields were updated.",
      apply: existingApply,
    });
  }
});

export const getApplies = expressAsyncHandler(async (req, res) => {
  const applies = await Apply.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email image");

  res.status(200).json({
    success: true,
    applies,
  });
});

export const getApply = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const apply = await Apply.findById(id).populate("user", "name email image");

  if (!apply) {
    return res.status(401).json({
      success: false,
      message: "Apply Not Found",
    });
  }

  res.status(200).json({
    success: true,
    apply,
  });
});

export const deleteApply = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const apply = await Apply.findById(id);

  if (!apply) {
    return res.status(404).json({
      success: false,
      message: "Apply Not Found",
    });
  }

  if (apply.status === "view") {
    return res.status(401).json({
      success: false,
      message: "Cannot Delete Viewed Application.",
    });
  }
  if (apply.status === "accepted") {
    return res.status(401).json({
      success: false,
      message: "Cannot Delete Accepted Application.",
    });
  }
  if (apply.status === "rejected") {
    return res.status(401).json({
      success: false,
      message: "Cannot Delete Rejected Application.",
    });
  }

  await Apply.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    message: "Apply Deleted Successfully",
  });
});

export const getAcceptedApplies = expressAsyncHandler(async (req, res) => {
  const acceptedApplies = await Apply.find({ status: "accepted" }).populate(
    "user"
  );
  res.json({
    success: true,
    applies: acceptedApplies,
  });
});

export const getRejectedApplies = expressAsyncHandler(async (req, res) => {
  const rejectedApplies = await Apply.find({ status: "rejected" }).populate(
    "user"
  );
  res.json({
    success: true,
    applies: rejectedApplies,
  });
});

export const getTotalApplies = expressAsyncHandler(async (req, res) => {
  const totalApplies = await Apply.find().populate("user");
  res.json({
    success: true,
    applies: totalApplies,
  });
});

export const getNewApplies = expressAsyncHandler(async (req, res) => {
  const newApplies = await Apply.find({ status: "pending" }).populate("user");
  res.json({
    success: true,
    applies: newApplies,
  });
});

export const getViewedApplies = expressAsyncHandler(async (req, res) => {
  const viewedApplies = await Apply.find({ status: "view" }).populate("user");
  res.json({
    success: true,
    applies: viewedApplies,
  });
});