import express from "express";
import { generateAndSendOTP, verifyOTP } from "../otp";
import { storage } from "../storage";

const router = express.Router();

// Request OTP (signup step)
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    await generateAndSendOTP(email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });
  try {
    const valid = await verifyOTP(email, otp);
    if (!valid) return res.status(400).json({ error: "Invalid or expired OTP" });
    // Mark user as verified if exists
    const user = await storage.getUserByEmail(email);
    if (user && !user.isVerified) {
      await storage.updateUser(user.id, { isVerified: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

export default router;
