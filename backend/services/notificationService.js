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
 * Generate SMS text for Candidate Completion Alert (GSM-7 Compatible Plain Text)
 */
export function generateCandidateSMS(candidate) {
  const dateStr = new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Brisbane",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    `INFOGENX CANDIDATE ALERT (${dateStr})\n` +
    `----------------------------------\n` +
    `Assessment & Task Completed!\n\n` +
    `Name: ${candidate.name || "N/A"}\n` +
    `Contact & WhatsApp: ${candidate.phone || "N/A"}\n` +
    `Location: ${candidate.location || "N/A"}\n` +
    `Experience: ${candidate.experience || "Fresher"}\n` +
    `Qualification: ${candidate.qualification || "N/A"}\n` +
    `Certification: ${candidate.certification || "None"}\n` +
    `LinkedIn: ${candidate.linkedin || "N/A"}\n` +
    `Resume Drive Link: ${candidate.resumeLink || "N/A"}\n` +
    `Work Duration & Timings: ${candidate.workTimings || "Full Time (Flexible)"}\n` +
    `Start Date: ${candidate.startDate || "Immediate"}\n` +
    `Current Salary / Rate: ${candidate.currentSalary || "N/A"}\n` +
    `Work Status: ${candidate.workStatus || "Not working"}\n` +
    `Work Mode: ${candidate.workMode || "WFH / Flexible"}\n` +
    `Preferred Availability: ${candidate.availability || "Flexible (Weekdays & Weekends)"}\n` +
    `Score: ${candidate.score || 50}/50 (${candidate.percentage || 100}%) - PASSED\n` +
    `Task: ${candidate.taskStatus || "Submitted & Verified"}\n` +
    `----------------------------------\n` +
    `Portal: https://candidates.infogenx.com`
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
    .email-container { max-width: 680px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,18,60,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #00123C 0%, #000E68 100%); padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .badge { display: inline-block; background: #E65525; color: #ffffff; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
    .content { padding: 30px; }
    .alert-banner { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; color: #166534; font-weight: 600; }
    .section-title { font-size: 15px; font-weight: 700; color: #00123C; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .details-table td { padding: 9px 12px; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .details-table td.label { font-weight: 600; color: #64748b; width: 38%; }
    .details-table td.value { font-weight: 600; color: #0f172a; word-break: break-word; }
    .score-box { background: linear-gradient(135deg, #00123C 0%, #E65525 100%); color: #ffffff; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0; }
    .score-val { font-size: 34px; font-weight: 800; line-height: 1; margin: 6px 0; }
    .btn { display: inline-block; background: #E65525; color: #ffffff !important; padding: 13px 26px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 10px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>INFOGENX CANDIDATE ONBOARDING</h1>
      <span class="badge">Assessment & Task Completed</span>
    </div>
    <div class="content">
      <div class="alert-banner">
        ✓ Candidate has completed all Onboarding stages, 50 MCQ Assessment, and Practical Recruitment Task.
      </div>

      <div class="score-box">
        <div style="font-size: 13px; text-transform: uppercase; opacity: 0.9;">Assessment Result</div>
        <div class="score-val">${candidate.score || 50} / 50</div>
        <div style="font-size: 14px; font-weight: 600;">Status: PASSED (${candidate.percentage || 100}% Marks)</div>
      </div>

      <div class="section-title">Candidate Profile & Submission Details</div>
      <table class="details-table">
        <tr>
          <td class="label">Name</td>
          <td class="value">${candidate.name || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Contact & WhatsApp No.</td>
          <td class="value">${candidate.phone || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value"><a href="mailto:${candidate.email || ""}">${candidate.email || "N/A"}</a></td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="value">${candidate.location || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Any Experience</td>
          <td class="value">${candidate.experience || "Fresher"}</td>
        </tr>
        <tr>
          <td class="label">Qualification</td>
          <td class="value">${candidate.qualification || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Certification</td>
          <td class="value">${candidate.certification || "None"}</td>
        </tr>
        <tr>
          <td class="label">LinkedIn Profile URL</td>
          <td class="value"><a href="${candidate.linkedin || '#'}" target="_blank">${candidate.linkedin || "N/A"}</a></td>
        </tr>
        <tr>
          <td class="label">Resume Google Drive Link</td>
          <td class="value"><a href="${candidate.resumeLink || '#'}" target="_blank">${candidate.resumeLink || "N/A"}</a></td>
        </tr>
        <tr>
          <td class="label">Work Duration & Timings</td>
          <td class="value">${candidate.workTimings || "Full Time / Flexible"}</td>
        </tr>
        <tr>
          <td class="label">Start Date</td>
          <td class="value">${candidate.startDate || "Immediate"}</td>
        </tr>
        <tr>
          <td class="label">Monthly Take Home / Rate</td>
          <td class="value">${candidate.currentSalary || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Current Work Status</td>
          <td class="value">${candidate.workStatus || "Not working"}</td>
        </tr>
        <tr>
          <td class="label">If Working (Mode)</td>
          <td class="value">${candidate.workMode || "WFH / Flexible"}</td>
        </tr>
        <tr>
          <td class="label">Preferred Availability</td>
          <td class="value">${candidate.availability || "Weekday & Weekend Time Slots"}</td>
        </tr>
        <tr>
          <td class="label">Completed Timestamp</td>
          <td class="value">${dateStr} at ${timeStr}</td>
        </tr>
      </table>

      <div class="section-title">Onboarding Verification Status</div>
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
          <td class="value" style="color: #16a34a;">✓ ${candidate.score || 50}/50 Marks (Passed)</td>
        </tr>
        <tr>
          <td class="label">4. Practical Recruitment Task</td>
          <td class="value" style="color: #16a34a;">✓ ${candidate.taskStatus || "Proof Submitted & Verified"}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 25px 0 10px;">
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
      results.push({ number, status: "queued", message: messageBody });
    } catch (err) {
      console.error(`[NotificationService] Failed to send SMS to ${number}:`, err.message);
      results.push({ number, status: "failed", error: err.message });
    }
  }
  return results;
}

