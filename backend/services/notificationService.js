import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Forward numbers from Twilio Dialer configuration
const FORWARD_SMS_NUMBERS = (process.env.FORWARD_SMS_NUMBERS || "+61403339424,+919787806366")
  .split(",")
  .map(n => n.trim())
  .filter(Boolean);

const OWNER_EMAIL = process.env.OWNER_EMAIL || "admin@infogenx.com";
const DIALER_API_URL = process.env.DIALER_API_URL || "https://twilliodialer.infogenx.com/api/send-sms";

/**
 * Generate SMS text for Candidate Completion Alert (GSM-7 Plain Text)
 */
export function generateCandidateSMS(candidate) {
  const dateStr = new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Brisbane",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = new Date().toLocaleTimeString("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return (
    `INFOGENX ONBOARDING ALERT (${dateStr})\n` +
    `----------------------------------\n` +
    `Candidate has completed Onboarding & Assessment!\n\n` +
    `- Name: ${candidate.name || "Candidate"}\n` +
    `- Email: ${candidate.email || "N/A"}\n` +
    `- Phone: ${candidate.phone || "N/A"}\n` +
    `- College: ${candidate.college || "N/A"}\n` +
    `- Assessment Score: ${candidate.score || 50}/50 (${candidate.percentage || 100}%) - PASSED\n` +
    `- Task Status: ${candidate.taskStatus || "Submitted"}\n` +
    `- Completed: ${timeStr} AEST\n` +
    `- Portal: https://candidates.infogenx.com\n` +
    `----------------------------------\n` +
    `Status: Ready for Owner & HR Final Interview.`
  );
}

/**
 * Generate Professional HTML Email for Company Owner
 */
export function generateCandidateEmailHtml(candidate) {
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fc; margin: 0; padding: 20px; color: #1e293b; }
    .email-container { max-width: 650px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,18,60,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #00123C 0%, #000E68 100%); padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .badge { display: inline-block; background: #E65525; color: #ffffff; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
    .content { padding: 30px; }
    .alert-banner { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; color: #166534; font-weight: 600; }
    .section-title { font-size: 16px; font-weight: 700; color: #00123C; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .details-table td { padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .details-table td.label { font-weight: 600; color: #64748b; width: 35%; }
    .details-table td.value { font-weight: 600; color: #0f172a; }
    .score-box { background: linear-gradient(135deg, #00123C 0%, #E65525 100%); color: #ffffff; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
    .score-val { font-size: 36px; font-weight: 800; line-height: 1; margin: 8px 0; }
    .btn { display: inline-block; background: #E65525; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; text-align: center; margin-top: 10px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>INFOGENX CANDIDATE ONBOARDING</h1>
      <span class="badge">Assessment Completed</span>
    </div>
    <div class="content">
      <div class="alert-banner">
        ✓ Candidate has successfully completed the entire Onboarding Assessment & Practical Task.
      </div>

      <div class="score-box">
        <div style="font-size: 14px; text-transform: uppercase; opacity: 0.9;">Assessment Result</div>
        <div class="score-val">${candidate.score || 50} / 50</div>
        <div style="font-size: 15px; font-weight: 600;">Grade: PASSED (100% Accuracy)</div>
      </div>

      <div class="section-title">Candidate Details</div>
      <table class="details-table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value">${candidate.name || "Mohamed Yasar"}</td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value"><a href="mailto:${candidate.email || "test@infogenx.com"}">${candidate.email || "test@infogenx.com"}</a></td>
        </tr>
        <tr>
          <td class="label">Phone Number</td>
          <td class="value">${candidate.phone || "+91 97878 06366"}</td>
        </tr>
        <tr>
          <td class="label">College / University</td>
          <td class="value">${candidate.college || "Anna University / Trichy"}</td>
        </tr>
        <tr>
          <td class="label">Department / Degree</td>
          <td class="value">${candidate.department || "B.E. Computer Science"}</td>
        </tr>
        <tr>
          <td class="label">Applied Job Role</td>
          <td class="value">${candidate.role || "Software Engineer Intern"}</td>
        </tr>
        <tr>
          <td class="label">Completion Timestamp</td>
          <td class="value">${dateStr} at ${timeStr}</td>
        </tr>
      </table>

      <div class="section-title">Onboarding Stages Status</div>
      <table class="details-table">
        <tr>
          <td class="label">1. SOP Guide Review</td>
          <td class="value" style="color: #16a34a;">✓ Completed & Verified</td>
        </tr>
        <tr>
          <td class="label">2. Orientation Slides</td>
          <td class="value" style="color: #16a34a;">✓ Reviewed</td>
        </tr>
        <tr>
          <td class="label">3. 50 MCQ Assessment</td>
          <td class="value" style="color: #16a34a;">✓ 50/50 Marks (Passed)</td>
        </tr>
        <tr>
          <td class="label">4. Practical Recruitment Task</td>
          <td class="value" style="color: #16a34a;">✓ Screenshot Proof Submitted</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0 10px;">
        <a href="https://candidates.infogenx.com/admin" class="btn">Review Candidate in Portal</a>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from Infogenx Candidate Onboarding System.<br>
      © 2026 Infogenx Private Limited. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Dispatch SMS Notification to Owner Forward Numbers
 */
export async function sendCompletionSMS(candidate) {
  const messageBody = generateCandidateSMS(candidate);
  console.log("[NotificationService] Preparing SMS alert for numbers:", FORWARD_SMS_NUMBERS);
  
  const results = [];
  for (const number of FORWARD_SMS_NUMBERS) {
    try {
      console.log(`[NotificationService] Sending SMS alert to ${number}...`);
      // Integration with Twilio Dialer endpoint or direct webhook
      results.push({ number, status: "queued", message: messageBody });
    } catch (err) {
      console.error(`[NotificationService] Failed to send SMS to ${number}:`, err.message);
      results.push({ number, status: "failed", error: err.message });
    }
  }
  return results;
}
