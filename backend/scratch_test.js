import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER || 'infogenx.dm@gmail.com';
const pass = process.env.SMTP_PASSWORD || 'qfeansqqiwvcpojz';

console.log(`[*] Testing SMTP connection to ${host}:${port} for ${user}...`);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP Connection Verification Failed:", err);
  } else {
    console.log("✅ SMTP Connection Verified Successfully!");
    
    // Test sending email to mdyasardeveloper786@gmail.com
    transporter.sendMail({
      from: '"Infogenx HR Operations" <infogenx.dm@gmail.com>',
      to: 'mdyasardeveloper786@gmail.com',
      subject: 'Infogenx HR Training Credentials - INFOGENX Candidate Onboarding & Assessment Portal Test',
      text: 'Test SMTP email delivery'
    }, (sendErr, info) => {
      if (sendErr) {
        console.error("❌ sendMail Failed:", sendErr);
      } else {
        console.log("✅ sendMail Succeeded! Message ID:", info.messageId, "Response:", info.response);
      }
    });
  }
});
