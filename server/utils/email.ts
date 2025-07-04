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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@mosquetime.com',
    to,
    subject,
    text,
  });
}
