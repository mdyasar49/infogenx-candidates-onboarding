import express from 'express';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 3 Dedicated Google Spreadsheets partitioned by Application Type
const SPREADSHEETS_BY_TYPE = {
  'Internship': {
    id: '1LAsfnvSNBpr2WzRPyqbBSaNMsLbNU-rl1QxGPXiTpsA',
    tab: 'Internship Applications'
  },
  'Job / Trainee': {
    id: '14Ccmt5lN_JnKGHmW1fgFiRefZoECqrPWHe4VWZXk_MA',
    tab: 'Job Applications'
  },
  'Freelance': {
    id: '1TgvY9gWS5VpUM8AMbHuH4VydwkxwOFPjo784iJBtfEY',
    tab: 'Freelance Applications'
  }
};

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

    // Determine target spreadsheet strictly based on applicationType
    let targetConfig = SPREADSHEETS_BY_TYPE['Job / Trainee'];
    const appTypeNorm = (applicationType || '').toLowerCase();

    if (appTypeNorm.includes('intern')) {
      targetConfig = SPREADSHEETS_BY_TYPE['Internship'];
    } else if (appTypeNorm.includes('free')) {
      targetConfig = SPREADSHEETS_BY_TYPE['Freelance'];
    }

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

    await sheets.spreadsheets.values.append({
      spreadsheetId: targetConfig.id,
      range: `'${targetConfig.tab}'!A:T`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [newRow]
      }
    });

    console.log(`[Apply API] Recorded submission for ${name} (${applicationType}) to Sheet: ${targetConfig.id} [${targetConfig.tab}]`);

    return res.json({
      success: true,
      message: `Application recorded into ${targetConfig.tab} successfully`,
      targetSheet: targetConfig.id
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
