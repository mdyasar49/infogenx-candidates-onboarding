import express from "express";
import { questionBank } from "../services/questions.js";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { generateHrAdminNotificationEmailHtml } from "../services/emailTemplates.js";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAssessmentTransporter() {
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

// In-memory store for attempts and student status (serves as immediate fallback/cache)
const studentAttempts = {};
const studentStatuses = {};

// Helper: Get Sheets API auth if credentials file exists
function getSheetsAuth() {
  try {
    const credPath = path.join(__dirname, "../credentials/service-account.json");
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
  } catch (err) {
    console.warn("Sheets Auth warning:", err.message);
    return null;
  }
}

// 1. GET /api/assessment/questions (Safe list without answer key)
router.get("/questions", (req, res) => {
  const safeQuestions = questionBank.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));

  return res.json({
    success: true,
    total: safeQuestions.length,
    questions: safeQuestions,
  });
});

// 2. GET /api/assessment/status?email=...
router.get("/status", (req, res) => {
  const email = (req.query.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ success: false, message: "Email parameter required" });
  }

  const attempts = studentAttempts[email] || [];
  const status = studentStatuses[email] || {
    assessmentStatus: attempts.some(a => a.result === "PASS") ? "PASS" : "PENDING",
    taskAccess: attempts.some(a => a.result === "PASS") ? "ENABLED" : "DISABLED",
    latestAttempt: attempts.length > 0 ? attempts[attempts.length - 1] : null,
    totalAttempts: attempts.length,
  };

  return res.json({
    success: true,
    email,
    attemptsCount: attempts.length,
    attempts,
    ...status,
  });
});

// 3. POST /api/assessment/submit (Backend calculation, grading, email trigger & Sheets logging)
router.post("/submit", async (req, res) => {
  try {
    const { email, candidateDetails, answers } = req.body;

    if (!email || !answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Email and answers object are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Calculate score on backend
    let score = 0;
    const totalQuestions = questionBank.length;

    questionBank.forEach((q) => {
      const studentAnswer = answers[q.id];
      if (typeof studentAnswer === "number" && studentAnswer === q.answer) {
        score += 1;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = score >= 40; // 40/50 = 80% passing threshold
    const resultStatus = passed ? "PASS" : "FAIL";

    // Track attempt count
    if (!studentAttempts[cleanEmail]) {
      studentAttempts[cleanEmail] = [];
    }
    const attemptNumber = studentAttempts[cleanEmail].length + 1;
    const timestamp = new Date().toISOString();

    const attemptRecord = {
      attemptNumber,
      score,
      totalQuestions,
      percentage,
      result: resultStatus,
      timestamp,
      date: new Date().toLocaleDateString(),
    };

    studentAttempts[cleanEmail].push(attemptRecord);

    if (passed) {
      studentStatuses[cleanEmail] = {
        assessmentStatus: "PASS",
        taskAccess: "ENABLED",
        passingScore: score,
        passingPercentage: percentage,
        passedDate: timestamp,
        latestAttempt: attemptRecord,
        totalAttempts: attemptNumber,
      };
    } else {
      studentStatuses[cleanEmail] = {
        assessmentStatus: "FAIL",
        taskAccess: "DISABLED",
        latestAttempt: attemptRecord,
        totalAttempts: attemptNumber,
      };
    }

    // Try logging to Google Sheets if configured
    try {
      const sheets = getSheetsAuth();
      if (sheets && process.env.SPREADSHEET_ID) {
        // Append to Assessment Results sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: "Assessment Results!A:K",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[
              timestamp,
              candidateDetails?.name || "Student",
              cleanEmail,
              candidateDetails?.mobile || "N/A",
              attemptNumber,
              score,
              totalQuestions,
              `${percentage}%`,
              resultStatus,
              resultStatus,
              new Date().toLocaleDateString(),
            ]],
          },
        });
      }
    } catch (err) {
      console.warn("Google Sheets logging notice:", err.message);
    }

    // Send assessment completion email notification to nithyanand.a@infogenx.com.au
    let emailSent = false;
    try {
      const transporter = getAssessmentTransporter();
      const adminEmail = process.env.DIRECTOR_EMAIL || "nithyanand.a@infogenx.com.au";
      const candidateInfo = {
        name: candidateDetails?.name || candidateDetails?.fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: candidateDetails?.mobile || candidateDetails?.phone || "N/A",
        location: candidateDetails?.city || candidateDetails?.location || "Chennai, Tamil Nadu",
        qualification: candidateDetails?.qualification || "Graduate",
        score: score,
        percentage: percentage,
        status: resultStatus,
        attemptNumber: attemptNumber
      };

      const htmlBody = generateHrAdminNotificationEmailHtml(candidateInfo);

      await transporter.sendMail({
        from: '"Infogenx HR Operations" <infogenx.jobs@gmail.com>',
        to: [adminEmail, "admin@infogenx.com"],
        subject: `Candidate Assessment Completed: ${candidateInfo.name} (${resultStatus} - ${score}/50)`,
        html: htmlBody
      });
      emailSent = true;
      console.log(`[ASSESSMENT NOTIFICATION SENT] Notification dispatched to ${adminEmail} for candidate ${candidateInfo.name}`);
    } catch (mailErr) {
      console.warn("[ASSESSMENT NOTIFICATION ERROR]", mailErr.message);
    }

    return res.json({
      success: true,
      passed,
      score,
      totalQuestions,
      percentage,
      result: resultStatus,
      attemptNumber,
      taskAccess: passed ? "ENABLED" : "DISABLED",
      emailSent,
      message: passed
        ? "Congratulations! You passed the Infogenx Assessment."
        : `Assessment Not Passed. Your Score: ${score}/50 (${percentage}%). Passing score is 80%. Please reattempt.`,
    });
  } catch (err) {
    console.error("Assessment submit error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
