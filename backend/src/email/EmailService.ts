import nodemailer from "nodemailer";
import { TransportOptions } from "nodemailer";
import { google } from "googleapis";

export class EmailService {
  static async refreshAccessToken(): Promise<string> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_SECRET,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      const accessToken = credentials.access_token;

      console.log("✅ Access token refreshed successfully");
      return accessToken as string;
    } catch (error) {
      console.error("❌ Error refreshing access token:", error);
      throw new Error("Failed to refresh access token");
    }
  }

  static async transporter() {
    try {
      const accessToken = await this.refreshAccessToken();

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: process.env.MAIL_USERNAME,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      } as TransportOptions);

      return transporter;
    } catch (error) {
      console.error("❌ Error creating transporter:", error);
      throw new Error("Failed to create email transporter");
    }
  }
}
