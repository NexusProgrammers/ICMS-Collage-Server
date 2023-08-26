import nodemailer from "nodemailer";
import expressAsyncHandler from "express-async-handler";

const receiveEmail = expressAsyncHandler(async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: options.email,
    to: process.env.SMPT_MAIL,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
});

export default receiveEmail;
