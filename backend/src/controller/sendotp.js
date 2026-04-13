import { Resend } from "resend";
import { loadEnv } from "../env.js";

loadEnv();

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function getOtpEmailContent(otp) {
  return {
    subject: "Your OTP for SkinCare By Aarzoo",
    text: `Your OTP is ${otp}. It expires in 2 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;">
        <p>Your OTP for SkinCare By Aarzoo is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:8px 0;">${otp}</p>
        <p>This OTP expires in 2 minutes.</p>
      </div>
    `,
  };
}

export const sendOTPEmail = async (to, otp) => {
  if (!to) {
    return {
      messageId: null,
      error: { message: "Recipient email is required", name: "ValidationError" },
    };
  }

  if (!otp) {
    return {
      messageId: null,
      error: { message: "OTP is required", name: "ValidationError" },
    };
  }

  if (!resendApiKey || !resend) {
    return {
      messageId: null,
      error: { message: "RESEND_API_KEY is not configured", name: "ConfigError" },
    };
  }

  if (!resendFromEmail) {
    return {
      messageId: null,
      error: { message: "RESEND_FROM_EMAIL is not configured", name: "ConfigError" },
    };
  }

  const sanitizedRecipient = String(to)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 80);
  const idempotencyKey = `otp-verification/${sanitizedRecipient}-${Date.now()}`;
  const content = getOtpEmailContent(otp);

  let data;
  let error;
  try {
    ({ data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: [to],
      subject: content.subject,
      text: content.text,
      html: content.html,
      idempotencyKey,
      tags: [{ name: "category", value: "otp_verification" }],
    }));
  } catch (networkError) {
    return {
      messageId: null,
      error: {
        message: networkError?.message || "Network failure while sending OTP",
        name: networkError?.name || "NetworkError",
      },
    };
  }

  if (error) {
    return { messageId: null, error };
  }

  return { messageId: data?.id || null, error: null };
};
