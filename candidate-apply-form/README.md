# Infogenx Candidate Direct Application Form

This directory contains the source code for the public-facing candidate application and questionnaire portal hosted at **[https://candidates.infogenx.com/apply.html](https://candidates.infogenx.com/apply.html)**.

---

## 📌 Overview

The application form allows candidates applying for **HR Internships**, **Recruiter Trainee roles**, and other opportunities to fill in their detailed profile and instantly submit it through two automated pathways:

1. **Instant WhatsApp Pre-Filled Message:**
   - Pre-fills all 18 questionnaire answers into WhatsApp addressed directly to **Anand Sir (`+91 9787806366`)**.
   - The candidate only needs to hit "Send" in WhatsApp.

2. **Automatic Google Sheet Recording:**
   - Submits candidate responses in the background to the Candidate Portal backend endpoint: `POST https://candidates.infogenx.com/api/apply/submit`.
   - The backend securely records each applicant as a row in the Google Spreadsheet:
     - **Sheet ID:** `13mW68lcoaZ9dtc_h--TLYki4dR-8xwZEh1ndGxVkorY`
     - **Tab Name:** `Direct Candidate Applications`

---

## 📂 File Structure

* **[`apply.html`](apply.html)**: Standalone, zero-dependency HTML5 application with responsive Infogenx Navy & Orange UI theme, input validation, WhatsApp message builder, and async submission logic.
* **Backend Handler:** Located in [`../backend/routes/apply.js`](../backend/routes/apply.js) mounted at `/api/apply` in [`../backend/server.js`](../backend/server.js).
* **Vite Public Asset:** Also mirrored at [`../frontend/public/apply.html`](../frontend/public/apply.html) for Vite distribution.

---

## 📋 Questionnaire Fields Captured

1. Full Name
2. Contact / WhatsApp No
3. Location (City, State)
4. Applied Role / Category (HR Intern, Recruiter Trainee, Marketing, Tech)
5. Experience (Fresher / Experienced)
6. Qualification / Degree
7. Tech / Professional Skills
8. Certifications (if any)
9. Google Drive Resume URL (View Link)
10. LinkedIn Profile URL
11. Purpose of Internship (Just to Learn / Learn and Earn / Only to Earn)
12. Unpaid Internship Agreement (Yes, 1 month / 2 months / 3 months / Only paid)
13. Earliest Start Date
14. Current / Previous Monthly Take-Home Salary (if working)
15. Freelance Projects (if any)
16. Work Mode Preference (Hybrid / WFH fixed hours / Flexible)
17. Daily Work Duration & Timings
18. Preferred Availability Slots (Weekday & Weekend slots)

---

## 🚀 Live Deployment Information

* **Live URL:** `https://candidates.infogenx.com/apply.html`
* **Production Server:** `209.182.232.150`
* **Remote Path:** `/home/infogenx-candidates/htdocs/candidates.infogenx.com/dist/apply.html`

### 1-Click Update & Deployment
To make changes to `apply.html` and deploy them live:
```bash
# Run from repository root
d:\infonix\deploy_apply_form.bat "Update description"
```
Or execute:
```bash
python d:\infonix\scripts\deploy_and_push_apply_form.py "Update description"
```
