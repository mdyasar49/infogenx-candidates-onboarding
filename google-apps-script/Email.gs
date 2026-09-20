/**
 * ==========================================================
 * INFOGENX CANDIDATE ONBOARDING SYSTEM
 * EMAIL.GS - WELCOME EMAIL DISPATCH ENGINE
 * ==========================================================
 */

function generateWelcomeEmailHtml(password, portalUrl) {
  portalUrl = portalUrl || "https://candidates.infogenx.com/login";
  return '<!DOCTYPE html>' +
  '<html>' +
  '<head><meta charset="utf-8"></head>' +
  '<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: \'Segoe UI\', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">' +
  '  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 30px 10px;">' +
  '    <tr>' +
  '      <td align="center">' +
  '        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 18, 60, 0.08); border: 1px solid #E2E8F0;">' +
  '          <tr>' +
  '            <td align="center" style="background: linear-gradient(135deg, #02081f 0%, #06184a 45%, #b83814 85%, #d9480f 100%); padding: 36px 20px 30px 20px; color: #FFFFFF;">' +
  '              <a href="https://candidates.infogenx.com" target="_blank" style="text-decoration: none; display: inline-block;">' +
  '                <img src="https://candidates.infogenx.com/logo_white.png" alt="INFOGENX" width="160" style="width: 160px; max-width: 160px; height: auto; display: block; margin: 0 auto 10px auto; border: 0;" />' +
  '              </a>' +
  '              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #FFFFFF;">CANDIDATE ONBOARDING & ASSESSMENT PORTAL</p>' +
  '            </td>' +
  '          </tr>' +
  '          <tr>' +
  '            <td style="padding: 36px 32px; color: #334155;">' +
  '              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">Dear Candidate,</p>' +
  '              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">Thank you for completing the registration form.</p>' +
  '              <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 1.6; color: #334155;">To proceed with your onboarding, please click the button below to log in to the HR Training Application using your registered email address and the temporary password provided below:</p>' +
  '              ' +
  '              <!-- Training Application Link Button (Above Password) -->' +
  '              <div align="center" style="margin: 24px 0 18px 0;">' +
  '                <a href="' + portalUrl + '" target="_blank" style="background: linear-gradient(135deg, #05143d 0%, #a83210 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 38px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(5,20,61,0.2); text-align: center;">Training Application Link →</a>' +
  '              </div>' +
  '              ' +
  '              <!-- Password Badge (Below Button) -->' +
  '              <div align="center" style="margin: 18px 0 24px 0;">' +
  '                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #00123C; font-weight: 700;">Password: <span style="color: #D9480F; font-family: \'Consolas\', \'Courier New\', monospace; font-size: 18px; font-weight: 800; letter-spacing: 1.5px; background-color: #FFF5F2; padding: 6px 16px; border-radius: 6px; border: 1.5px dashed #F47C5D; display: inline-block; margin-left: 8px;">' + password + '</span></p>' +
  '              </div>' +
  '              ' +
  '              <p style="margin: 0 0 12px 0; font-size: 13.5px; line-height: 1.6; color: #64748B;">Please complete the training process at your earliest convenience. If you encounter any issues accessing the portal through the button above, copy and paste the following link directly into your browser:</p>' +
  '              <p style="margin: 0 0 28px 0; font-size: 14px; text-align: center;"><a href="' + portalUrl + '" target="_blank" style="color: #2563EB; font-weight: 600; text-decoration: underline;">' + portalUrl + '</a></p>' +
  '              <p style="margin: 0 0 4px 0; font-size: 14.5px; line-height: 1.6; color: #334155;">Best regards,</p>' +
  '              <p style="margin: 0; font-size: 15px; font-weight: 800; color: #00123C;">Infogenx Talent Acquisition & HR Operations</p>' +
  '            </td>' +
  '          </tr>' +
  '          <!-- Unified Footer -->' +
  '          <tr>' +
  '            <td align="center" style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 20px; color: #64748B; font-size: 12px; line-height: 1.6;">' +
  '              <p style="margin: 0 0 6px 0; font-weight: 800; color: #00123C; font-size: 13.5px;">Infogenx Talent Acquisition & HR Operations</p>' +
  '              <p style="margin: 0 0 6px 0;">This is an automated operational email from Infogenx Recruitment Management System.</p>' +
  '              <p style="margin: 0; color: #94A3B8;">&copy; 2026 Infogenx Pvt. Ltd. All Rights Reserved. • <a href="https://infogenx.com" target="_blank" style="color: #D9480F; text-decoration: none; font-weight: 600;">infogenx.com</a></p>' +
  '            </td>' +
  '          </tr>' +
  '        </table>' +
  '      </td>' +
  '    </tr>' +
  '  </table>' +
  '</body>' +
  '</html>';
}

function sendWelcomeEmail(email, fullName, password, mobile, skillCategory) {
  if (!email) {
    Logger.log("sendWelcomeEmail skipped: No email provided.");
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  // -------------------------------------------------------------------
  // 300-Second (5-Minute) Multi-Project Deduplication Lock
  // -------------------------------------------------------------------
  const cacheKey = "email_sent_lock_" + cleanEmail;
  const docCache = CacheService.getDocumentCache();
  const scriptCache = CacheService.getScriptCache();

  if ((docCache && docCache.get(cacheKey)) || (scriptCache && scriptCache.get(cacheKey))) {
    Logger.log("sendWelcomeEmail skipped: Deduplication lock active for " + cleanEmail);
    return;
  }

  if (docCache) docCache.put(cacheKey, "true", 300);
  if (scriptCache) scriptCache.put(cacheKey, "true", 300);

  // 1. Dispatch Welcome Email via Node Backend API (Guarantees 100% Latest Design & Single Delivery)
  let backendDispatched = false;
  try {
    const payload = JSON.stringify({
      fullName: fullName || "Candidate",
      email: cleanEmail,
      password: password || "INFO" + Math.floor(1000 + Math.random() * 9000),
      mobile: mobile || "",
      skillCategory: skillCategory || "General"
    });

    const options = {
      method: "post",
      contentType: "application/json",
      payload: payload,
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch("https://candidates.infogenx.com/api/candidate-auth/onboard-candidate", options);
    Logger.log("Candidate Auth Onboarding Server Response: " + response.getContentText());
    backendDispatched = true;
  } catch (apiErr) {
    Logger.log("Candidate Auth Server API warning: " + apiErr.message);
  }

  // 2. Direct GmailApp Fallback if Backend API unavailable
  if (!backendDispatched) {
    try {
      const htmlBody = generateWelcomeEmailHtml(password, "https://candidates.infogenx.com/login");
      GmailApp.sendEmail(cleanEmail, "Infogenx HR Training Credentials - INFOGENX Candidate Onboarding & Assessment Portal", "", {
        htmlBody: htmlBody,
        name: "Infogenx HR Operations"
      });
      Logger.log("✅ Welcome email sent directly via GmailApp to: " + cleanEmail);
    } catch (gmailErr) {
      Logger.log("GmailApp fallback warning: " + gmailErr.message);
    }
  }
}