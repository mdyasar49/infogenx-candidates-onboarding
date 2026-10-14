# Infogenx Job & Internship Application Portal

This directory contains the source code for the public-facing candidate application and questionnaire portal hosted at **[https://candidates.infogenx.com/apply.html](https://candidates.infogenx.com/apply.html)**.

---

## 📌 Overview

The application portal allows applicants applying for **Internships**, **Direct Jobs / Trainee roles**, and **Freelance projects** to submit their details through two coordinated automated channels:

1. **Instant WhatsApp Pre-Filled Message:**
   - Pre-fills all questionnaire answers addressed to the **Infogenx HR Recruitment Team (+91 9787806366)** with standard format:
     `Dear HR, Below is the my Details for Infogenx: ...`
   - The candidate simply clicks "Submit & Send to HR Team via WhatsApp" and taps "Send".

2. **Automatic Partitioned Google Sheet Recording:**
   - Candidate responses are posted to: `POST https://candidates.infogenx.com/api/apply/submit`.
   - The backend routes and appends submissions into **3 dedicated Google Spreadsheets** based on `Application Type`:
     1. **🎓 Internship Applications:**
        * **Spreadsheet:** [Infogenx - Internship Applications](https://docs.google.com/spreadsheets/d/1LAsfnvSNBpr2WzRPyqbBSaNMsLbNU-rl1QxGPXiTpsA/edit?usp=sharing)
        * **Tab Name:** `Internship Applications`
     2. **💼 Direct Job / Trainee Applications:**
        * **Spreadsheet:** [Infogenx - Job Applications](https://docs.google.com/spreadsheets/d/14Ccmt5lN_JnKGHmW1fgFiRefZoECqrPWHe4VWZXk_MA/edit?usp=sharing)
        * **Tab Name:** `Job Applications`
     3. **💻 Freelance / Contract Applications:**
        * **Spreadsheet:** [Infogenx - Freelance Applications](https://docs.google.com/spreadsheets/d/1TgvY9gWS5VpUM8AMbHuH4VydwkxwOFPjo784iJBtfEY/edit?usp=sharing)
        * **Tab Name:** `Freelance Applications`

---

## 📂 File Structure

* **[`apply.html`](apply.html)**: Standalone HTML5 web application with responsive Infogenx Navy & Orange design system, interactive network particle canvas, dynamic roles dropdown by category, WhatsApp link generator, and async sheet integration.
* **Backend Handler:** Located in [`../backend/routes/apply.js`](../backend/routes/apply.js) mounted at `/api/apply` in [`../backend/server.js`](../backend/server.js).
* **Vite Mirror:** Synchronized to [`../frontend/public/apply.html`](../frontend/public/apply.html) for web builds.

---

## 📋 Questionnaire Fields Captured

1. Timestamp
2. Full Name
3. Contact / WhatsApp No
4. Location (City, State)
5. Application Type (`Internship` / `Job / Trainee` / `Freelance`)
6. Applying For (Role: Graphic Designer, HR, Digital Marketing, Developer, Odoo, Zoho, Sales, etc.)
7. Experience if any (Fresher / Experienced)
8. Qualification / Degree
9. Tech / Professional Skills
10. Certifications (if any)
11. Google Drive Resume URL (View Link)
12. LinkedIn Profile URL
13. Purpose of Application / Internship (Just to Learn / Learn and Earn / Only to Earn)
14. Earliest Start Date
15. Current / Previous Monthly Salary (if working)
16. Active Freelance Projects (if any)
17. Work Mode Preference (WFH fixed hours / Hybrid / Flexible)
18. Daily Work Duration & Timings
19. Preferred Availability Slots (Weekday & Weekend slots)
20. Status (`Pending Review`)

---

## 🚀 Live Deployment Information

* **Live URL:** `https://candidates.infogenx.com/apply.html`
* **Production Server:** `209.182.232.150`
* **Remote Path:** `/home/infogenx-candidates/htdocs/candidates.infogenx.com/dist/apply.html`

### 1-Click Update & Deployment Script
```bash
python d:\infonix\scripts\deploy_and_push_apply_form.py "Commit message"
```
