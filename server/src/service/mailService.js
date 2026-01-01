import nodemailer from "nodemailer";
import { NODEMAILER_PASS, NODEMAILER_USER } from "../constant.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

export async function sendMail(to, subject, text="", html="") {
  try {
    const info = await transporter.sendMail({
      from: '"Blogs | Stay Smart" <ahmedmasaud942@gmail.com>',
      to,
      subject,
      text,
      html
    });
    // console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}
