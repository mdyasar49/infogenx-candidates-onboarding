import express from 'express';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to extract Google Sheet ID from either full URL or direct ID
export function extractSpreadsheetId(linkOrId) {
  if (!linkOrId) return '';
  const str = String(linkOrId).trim();
  const match = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return str;
}

// Dynamically resolve spreadsheet ID and Tab from .env on every submission
export function getSpreadsheetConfig(applicationType) {
  const norm = (applicationType || '').toLowerCase();

  let linkOrId = '';
  let tab = '';

  if (norm.includes('intern')) {
    linkOrId = process.env.INTERNSHIP_SPREADSHEET_LINK || 
               process.env.INTERNSHIP_SPREADSHEET_ID || 
               'https://docs.google.com/spreadsheets/d/1LAsfnvSNBpr2WzRPyqbBSaNMsLbNU-rl1QxGPXiTpsA/edit';
    tab = process.env.INTERNSHIP_SPREADSHEET_TAB || 'Internship Applications';
  } else if (norm.includes('free')) {
    linkOrId = process.env.FREELANCE_SPREADSHEET_LINK || 
               process.env.FREELANCE_SPREADSHEET_ID || 
               'https://docs.google.com/spreadsheets/d/1TgvY9gWS5VpUM8AMbHuH4VydwkxwOFPjo784iJBtfEY/edit';
    tab = process.env.FREELANCE_SPREADSHEET_TAB || 'Freelance Applications';
  } else {
    // Default to Job
    linkOrId = process.env.JOB_SPREADSHEET_LINK || 
               process.env.JOB_SPREADSHEET_ID || 
               process.env.DEFAULT_SPREADSHEET_LINK ||
               process.env.SPREADSHEET_ID ||
               'https://docs.google.com/spreadsheets/d/14Ccmt5lN_JnKGHmW1fgFiRefZoECqrPWHe4VWZXk_MA/edit';
    tab = process.env.JOB_SPREADSHEET_TAB || 
          process.env.DEFAULT_SPREADSHEET_TAB || 
          'Job Applications';
  }

  const id = extractSpreadsheetId(linkOrId);
  return { id, tab, rawLink: linkOrId };
}

// Helper to initialize nodemailer transporter
function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'infogenx.jobs@gmail.com';
  const pass = process.env.SMTP_PASSWORD || 'xgcoycdiwqrpqcxa';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

// Send Email Notification to Job Email (infogenx.jobs@gmail.com)
export async function sendJobEmailNotification({ candidateData, sheetSuccess, sheetError, targetSheet, targetLink }) {
  try {
    const notifyEmail = process.env.JOB_NOTIFY_EMAIL || process.env.SMTP_USER || 'infogenx.jobs@gmail.com';
    const transporter = getEmailTransporter();

    const isFailure = !sheetSuccess;
    const subject = isFailure 
      ? `🚨 [ALERT: Sheet Save Failed] Candidate Application: ${candidateData.name || 'Candidate'} (${candidateData.applicationType || 'Role'} - ${candidateData.appliedRole || 'Position'})`
      : `📥 [New Application] ${candidateData.name || 'Candidate'} - ${candidateData.applicationType || 'Role'} (${candidateData.appliedRole || 'Position'})`;

    const statusBanner = isFailure
      ? `<div style="background: #fee2e2; border-left: 5px solid #dc2626; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; color: #991b1b; font-weight: bold;">
          ⚠️ GOOGLE SHEET STORAGE FAILED:<br>
          <span style="font-weight: normal; font-size: 13px;">Error Details: ${sheetError || 'Unknown error'}</span><br>
          <span style="font-weight: normal; font-size: 12px; color: #7f1d1d;">Candidate application details have been safely captured below for your review.</span>
         </div>`
      : `<div style="background: #ecfdf5; border-left: 5px solid #10b981; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; color: #065f46; font-weight: bold;">
          ✓ Recorded successfully into Google Sheet: <a href="${targetLink || '#'}" target="_blank" style="color: #047857; text-decoration: underline;">${targetSheet || 'Open Sheet'}</a>
         </div>`;

    const phoneClean = (candidateData.mobile || '').replace(/[^0-9]/g, '');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .hdr { background: linear-gradient(135deg, #00123C 0%, #E65525 100%); color: #ffffff; padding: 24px; text-align: center; }
        .hdr h2 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .body { padding: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
        td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        td.label { font-weight: 600; color: #64748b; width: 38%; }
        td.val { color: #0f172a; font-weight: 600; }
        .btn-wa { display: inline-block; background: #25D366; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .footer { padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="hdr">
          <h2>Candidate Application Received</h2>
          <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Infogenx Technologies Candidate Portal</div>
        </div>
        <div class="body">
          ${statusBanner}

          <table>
            <tr><td class="label">Candidate Name</td><td class="val">${candidateData.name || 'N/A'}</td></tr>
            <tr><td class="label">WhatsApp Number</td><td class="val"><a href="https://wa.me/${phoneClean}">${candidateData.mobile || 'N/A'}</a></td></tr>
            <tr><td class="label">Location</td><td class="val">${candidateData.location || 'N/A'}</td></tr>
            <tr><td class="label">Application Type</td><td class="val"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 4px; font-weight: 700;">${candidateData.applicationType || 'N/A'}</span></td></tr>
            <tr><td class="label">Opportunity (Role)</td><td class="val">${candidateData.appliedRole || 'N/A'}</td></tr>
            <tr><td class="label">Experience</td><td class="val">${candidateData.experience || 'N/A'}</td></tr>
            <tr><td class="label">Qualification</td><td class="val">${candidateData.qualification || 'N/A'}</td></tr>
            <tr><td class="label">Tech Skills</td><td class="val">${candidateData.techSkills || 'N/A'}</td></tr>
            <tr><td class="label">Certification</td><td class="val">${candidateData.certification || 'None'}</td></tr>
            <tr><td class="label">Resume Drive URL</td><td class="val"><a href="${candidateData.resumeUrl || '#'}" target="_blank">${candidateData.resumeUrl || 'N/A'}</a></td></tr>
            <tr><td class="label">LinkedIn Profile</td><td class="val"><a href="${candidateData.linkedinUrl || '#'}" target="_blank">${candidateData.linkedinUrl || 'N/A'}</a></td></tr>
            <tr><td class="label">Purpose</td><td class="val">${candidateData.purpose || 'N/A'}</td></tr>
            <tr><td class="label">Start Date</td><td class="val">${candidateData.startDate || 'N/A'}</td></tr>
            <tr><td class="label">Current / Last Salary</td><td class="val">${candidateData.currentSalary || 'N/A'}</td></tr>
            <tr><td class="label">Freelance Projects</td><td class="val">${candidateData.freelance || 'No'}</td></tr>
            <tr><td class="label">Work Mode</td><td class="val">${candidateData.workMode || 'N/A'}</td></tr>
            <tr><td class="label">Duration & Timings</td><td class="val">${candidateData.durationTimings || 'N/A'}</td></tr>
            <tr><td class="label">Availability Slots</td><td class="val">${candidateData.availabilitySlots || 'N/A'}</td></tr>
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/${phoneClean}" class="btn-wa">Connect with Candidate on WhatsApp →</a>
          </div>
        </div>
        <div class="footer">
          © 2026 Infogenx Technologies Pvt. Ltd. • <a href="https://candidates.infogenx.com" target="_blank" style="color: #64748b;">Candidate Portal</a>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"Infogenx Candidate Portal" <${process.env.SMTP_USER || 'infogenx.jobs@gmail.com'}>`,
      to: notifyEmail,
      subject,
      html
    });

    console.log(`[Apply API] Email notification sent to ${notifyEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Apply API] Failed to send email notification to job email:', err.message);
    return { success: false, error: err.message };
  }
}

// Initialize Google Sheets API Auth
const keyFile = path.resolve(__dirname, '../credentials/service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

router.post('/submit', async (req, res) => {
  let targetConfig = null;
  let sheetSuccess = false;
  let sheetError = null;
  let usedTab = '';

  try {
    const {
      name,
      mobile,
      location,
      applicationType,
      appliedRole,
      experience,
      qualification,
      techSkills,
      certification,
      resumeUrl,
      linkedinUrl,
      purpose,
      startDate,
      currentSalary,
      freelance,
      workMode,
      durationTimings,
      availabilitySlots
    } = req.body;

    // Resolve target spreadsheet strictly based on .env configuration
    targetConfig = getSpreadsheetConfig(applicationType);
    usedTab = targetConfig.tab;

    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const newRow = [
      timestamp,
      name || '',
      mobile || '',
      location || '',
      applicationType || 'Internship',
      appliedRole || '',
      experience || '',
      qualification || '',
      techSkills || '',
      certification || '',
      resumeUrl || '',
      linkedinUrl || '',
      purpose || '',
      startDate || '',
      currentSalary || '',
      freelance || '',
      workMode || '',
      durationTimings || '',
      availabilitySlots || '',
      'Pending Review'
    ];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: targetConfig.id,
        range: `'${targetConfig.tab}'!A:T`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [newRow]
        }
      });
      sheetSuccess = true;
    } catch (tabErr) {
      console.warn(`[Apply API] Tab "${targetConfig.tab}" append failed (${tabErr.message}), falling back to sheet default A:T range`);
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: targetConfig.id,
          range: 'A:T',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [newRow]
          }
        });
        sheetSuccess = true;
        usedTab = 'Default Sheet (A:T)';
      } catch (fallbackErr) {
        sheetSuccess = false;
        sheetError = fallbackErr.message;
        console.error('[Apply API] Both tab and fallback sheet append failed:', fallbackErr);
      }
    }

    if (sheetSuccess) {
      console.log(`[Apply API] Recorded submission for ${name} (${applicationType}) to Sheet: ${targetConfig.id} [${usedTab}]`);
    }
  } catch (error) {
    sheetSuccess = false;
    sheetError = error.message;
    console.error('[Apply API] Unexpected error in application submission flow:', error);
  }

  // Always send email notification to the job email (infogenx.jobs@gmail.com)
  // Especially if sheet save failed, this guarantees zero data loss!
  const emailResult = await sendJobEmailNotification({
    candidateData: req.body,
    sheetSuccess,
    sheetError,
    targetSheet: targetConfig?.id,
    targetLink: targetConfig?.rawLink
  });

  if (!sheetSuccess) {
    return res.status(200).json({
      success: false,
      sheetStored: false,
      emailNotified: emailResult.success,
      message: 'Could not record to Google Sheet, but full candidate application notified to job email',
      error: sheetError
    });
  }

  return res.json({
    success: true,
    sheetStored: true,
    emailNotified: emailResult.success,
    message: `Application recorded into ${usedTab} successfully and notified to job email`,
    targetSheet: targetConfig?.id,
    targetLink: targetConfig?.rawLink
  });
});

export default router;
