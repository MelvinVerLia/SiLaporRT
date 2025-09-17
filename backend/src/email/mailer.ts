import nodemailer, { TransportOptions } from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    // pass: process.env.MAIL_PASSWORD,
    clientId: process.env.TEST_ID,
    clientSecret: process.env.TEST_SECRET,
    refreshToken: process.env.TEST_REFRESH_TOKEN,
  },
} as TransportOptions);
