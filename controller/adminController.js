import expressAsyncHandler from "express-async-handler";
import Apply from "../models/applyModel.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";

export const viewApply = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const apply = await Apply.findById(id);

  if (!apply) {
    return res.status(401).json({
      success: false,
      message: "Apply Not Found",
    });
  }

  if (req.user && req.user.role === "admin") {
    if (apply.status === "pending") {
      apply.status = "view";
      await apply.save();

      return res.json({
        success: true,
        message: "View Application",
        apply: apply,
      });
    }
  }
});

export const acceptApply = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const apply = await Apply.findById(id).populate("user");

  if (!apply) {
    return res.status(401).json({
      success: false,
      message: "Apply Not Found",
    });
  }

  if (apply.status === "pending") {
    return res.status(400).json({
      success: false,
      message: "Cannot Accept Pending Application",
    });
  }

  if (apply.status === "accepted") {
    return res.status(400).json({
      success: false,
      message: "Application Has Been Accepted",
    });
  }

  apply.status = "accepted";
  await apply.save();

  if (apply.user) {
    const user = await User.findById(apply.user._id);

    if (user) {
      const emailSubject =
        "Congratulations! Your Application has been Accepted";
      const emailMessage = `
        <p>Dear ${user.name},</p>
        <p>Congratulations! We are delighted to inform you that your application for admission has been accepted.</p>
        <p>Our admissions team was thoroughly impressed by your qualifications and achievements. We are confident that you will thrive at our institution.</p>
        <p>We look forward to welcoming you as a valued member of our academic community.</p>
        <p>Thank you for choosing our institution, and once again, congratulations on your acceptance.</p>
        <p>Best regards,</p>
        <p>The Admissions Team</p>
      `;

      await sendEmail({
        email: user.email,
        subject: emailSubject,
        message: emailMessage,
      });
    }
  }

  return res.json({
    success: true,
    message: "Application Accepted & Send Email",
    apply: apply,
  });
});

export const rejectApply = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  const apply = await Apply.findById(id).populate("user");

  if (!apply) {
    return res.status(401).json({
      success: false,
      message: "Apply Not Found",
    });
  }

  if (apply.status === "pending") {
    return res.status(400).json({
      success: false,
      message: "Cannot Reject Pending Application",
    });
  }

  if (apply.status === "rejected") {
    return res.status(400).json({
      success: false,
      message: "Application Has Been Rejected",
    });
  }

  apply.status = "rejected";
  apply.rejectionReason = rejectionReason;
  await apply.save();

  if (apply.user) {
    const user = await User.findById(apply.user._id);

    if (user) {
      const emailSubject = "Application Rejection Notice";
      const emailMessage = `
        <p>Dear ${user.name},</p>
        <p>We regret to inform you that your application for admission has been rejected.</p>
        <p>Your application was carefully reviewed by our admissions team, but unfortunately, we are unable to offer you a place in our program at this time.</p>
        <p><strong style="color: red;">Rejection Reason:</strong></p>
        <p><strong style="color: red;">${rejectionReason}:</strong></p>
        <p>We appreciate your interest in our institution and wish you the best in your future endeavors.</p>
        <p>Thank you for considering us, and we hope you find success in your academic journey.</p>
        <p>Best regards,</p>
        <p>The Admissions Team</p>
      `;

      await sendEmail({
        email: user.email,
        subject: emailSubject,
        message: emailMessage,
      });
    }
  }

  return res.json({
    success: true,
    message: "Application Rejected & Send Email",
    apply: apply,
  });
});

export const downloadPDF = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const apply = await Apply.findById(id).populate("user", "name email image");

  if (!apply) {
    return res.status(401).json({
      success: false,
      message: "Apply Not Found",
    });
  }

  return res.json({
    success: true,
    apply: apply,
  });
});
