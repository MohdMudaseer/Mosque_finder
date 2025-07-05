import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string) {
  // Configure your SMTP transport here
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password',
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mosquetime.com',
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('Failed to send email:', err);
    throw new Error('Failed to send email. ' + (err instanceof Error ? err.message : ''));
  }
}

// Send verification OTP email
export async function sendVerificationEmail(to: string, otp: string) {
  const subject = 'Your Verification Code';
  const text = `Your verification code is: ${otp}\nThis code will expire in 1 minute.`;
  await sendEmail(to, subject, text);
}
