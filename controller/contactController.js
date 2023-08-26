import expressAsyncHandler from "express-async-handler";
import Contact from "../models/contactModel.js";
import receiveEmail from "../utils/receiveEmail.js";

export const createContact = expressAsyncHandler(async (req, res) => {
  const { subject, email, message, phoneNumber } = req.body;

  if (!subject) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Subject",
    });
  }
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Email",
    });
  }
  if (!message) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Message",
    });
  }
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Phone Number",
    });
  }

  const contact = await Contact.create({
    subject,
    email,
    message,
    phoneNumber,
  });

  const emailOptions = {
    from: `"${email}" <${email}>`,
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; padding: 20px; margin: 0 auto; max-width: 600px;">
        <h2 style="color: #333; margin-bottom: 10px;">Contact Form Submission</h2>
        <p style="color: #555; margin-top: 0;">You have received a new contact form submission:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 120px; padding: 5px;"><strong>From:</strong></td>
            <td style="padding: 5px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Subject:</strong></td>
            <td style="padding: 5px;">${subject}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px 5px;">
              <strong>Message:</strong> ${message}
            </td>
          </tr>
        </table>
        <hr style="border: 1px solid #ccc; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">This email was sent from the contact form on your website.</p>
      </div>
    `,
  };

  await receiveEmail(emailOptions);

  return res.status(201).json({
    success: true,
    message: "Form Submitted Successfully",
    contact,
  });
});
