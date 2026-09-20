/**
 * Centralized Email Templates for Infogenx Onboarding & Assessment Portal
 */

export const PORTAL_URL = 'https://candidates.infogenx.com/login';
export const MAIN_LOGO_URL = 'https://candidates.infogenx.com/logo_white.png';

/**
 * 1. Candidate Onboarding Welcome Email Template (Sent upon Google Form submission)
 * Exactly matches the approved template image
 */
export function generateCandidateWelcomeEmailHtml({ fullName = 'Candidate', email = '', password = '', portalUrl = PORTAL_URL }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 18, 60, 0.08); border: 1px solid #E2E8F0;">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #02081f 0%, #06184a 45%, #b83814 85%, #d9480f 100%); padding: 36px 20px 30px 20px; color: #FFFFFF;">
              <a href="https://candidates.infogenx.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${MAIN_LOGO_URL}" alt="INFOGENX" width="160" style="width: 160px; max-width: 160px; height: auto; display: block; margin: 0 auto 10px auto; border: 0;" />
              </a>
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #FFFFFF;">CANDIDATE ONBOARDING & ASSESSMENT PORTAL</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px; color: #334155;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">Dear Candidate,</p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">Thank you for completing the registration form.</p>
              <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 1.6; color: #334155;">To proceed with your onboarding, please click the button below to log in to the HR Training Application using your registered email address and the temporary password provided below:</p>
              
              <!-- Training Application Link Button (Above Password) -->
              <div align="center" style="margin: 24px 0 18px 0;">
                <a href="${portalUrl}" target="_blank" style="background: linear-gradient(135deg, #05143d 0%, #a83210 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 38px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(5,20,61,0.2); text-align: center;">Training Application Link →</a>
              </div>

              <!-- Password Badge (Below Button) -->
              <div align="center" style="margin: 18px 0 24px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #00123C; font-weight: 700;">Password: <span style="color: #D9480F; font-family: 'Consolas', 'Courier New', monospace; font-size: 18px; font-weight: 800; letter-spacing: 1.5px; background-color: #FFF5F2; padding: 6px 16px; border-radius: 6px; border: 1.5px dashed #F47C5D; display: inline-block; margin-left: 8px;">${password}</span></p>
              </div>

              <p style="margin: 0 0 12px 0; font-size: 13.5px; line-height: 1.6; color: #64748B;">Please complete the training process at your earliest convenience. If you encounter any issues accessing the portal through the button above, copy and paste the following link directly into your browser:</p>
              <p style="margin: 0 0 28px 0; font-size: 14px; text-align: center;"><a href="${portalUrl}" target="_blank" style="color: #2563EB; font-weight: 600; text-decoration: underline;">${portalUrl}</a></p>
              <p style="margin: 0 0 4px 0; font-size: 14.5px; line-height: 1.6; color: #334155;">Best regards,</p>
              <p style="margin: 0; font-size: 15px; font-weight: 800; color: #00123C;">Infogenx Talent Acquisition & HR Operations</p>
            </td>
          </tr>
          <!-- Unified Footer -->
          <tr>
            <td align="center" style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 20px; color: #64748B; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 800; color: #00123C; font-size: 13.5px;">Infogenx Talent Acquisition & HR Operations</p>
              <p style="margin: 0 0 6px 0;">This is an automated operational email from Infogenx Recruitment Management System.</p>
              <p style="margin: 0; color: #94A3B8;">&copy; 2026 Infogenx Pvt. Ltd. All Rights Reserved. • <a href="https://infogenx.com" target="_blank" style="color: #D9480F; text-decoration: none; font-weight: 600;">infogenx.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 2. HR Admin Review Notification Email Template (Sent to admin@infogenx.in when candidate completes assessment)
 */
export function generateHrAdminNotificationEmailHtml(candidate) {
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .email-container { max-width: 680px; background: #ffffff; margin: 0 auto; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,18,60,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #02081f 0%, #06184a 45%, #b83814 85%, #d9480f 100%); padding: 34px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; }
    .badge { display: inline-block; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-top: 6px; color: #ffffff; }
    .content { padding: 36px 32px; }
    .alert-banner { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-left: 5px solid #16a34a; padding: 14px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 14px; color: #166534; font-weight: 600; }
    .section-title { font-size: 15px; font-weight: 700; color: #00123C; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 16px 0; text-transform: uppercase; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; }
    .details-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .details-table td.label { font-weight: 600; color: #5c6a86; width: 38%; }
    .details-table td.value { font-weight: 600; color: #00123C; word-break: break-word; }
    .score-box { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-left: 5px solid #16a34a; border-radius: 12px; padding: 22px; text-align: center; margin: 22px 0; }
    .score-val { font-size: 28px; font-weight: 800; color: #15803D; margin: 6px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #05143d 0%, #a83210 100%); color: #ffffff !important; padding: 15px 36px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; text-align: center; box-shadow: 0 8px 22px rgba(0, 18, 60, 0.16); }
    .footer { background: #f8fafc; padding: 24px 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <a href="https://candidates.infogenx.com" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="${MAIN_LOGO_URL}" alt="INFOGENX" width="160" style="width: 160px; max-width: 160px; height: auto; display: block; margin: 0 auto 8px auto; border: 0;" />
      </a>
      <div class="badge">HR Training & Candidate Review</div>
    </div>
    <div class="content">
      <div class="alert-banner">
        ✓ Candidate has completed all HR Training stages, Assessment, and Practical Task.
      </div>

      <div class="score-box">
        <div style="font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase;">Assessment Score Result</div>
        <div class="score-val">${candidate.score || 50} / 50 (${candidate.percentage || 100}%)</div>
        <div style="font-size: 13px; font-weight: 700; color: #15803D;">STATUS: PASSED</div>
      </div>

      <div class="section-title">Candidate Personal & Contact Details</div>
      <table class="details-table">
        <tr><td class="label">Full Name:</td><td class="value">${candidate.name || 'N/A'}</td></tr>
        <tr><td class="label">Email Address:</td><td class="value">${candidate.email || 'N/A'}</td></tr>
        <tr><td class="label">Phone / WhatsApp:</td><td class="value">${candidate.phone || 'N/A'}</td></tr>
        <tr><td class="label">Location:</td><td class="value">${candidate.location || 'N/A'}</td></tr>
        <tr><td class="label">Qualification:</td><td class="value">${candidate.qualification || 'N/A'}</td></tr>
        <tr><td class="label">Completion Time:</td><td class="value">${dateStr} at ${timeStr}</td></tr>
      </table>

      <div style="text-align: center; margin-top: 28px;">
        <a href="https://candidates.infogenx.com/admin" target="_blank" class="btn">Access Admin Dashboard →</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 800; color: #00123C;">Infogenx Talent Acquisition & HR Operations</p>
      <p style="margin: 0;">Automated Notification from Infogenx Recruitment Management System</p>
    </div>
  </div>
</body>
</html>
  `;
}
