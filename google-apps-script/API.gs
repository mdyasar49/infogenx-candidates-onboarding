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

    if (action === "sync" || action === "syncSheet") {
      return jsonResponse({
        success: true,
        result: syncSheetResponses(),
        formSync: syncFormResponsesDirect()
      });
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