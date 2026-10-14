import express from 'express';
import { google } from 'googleapis';
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

// Initialize Google Sheets API Auth
const keyFile = path.resolve(__dirname, '../credentials/service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

router.post('/submit', async (req, res) => {
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
    const targetConfig = getSpreadsheetConfig(applicationType);

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

    let usedTab = targetConfig.tab;
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
    } catch (tabErr) {
      console.warn(`[Apply API] Tab "${targetConfig.tab}" append failed (${tabErr.message}), falling back to sheet default A:T range`);
      await sheets.spreadsheets.values.append({
        spreadsheetId: targetConfig.id,
        range: 'A:T',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [newRow]
        }
      });
      usedTab = 'Default Sheet (A:T)';
    }

    console.log(`[Apply API] Recorded submission for ${name} (${applicationType}) to Sheet: ${targetConfig.id} [${usedTab}]`);

    return res.json({
      success: true,
      message: `Application recorded into ${usedTab} successfully`,
      targetSheet: targetConfig.id,
      targetLink: targetConfig.rawLink
    });
  } catch (error) {
    console.error('Error saving application to Google Sheet:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record application to Google Sheet',
      error: error.message
    });
  }
});

export default router;
