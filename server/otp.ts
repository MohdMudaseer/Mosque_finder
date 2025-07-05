import redis from "./redis";
import crypto from "crypto";
import { sendVerificationEmail } from "./utils/email";

const OTP_EXPIRY_SECONDS = 60;

export async function generateAndSendOTP(email: string): Promise<void> {
  // Generate 6-digit OTP
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  // Store in Redis with expiry
  await redis.set(`otp:${email}`, otp, "EX", OTP_EXPIRY_SECONDS);
  // Send email (implement sendVerificationEmail)
  await sendVerificationEmail(email, otp);
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const stored = await redis.get(`otp:${email}`);
  if (stored && stored === otp) {
    // Invalidate OTP after use
    await redis.del(`otp:${email}`);
    return true;
  }
  return false;
}
