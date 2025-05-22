import nodemailer from "nodemailer";
import { emailHtml } from "./emailTemplate";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // SMTP server host
  port: 465, // SMTP port (e.g., 587 for TLS, 465 for SSL)
  secure: true, // Set to true for SSL (port 465), false for TLS (port 587)
  auth: {
    user: process.env.EMAIL_USER, // Email address
    pass: process.env.EMAIL_PASS, // Password or app-specific password
  },
  tls: {
    rejectUnauthorized: false, // Useful for self-signed certificates
  },
});

export const sendOtpEmail = async (
  email: string,
  subject: string,
  otp: string,
  validUntil: string
) => {
  await transporter.sendMail({
    from: `eGarant <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: emailHtml(otp, validUntil),
  });
};
