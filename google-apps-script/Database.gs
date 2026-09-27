/**
 * ==========================================================
 * INFOGENX STUDENT ONBOARDING SYSTEM
 * DATABASE.GS - RESILIENT MULTI-DATABASE DATA ENGINE
 * ==========================================================
 */

// Primary Permanent Student Database ID (https://docs.google.com/spreadsheets/d/1gMo3xbxpmqQQ9SJ1OjISQ1ktoaylNhsDiOrVmH6_31M/edit?usp=sharing)
const PRIMARY_DATABASE_ID = "1gMo3xbxpmqQQ9SJ1OjISQ1ktoaylNhsDiOrVmH6_31M";
const BACKUP_DATABASE_ID = "1cHbOnKddysB-8PVvtDRT2vg2R2Mrf-tDirL7DF0n2Sg";

/**
 * Get Database Spreadsheet ID
 */
function getDatabaseId() {
  const id = PropertiesService.getScriptProperties().getProperty("DATABASE_ID");
  return id || PRIMARY_DATABASE_ID;
}

function getMaxRowsPerTab() {
  try {
    const ss = SpreadsheetApp.openById(PRIMARY_DATABASE_ID);
    const configSheet = ss.getSheetByName("Config");
    if (configSheet) {
      const data = configSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toUpperCase() === "MAX_ROWS_PER_TAB") {
          const val = parseInt(data[i][1], 10);
          if (!isNaN(val) && val > 0) return val;
        }
      }
    }
  } catch(e) {}
  return 1000;
}

/**
 * Get Specific Students Sheet by ID (With Automatic Multi-Tab Splitting on Row Limit)
 */
function getStudentsSheetForDb(databaseId) {
  if (!databaseId) return null;
  try {
    const spreadsheet = SpreadsheetApp.openById(databaseId);
    const maxRows = getMaxRowsPerTab();
    
    // Find active Students tab that has space under maxRows
    let index = 1;
    let targetSheet = spreadsheet.getSheetByName("Students");
    if (!targetSheet) {
      targetSheet = spreadsheet.insertSheet("Students", 0);
      initializeStudentsHeaders(targetSheet);
      return targetSheet;
    } else if (targetSheet.getLastRow() === 0) {
      initializeStudentsHeaders(targetSheet);
      return targetSheet;
    }
    
    // Auto-create next tab if row limit is reached
    while (targetSheet.getLastRow() >= maxRows) {
      index++;
      const nextTabName = "Students Part " + index;
      let nextSheet = spreadsheet.getSheetByName(nextTabName);
      if (!nextSheet) {
        nextSheet = spreadsheet.insertSheet(nextTabName, index - 1);
        initializeStudentsHeaders(nextSheet);
        Logger.log("🎉 Row limit (" + maxRows + ") reached. Automatically created: " + nextTabName);
        return nextSheet;
      }
      targetSheet = nextSheet;
    }
    return targetSheet;
  } catch (err) {
    Logger.log("Notice opening database " + databaseId + ": " + err.message);
    return null;
  }
}

/**
 * Find student row and sheet across all Students tabs (Students, Students Part 2, etc.)
 */
function findStudentLocationAcrossTabs(spreadsheet, email) {
  if (!spreadsheet || !email) return null;
  const cleanE = cleanText(email).toLowerCase();
  const sheets = spreadsheet.getSheets();

  for (let s = 0; s < sheets.length; s++) {
    const sh = sheets[s];
    if (sh.getName().startsWith("Students")) {
      const data = sh.getDataRange().getValues();
      for (let r = 1; r < data.length; r++) {
        const cellEmail = cleanText(data[r][3]).toLowerCase();
        if (cellEmail === cleanE) {
          return { sheet: sh, row: r + 1 };
        }
      }
    }
  }
  return null;
}

/**
 * Get Default Students Sheet
 */
function getStudentsSheet() {
  const databaseId = getDatabaseId();
  let sheet = getStudentsSheetForDb(databaseId);
  if (!sheet) {
    sheet = getStudentsSheetForDb(PRIMARY_DATABASE_ID) || getStudentsSheetForDb(BACKUP_DATABASE_ID);
  }
  if (!sheet) {
    throw new Error("Unable to open Students sheet in any configured database.");
  }
  return sheet;
}

function initializeStudentsHeaders(sheet) {
  const headers = [[
    "Registration Date", "Full Name", "Date of Birth", "Email", "Generated Password",
    "Password Hash", "Mobile Number", "City", "Highest Qualification", "College Name",
    "Department", "Year of Passing", "Skill Category", "Skills", "Experience Type",
    "Company Name", "Experience (Years)", "Current Salary", "Expected Salary",
    "Resume Link", "Preferred Time", "Status", "Created At", "Last Login",
    "Certification", "LinkedIn Profile URL", "Work Duration & Timings", "Start Date",
    "Current Monthly Take Home Salary / Hourly Rate", "Your Current Work Status",
    "If Working then", "Preferred Availability",
    "Assessment Score", "Assessment Status", "Assessment Date", "Candidate Role", "Task Status",
    "Source Form / Campaign"
  ]];

  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.getRange(1, 1, 1, headers[0].length)
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#00123C")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return value.toString().trim();
}

function toUpper(value) {
  return cleanText(value).toUpperCase();
}

/**
 * Robust Password Generator (Example: Priyadharshini 2002 -> PRIY2002)
 */
function generatePassword(name, dob) {
  let cleanName = toUpper(name).replace(/[^A-Z]/g, "");
  if (cleanName.length < 4) {
    cleanName = (cleanName + "INFO").substring(0, 4);
  } else {
    cleanName = cleanName.substring(0, 4);
  }

  let year = "2026";
  if (dob) {
    try {
      const parsedDate = new Date(dob);
      if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1950 && parsedDate.getFullYear() < 2030) {
        year = String(parsedDate.getFullYear());
      } else {
        const matches = String(dob).match(/\b(19\d{2}|20\d{2})\b/);
        if (matches) year = matches[0];
      }
    } catch (e) {
      year = "2026";
    }
  }

  return cleanName + year;
}

/**
 * SHA-256 Hash
 */
function generatePasswordHash(password) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return bytes.map(function(b) {
    const val = (b + 256) % 256;
    return ("0" + val.toString(16)).slice(-2);
  }).join("");
}

/**
 * Check if Email Exists and return row index
 */
function findStudentRowByEmailInSheet(sheet, email) {
  if (!sheet) return -1;
  email = cleanText(email).toLowerCase();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const savedEmail = cleanText(data[i][3]).toLowerCase();
    if (savedEmail === email) {
      return i + 1; // 1-indexed row
    }
  }
  return -1;
}

function findStudentRowByEmail(email) {
  const sheet = getStudentsSheet();
  return findStudentRowByEmailInSheet(sheet, email);
}

/**
 * Get Student Profile by Email
 */
function getStudentByEmail(email) {
  if (!email) return null;
  email = cleanText(email).toLowerCase();
  
  const dbs = [PRIMARY_DATABASE_ID, BACKUP_DATABASE_ID];
  for (let d = 0; d < dbs.length; d++) {
    try {
      const sheet = getStudentsSheetForDb(dbs[d]);
      if (!sheet) continue;
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) continue;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowEmail = cleanText(row[3]).toLowerCase(); // Column D is Email
        if (rowEmail === email) {
          return {
            row: i + 1,
            registrationDate: row[0],
            fullName: cleanText(row[1]),
            dob: row[2],
            email: cleanText(row[3]),
            password: cleanText(row[4]),
            passwordHash: cleanText(row[5]),
            mobile: cleanText(row[6]),
            city: cleanText(row[7]),
            qualification: cleanText(row[8]),
            college: cleanText(row[9]),
            department: cleanText(row[10]),
            yearOfPassing: cleanText(row[11]),
            skillCategory: cleanText(row[12]),
            skills: cleanText(row[13]),
            status: cleanText(row[21]) || "Active"
          };
        }
      }
    } catch (err) {
      Logger.log("getStudentByEmail error on db " + dbs[d] + ": " + err.message);
    }
  }
  return null;
}

/**
 * Update Last Login timestamp across databases
 */
function updateLastLogin(rowNumber) {
  const dbs = [PRIMARY_DATABASE_ID, BACKUP_DATABASE_ID];
  dbs.forEach(function(dbId) {
    try {
      const sheet = getStudentsSheetForDb(dbId);
      if (sheet && rowNumber > 1) {
        sheet.getRange(rowNumber, 24).setValue(new Date());
      }
    } catch (e) {}
  });
}

/**
 * Save / Upsert Student across all connected databases
 */
function saveStudent(student) {
  student.fullName = cleanText(student.fullName);
  student.email = cleanText(student.email).toLowerCase();
  student.mobile = cleanText(student.mobile);
  student.dob = cleanText(student.dob);

  if (!student.fullName) throw new Error("Full Name is required.");
  if (!student.email || !student.email.includes("@")) throw new Error("Valid Email is required.");

  const password = generatePassword(student.fullName, student.dob);
  const passwordHash = generatePasswordHash(password);

  const rowValues = [
    new Date(),
    student.fullName,
    student.dob,
    student.email,
    password,
    passwordHash,
    student.mobile,
    student.city,
    student.qualification,
    student.college,
    student.department,
    student.yearOfPassing,
    student.skillCategory,
    student.skills,
    student.experienceType,
    student.companyName,
    student.experienceYears,
    student.currentSalary,
    student.expectedSalary,
    student.resumeLink,
    student.preferredTime,
    "Active",
    new Date(),
    "",
    student.certification,
    student.linkedinUrl,
    student.workDurationTimings,
    student.startDate,
    student.currentTakeHomeSalaryHourlyRate,
    student.currentWorkStatus,
    student.workingType,
    student.preferredAvailability,
    "", "", "", "", "Not Started",
    student.sourceForm || "Infogenx Application Form"
  ];

  const targetDbs = [PRIMARY_DATABASE_ID, BACKUP_DATABASE_ID];
  let savedCount = 0;

  targetDbs.forEach(function(dbId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(dbId);
      const existingLocation = findStudentLocationAcrossTabs(spreadsheet, student.email);

      if (existingLocation && existingLocation.sheet && existingLocation.row > 1) {
        Logger.log("Updating existing student profile in " + dbId + " [" + existingLocation.sheet.getName() + "] at row: " + existingLocation.row);
        existingLocation.sheet.getRange(existingLocation.row, 1, 1, rowValues.length).setValues([rowValues]);
        savedCount++;
      } else {
        const activeSheet = getStudentsSheetForDb(dbId);
        if (activeSheet) {
          activeSheet.appendRow(rowValues);
          Logger.log("Appended new student profile to " + dbId + " [" + activeSheet.getName() + "]");
          savedCount++;
        }
      }
    } catch (saveErr) {
      Logger.log("Notice saving to DB " + dbId + ": " + saveErr.message);
    }
  });

  if (savedCount === 0) {
    throw new Error("Failed to record student profile in any connected spreadsheet.");
  }

  return {
    success: true,
    password: password,
    message: "Student profile saved successfully across " + savedCount + " spreadsheets."
  };
}

/**
 * ==========================================================
 * MASTER MIGRATION ENGINE: CONSOLIDATE ALL CANDIDATE DATA
 * INTO THE PERMANENT GOOGLE SHEET (SINGLE TAB: 'Students')
 * ==========================================================
 */
function executeMigrationToPermanentSheet() {
  const targetId = "1gMo3xbxpmqQQ9SJ1OjISQ1ktoaylNhsDiOrVmH6_31M";
  Logger.log("Starting migration to permanent spreadsheet: " + targetId);
  const ss = SpreadsheetApp.openById(targetId);
  try {
    ss.rename("Infogenx Candidates & Students Master Database");
  } catch(e) {}

  // 1. Setup or Get Students tab
  let studentsSheet = ss.getSheetByName("Students");
  if (!studentsSheet) {
    const existingSheets = ss.getSheets();
    if (existingSheets.length === 1 && existingSheets[0].getName() === "Sheet1") {
      studentsSheet = existingSheets[0];
      studentsSheet.setName("Students");
    } else {
      studentsSheet = ss.insertSheet("Students", 0);
    }
  }
  initializeStudentsHeaders(studentsSheet);

  // 2. Setup Config tab
  let configSheet = ss.getSheetByName("Config");
  if (!configSheet) {
    configSheet = ss.insertSheet("Config");
    const configHeaders = [["KEY", "VALUE", "DESCRIPTION", "LAST_UPDATED"]];
    configSheet.getRange(1, 1, 1, 4).setValues(configHeaders)
      .setFontWeight("bold")
      .setBackground("#E65525")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("center");
    configSheet.setFrozenRows(1);
  }

  // Populate default Config values if empty
  if (configSheet.getLastRow() <= 1) {
    const defaultConfigs = [
      ["ACTIVE_FORM_URL", "https://docs.google.com/forms/d/e/1FAIpQLSeIUXwZhN5mw5TZwRZ5gHFMAa8FdvnaAI87kEB4mplbjaHFlQ/viewform?usp=sharing&ouid=101109227624004877778", "Paste any new Google Form link here. Website button updates automatically.", new Date().toISOString()],
      ["PRIMARY_SHEET_ID", targetId, "Permanent Infogenx Candidates Database", new Date().toISOString()],
      ["PORTAL_URL", "https://candidates.infogenx.com", "Live Candidate Exam Portal", new Date().toISOString()],
      ["ADMIN_EMAIL", "admin@infogenx.in", "Notification & Alert Recipient", new Date().toISOString()]
    ];
    configSheet.getRange(2, 1, defaultConfigs.length, 4).setValues(defaultConfigs);
    configSheet.autoResizeColumns(1, 4);
  }

  // 3. Collect candidates from all existing sources
  const sourceSheetIds = [
    { id: "1cHbOnKddysB-8PVvtDRT2vg2R2Mrf-tDirL7DF0n2Sg", name: "Official Master Sheet" },
    { id: "116q9erfGJz4vXgX_uUxJu2W8mVTrry_g3Rp8FrpC74w", name: "HR Intern Sneka Sheet" },
    { id: "1E9Op-03u7cn3sQiz7M2sGB0XNAuFGcpvpn0ypbcnMMQ", name: "Internship Candidates Lists" },
    { id: "1Y8Xdj3jNvh34zTK0OPfhH-7SzxE2frWQ0KJfnErrqXE", name: "Master Database 2" },
    { id: "1meidzpD13bG0uyAP-PTlsjWdf5j__YOI6gcCm-v63LM", name: "Student DB Fallback" }
  ];

  const candidateMap = new Map();
  const stats = { totalScanned: 0, uniqueCandidates: 0, sourcesSummary: {} };

  sourceSheetIds.forEach(function(src) {
    try {
      const sourceSs = SpreadsheetApp.openById(src.id);
      const sheets = sourceSs.getSheets();
      let sourceCount = 0;

      sheets.forEach(function(sh) {
        const shName = sh.getName();
        if (shName.toLowerCase().includes("config")) return;
        
        const data = sh.getDataRange().getValues();
        if (data.length < 2) return;

        const headers = data[0].map(function(h) { return String(h || "").trim(); });

        for (let r = 1; r < data.length; r++) {
          const row = data[r];
          if (!row || row.every(function(cell) { return String(cell || "").trim() === ""; })) continue;

          stats.totalScanned++;
          const student = {
            fullName: "",
            dob: "",
            email: "",
            password: "",
            mobile: "",
            city: "",
            qualification: "",
            college: "",
            department: "",
            yearOfPassing: "",
            skillCategory: "",
            skills: "",
            experienceType: "",
            companyName: "",
            experienceYears: "",
            currentSalary: "",
            expectedSalary: "",
            resumeLink: "",
            preferredTime: "",
            status: "Active",
            createdAt: "",
            lastLogin: "",
            certification: "",
            linkedinUrl: "",
            workDurationTimings: "",
            startDate: "",
            currentTakeHomeSalaryHourlyRate: "",
            currentWorkStatus: "",
            workingType: "",
            preferredAvailability: "",
            assessmentScore: "",
            assessmentStatus: "",
            assessmentDate: "",
            role: "candidate",
            taskStatus: "Not Started"
          };

          for (let c = 0; c < headers.length; c++) {
            const h = headers[c];
            const val = row[c];
            if (val === null || val === undefined || String(val).trim() === "") continue;

            const valStr = String(val).trim();
            mapFieldToStudent(student, h, valStr);

            const hLower = h.toLowerCase();
            if (hLower.includes("password") && !hLower.includes("hash")) {
              student.password = valStr;
            }
            if (hLower.includes("score")) student.assessmentScore = valStr;
            if (hLower.includes("assessment status")) student.assessmentStatus = valStr;
            if (hLower.includes("task status")) student.taskStatus = valStr;
            if (hLower.includes("created") || hLower.includes("timestamp") || hLower.includes("registration date")) {
              if (!student.createdAt) student.createdAt = valStr;
            }
          }

          student.sourceForm = src.name + " (" + shName + ")";

          let cleanEmail = (student.email || "").trim().toLowerCase();
          if (!cleanEmail || !cleanEmail.includes("@")) {
            for (let c = 0; c < row.length; c++) {
              const cellVal = String(row[c] || "").trim();
              if (cellVal.includes("@") && cellVal.includes(".") && !cellVal.includes(" ")) {
                cleanEmail = cellVal.toLowerCase();
                student.email = cleanEmail;
                break;
              }
            }
          }

          if (cleanEmail && cleanEmail.includes("@")) {
            if (!student.fullName) student.fullName = cleanEmail.split("@")[0];
            if (!student.password) student.password = generatePassword(student.fullName, student.dob);
            if (!student.createdAt) student.createdAt = new Date();

            if (candidateMap.has(cleanEmail)) {
              const existing = candidateMap.get(cleanEmail);
              for (const key in student) {
                if (!existing[key] && student[key]) {
                  existing[key] = student[key];
                }
              }
            } else {
              candidateMap.set(cleanEmail, student);
              sourceCount++;
            }
          }
        }
      });
      stats.sourcesSummary[src.name] = sourceCount;
    } catch(err) {
      stats.sourcesSummary[src.name] = "Notice: " + err.message;
    }
  });

  stats.uniqueCandidates = candidateMap.size;

  // 4. Clear old data rows in Students tab and write all candidates
  const lastRow = studentsSheet.getLastRow();
  if (lastRow > 1) {
    studentsSheet.getRange(2, 1, lastRow - 1, studentsSheet.getLastColumn()).clearContent();
  }

  const rowsToWrite = [];
  candidateMap.forEach(function(student) {
    const passwordHash = Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, student.password || "INFO2026")
    );

    const row = [
      student.createdAt || new Date(),
      student.fullName,
      student.dob,
      student.email,
      student.password,
      passwordHash,
      student.mobile,
      student.city,
      student.qualification,
      student.college,
      student.department,
      student.yearOfPassing,
      student.skillCategory,
      student.skills,
      student.experienceType,
      student.companyName,
      student.experienceYears,
      student.currentSalary,
      student.expectedSalary,
      student.resumeLink,
      student.preferredTime,
      student.status || "Active",
      student.createdAt || new Date(),
      student.lastLogin || "",
      student.certification || "",
      student.linkedinUrl || "",
      student.workDurationTimings || "",
      student.startDate || "",
      student.currentTakeHomeSalaryHourlyRate || "",
      student.currentWorkStatus || "",
      student.workingType || "",
      student.preferredAvailability || "",
      student.assessmentScore || "",
      student.assessmentStatus || "Pending",
      student.assessmentDate || "",
      student.role || "candidate",
      student.taskStatus || "Not Started",
      student.sourceForm || "Infogenx Application Form"
    ];
    rowsToWrite.push(row);
  });

  if (rowsToWrite.length > 0) {
    studentsSheet.getRange(2, 1, rowsToWrite.length, rowsToWrite[0].length).setValues(rowsToWrite);
    studentsSheet.autoResizeColumns(1, 10);
  }

  // 5. Update Database Properties
  PropertiesService.getScriptProperties().setProperty("DATABASE_ID", targetId);

  // 6. Connect Universal Trigger on this permanent spreadsheet
  createAllTriggers();

  return {
    success: true,
    message: "Migration to permanent spreadsheet complete! All candidate data consolidated into single 'Students' tab.",
    permanentSpreadsheetId: targetId,
    permanentSpreadsheetUrl: "https://docs.google.com/spreadsheets/d/" + targetId + "/edit",
    stats: stats
  };
}