/**
 * ==========================================================
 * INFOGENX STUDENT ONBOARDING SYSTEM
 * DATABASE.GS - RESILIENT MULTI-DATABASE DATA ENGINE
 * ==========================================================
 */

// Primary Student Database ID (https://docs.google.com/spreadsheets/d/1tEjn1hJ0rd2pNV3kaLyv4SitFyoRLwCKb5loAdEvjoM/edit?gid=1154490641#gid=1154490641)
const PRIMARY_DATABASE_ID = "1tEjn1hJ0rd2pNV3kaLyv4SitFyoRLwCKb5loAdEvjoM";
const BACKUP_DATABASE_ID = "1tEjn1hJ0rd2pNV3kaLyv4SitFyoRLwCKb5loAdEvjoM";

/**
 * Get Database Spreadsheet ID
 */
function getDatabaseId() {
  const id = PropertiesService.getScriptProperties().getProperty("DATABASE_ID");
  return id || PRIMARY_DATABASE_ID;
}

/**
 * Get Specific Students Sheet by ID (Auto-creates and sets headers if missing)
 */
function getStudentsSheetForDb(databaseId) {
  if (!databaseId) return null;
  try {
    const spreadsheet = SpreadsheetApp.openById(databaseId);
    let sheet = spreadsheet.getSheetByName("Students");

    if (!sheet) {
      sheet = spreadsheet.insertSheet("Students");
      initializeStudentsHeaders(sheet);
    } else if (sheet.getLastRow() === 0) {
      initializeStudentsHeaders(sheet);
    }
    return sheet;
  } catch (err) {
    Logger.log("Notice opening database " + databaseId + ": " + err.message);
    return null;
  }
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
    "Assessment Score", "Assessment Status", "Assessment Date", "Candidate Role", "Task Status"
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
    "", "", "", "", "Not Started"
  ];

  const targetDbs = [PRIMARY_DATABASE_ID, BACKUP_DATABASE_ID];
  let savedCount = 0;

  targetDbs.forEach(function(dbId) {
    try {
      const sheet = getStudentsSheetForDb(dbId);
      if (sheet) {
        const existingRow = findStudentRowByEmailInSheet(sheet, student.email);
        if (existingRow > 0) {
          Logger.log("Updating existing student profile in " + dbId + " at row: " + existingRow);
          sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
        } else {
          sheet.appendRow(rowValues);
          Logger.log("Appended new student profile to " + dbId);
        }
        savedCount++;
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