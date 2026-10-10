import express from 'express';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const SHEET_ID = '13mW68lcoaZ9dtc_h--TLYki4dR-8xwZEh1ndGxVkorY';
const TAB_NAME = 'Direct Candidate Applications';

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
      appliedRole,
      experience,
      qualification,
      techSkills,
      certification,
      resumeUrl,
      linkedinUrl,
      purpose,
      unpaidTerms,
      startDate,
      currentSalary,
      freelance,
      workMode,
      durationTimings,
      availabilitySlots
    } = req.body;

    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const newRow = [
      timestamp,
      name || '',
      mobile || '',
      location || '',
      appliedRole || '',
      experience || '',
      qualification || '',
      techSkills || '',
      certification || '',
      resumeUrl || '',
      linkedinUrl || '',
      purpose || '',
      unpaidTerms || '',
      startDate || '',
      currentSalary || '',
      freelance || '',
      workMode || '',
      durationTimings || '',
      availabilitySlots || '',
      'Pending Review'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `'${TAB_NAME}'!A:T`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [newRow]
      }
    });

    return res.json({
      success: true,
      message: 'Application recorded into Google Sheet successfully'
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
