import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { google } from "googleapis";

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER,
} = process.env;

/**
 * Generates a Gmail OAuth2 access token using googleapis.
 * @returns Promise<string> - Gmail OAuth2 access token
 */
export async function generateGmailAccessToken(): Promise<string> {
  const oAuth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  oAuth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });
  const { token } = await oAuth2Client.getAccessToken();
  if (!token) throw new Error("Failed to acquire Gmail access token");
  return token;
}

/**
 * Sends an email with Gmail OAuth2 using nodemailer.
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML body
 */
export async function sendMail(to: string, subject: string, html: string) {
  const accessToken = await generateGmailAccessToken();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: GMAIL_USER,
      clientId: GMAIL_CLIENT_ID,
      clientSecret: GMAIL_CLIENT_SECRET,
      refreshToken: GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  } as SMTPTransport.Options);

  await transporter.sendMail({
    from: `"Your App" <${GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
