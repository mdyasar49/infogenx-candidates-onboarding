/**
 * ==========================================================
 * INFOGENX STUDENT ONBOARDING SYSTEM
 * API.GS - WEBHOOK & HTTP HANDLER
 * ==========================================================
 */

function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "health";

    if (action === "getStudent" || action === "getUser") {
      return jsonResponse({
        success: true,
        student: getStudentByEmail(params.email)
      });
    }

    if (action === "getActiveForm" || action === "getFormUrl") {
      try {
        const ss = SpreadsheetApp.openById(PRIMARY_DATABASE_ID);
        const configSheet = ss.getSheetByName("Config");
        let formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeIUXwZhN5mw5TZwRZ5gHFMAa8FdvnaAI87kEB4mplbjaHFlQ/viewform?usp=sharing&ouid=101109227624004877778";
        if (configSheet) {
          const data = configSheet.getDataRange().getValues();
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]).trim().toUpperCase() === "ACTIVE_FORM_URL") {
              formUrl = String(data[i][1]).trim() || formUrl;
              break;
            }
          }
        }
        return jsonResponse({ success: true, formUrl: formUrl });
      } catch (err) {
        return jsonResponse({
          success: true,
          formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeIUXwZhN5mw5TZwRZ5gHFMAa8FdvnaAI87kEB4mplbjaHFlQ/viewform?usp=sharing&ouid=101109227624004877778"
        });
      }
    }

    if (action === "updateConfirmation" || action === "setConfirmation") {
      const formId = "1ugPH89EBC1RSVJrrHKs3qnYnyR3y5rXAVwK43wamthE";
      const form = FormApp.openById(formId);
      form.setConfirmationMessage(
        "✅ Your Infogenx Application has been recorded!\n\n" +
        "⚠️ FINAL MANDATORY STEP:\n" +
        "Please click the link below to send your application details directly to our Hiring Manager (Anand Sir) on WhatsApp to confirm your interview slot:\n\n" +
        "👉 WhatsApp Link: https://wa.me/919787806366?text=Hi%20Anand%20Sir%2C%20I%20have%20submitted%20the%20Infogenx%20Application%20Form.%20Please%20find%20my%20details%20and%20resume.\n\n" +
        "Direct Contact: +91 9787806366"
      );
      return jsonResponse({
        success: true,
        message: "Google Form confirmation message updated successfully with Anand Sir WhatsApp link!"
      });
    }

    if (action === "sync" || action === "syncSheet") {
      return jsonResponse({
        success: true,
        result: syncSheetResponses(),
        formSync: syncFormResponsesDirect()
      });
    }

    if (action === "inspectData") {
      const candidatesSheetIds = [
        "1cHbOnKddysB-8PVvtDRT2vg2R2Mrf-tDirL7DF0n2Sg",
        "1Y8Xdj3jNvh34zTK0OPfhH-7SzxE2frWQ0KJfnErrqXE",
        "116q9erfGJz4vXgX_uUxJu2W8mVTrry_g3Rp8FrpC74w",
        "1E9Op-03u7cn3sQiz7M2sGB0XNAuFGcpvpn0ypbcnMMQ",
        "1meidzpD13bG0uyAP-PTlsjWdf5j__YOI6gcCm-v63LM",
        "1tEjn1hJ0rd2pNV3kaLyv4SitFyoRLwCKb5loAdEvjoM"
      ];
      const results = {};
      candidatesSheetIds.forEach(id => {
        try {
          const ss = SpreadsheetApp.openById(id);
          const sheets = ss.getSheets().map(s => {
            return {
              name: s.getName(),
              rows: s.getLastRow(),
              cols: s.getLastColumn()
            };
          });
          results[id] = { title: ss.getName(), sheets: sheets };
        } catch (e) {
          results[id] = { error: e.message };
        }
      });
      return jsonResponse({ success: true, results: results });
    }

    if (action === "migrateToPermanentSheet") {
      return jsonResponse(executeMigrationToPermanentSheet());
    }

    if (action === "setupTriggers" || action === "createTriggers") {
      return jsonResponse({
        success: true,
        triggers: createAllTriggers(),
        formSync: syncFormResponsesDirect()
      });
    }

    if (action === "syncForm" || action === "syncFormDirect") {
      return jsonResponse({
        success: true,
        formSync: syncFormResponsesDirect()
      });
    }

    return jsonResponse({
      success: true,
      service: "Infogenx Candidate Onboarding Automation Engine",
      status: "ONLINE",
      account: "infogenx.jobs@gmail.com",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: err.message
    });
  }
}

function doPost(e) {
  try {
    let request = {};

    if (e && e.postData && e.postData.contents) {
      try {
        request = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        request = {};
      }
    }
    if (e && e.parameter) {
      request = Object.assign({}, e.parameter, request);
    }

    const action = (request.action || "register").toLowerCase();

    if (action === "register" || action === "onboard") {
      return jsonResponse(onStudentRegistration({ student: request }));
    } else if (action === "getstudent" || action === "getuser") {
      return jsonResponse({
        success: true,
        student: getStudentByEmail(request.email)
      });
    } else if (action === "sync" || action === "syncsheet" || action === "syncform") {
      return jsonResponse({
        success: true,
        result: syncSheetResponses(),
        formSync: syncFormResponsesDirect()
      });
    } else if (action === "setuptriggers" || action === "creatriggers") {
      return jsonResponse({
        success: true,
        triggers: createAllTriggers(),
        formSync: syncFormResponsesDirect()
      });
    } else if (action === "login" || action === "auth") {
      return jsonResponse(authenticateStudent(request.email, request.password));
    } else if (action === "health" || action === "ping") {
      return jsonResponse({ success: true, status: "READY" });
    } else {
      return jsonResponse({
        success: false,
        message: "Unknown action: " + action
      });
    }
  } catch (err) {
    return jsonResponse({
      success: false,
      message: err.message
    });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}