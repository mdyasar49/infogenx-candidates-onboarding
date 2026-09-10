# 🎓 Infogenx Candidate & Student Onboarding Portal

A modern, full-featured **React 19 + Vite** candidate onboarding and training assessment platform for **Infogenx**. The portal guides registered candidates through company SOPs, orientation presentations, a 50-question technical & compliance assessment, practical recruitment assignments, and onboarding completion.

🌐 **Production URL:** [https://candidates.infogenx.com](https://candidates.infogenx.com)  
📦 **GitHub Repository:** [https://github.com/mdyasar49/infogenx-candidates-onboarding](https://github.com/mdyasar49/infogenx-candidates-onboarding)

---

## 🚀 Complete End-to-End Onboarding Journey

```
[ 1. Google Form Registration ]
               │ (Saves to Google Sheet)
               ▼
[ 2. Student Portal Login (candidates.infogenx.com) ]
               │
               ▼
[ 3. Stage 1: SOP Learning Module (PDF Interactive Viewer) ]
               │
               ▼
[ 4. Stage 2: Company Orientation Presentation (PPT Slides) ]
               │
               ▼
[ 5. Stage 3: Technical & Compliance Assessment (50 MCQs) ]
               │
               ▼
[ 6. Stage 4: Result Evaluation (Pass Mark: 40/50 - 80%) ]
               │
               ▼
[ 7. Stage 5: Practical Recruitment Task (7 Steps + Screenshot Upload) ]
               │
               ▼
[ 8. Stage 6: Final Verification & HR Interview Clearance ]
```

---

## 📋 Step-by-Step Workflow Details

### 1. Student Registration (Google Form)
- Candidate fills the **Infogenx Internship Registration** Google Form.
- All candidate records are automatically recorded in the **`Infogenx Student Database`** Google Sheet.
- Account is activated for portal login.

### 2. Candidate Portal Login (`/login`)
- Candidates log in using their registered email and generated password.
- Test Admin account: `test@infogenx.com` / `test123`.
- Authenticates securely with Google Apps Script / Google Sheets API backend.

### 3. SOP Learning Guide (`/sop` / `/pdf`)
- Embedded reader for `Infogenx_Recruitment_Process_and_Job_Roles_SOP_Final.pdf`.
- Covers company culture, communication standards, and recruitment framework.
- Candidate must review the document to unlock the next stage.

### 4. Orientation Presentation (`/presentation` / `/ppt`)
- Interactive slide viewer for `Infogenx job recruitment Presentation.pdf`.
- Explains technical career tracks, stipends, milestones, and organizational hierarchy.

### 5. Online MCQ Assessment (`/assessment`)
- 50 randomized Multiple Choice Questions covering technical concepts and SOP rules.
- Real-time question navigation, progress tracker, and timer.

### 6. Score Evaluation & Feedback (`/result`)
- **Passing Threshold:** 80% (40 / 50 marks).
- Instant score calculation, attempt logging, and performance breakdown.
- Passing candidates unlock the **Recruitment Practical Task**.

### 7. Practical Recruitment Task (`/task`)
Candidates complete a 7-step practical assignment:
1. Create a recruitment Google Form following company standards.
2. Configure mandatory applicant data fields.
3. Design a branded Infogenx recruitment poster.
4. Attach the application form link to the creative.
5. Publish the hiring post on LinkedIn / social channels.
6. Capture a full screenshot of the live post.
7. Upload proof of submission in the portal.

### 8. Onboarding Completion & HR Next Steps
- Final verification clearance.
- Candidate is ready for mentor allocation, offer letter issuance, and final HR interview.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, Vite, React Router v7, Modern Vanilla CSS / Design Tokens
- **Backend API:** Node.js, Express 5, Google Sheets API v4 / Google Apps Script
- **Hosting & Server:** CloudPanel CE, Nginx Reverse Proxy & Static Asset Caching
- **Automation:** Playwright Python, Automated Deployment (`deploy.ps1`)

---

## 📂 Project Directory Structure

```
infogenx-candidates-onboarding/
├── public/                       # Static Assets & PDF Documents
│   ├── materials/                # SOP & Presentation PDFs
│   ├── favicon.svg               # Brand Favicon
│   ├── icons.svg                 # SVG Icons
│   ├── .htaccess                 # Apache / LiteSpeed SPA Rewrite Rule
│   └── _redirects                # Netlify / CDN SPA Rule
│
├── src/                          # React Application Source
│   ├── assets/                   # Images & Brand Logos
│   ├── components/               # Reusable UI Components
│   │   ├── GlobalLocations/      # Multi-region office display
│   │   ├── MaterialCard.jsx      # Learning module card
│   │   ├── ProgressSidebar.jsx   # Candidate progress tracker
│   │   ├── ProtectedRoute.jsx    # Authentication route guard
│   │   ├── TopHeader.jsx         # Candidate profile header
│   │   └── VisualTheme.jsx       # Theme and styling provider
│   ├── hooks/                    # Custom Hooks (useAuth, useSignatureCanvas)
│   ├── pages/                    # Portal Pages
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── SOPPage.jsx
│   │   ├── PresentationPage.jsx
│   │   ├── AssessmentPage.jsx
│   │   ├── ResultPage.jsx
│   │   ├── TaskPage.jsx
│   │   ├── CompletionPage.jsx
│   │   ├── JobRolesPage.jsx
│   │   └── TermsConditionsPage.jsx
│   ├── routes/                   # Route hierarchy (AppRoutes.jsx)
│   ├── services/                 # API & Auth Services (authService.js, mockData.js)
│   ├── App.jsx                   # Root Application Component
│   ├── index.css                 # Global CSS Variables & Fonts
│   └── main.jsx                  # React 19 Entrypoint
│
├── backend/                      # Express.js API (Optional / Microservice)
│   ├── routes/                   # (login, assessment, task endpoints)
│   ├── services/                 # (googlesheets.js, questions.js)
│   └── server.js                 # Express Server
│
├── index.html                    # Single Page App HTML Template
├── vite.config.js                # Vite Bundler Configuration
├── package.json                  # Dependencies & Scripts
└── README.md                     # Project Documentation
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (http://localhost:5173)
npm run dev

# 3. Create production build (dist/)
npm run build

# 4. Preview production build
npm run preview
```

---

## 🚀 Server Deployment

Deployments are automated via [`D:\infonix\deploy.ps1`](file:///d:/infonix/deploy.ps1):

```powershell
.\deploy.ps1 -EnvName candidates
# Or run interactively and select: 9) Candidates
```

- **Remote Host:** `209.182.232.150`
- **Linux User:** `infogenx-candidates`
- **Path:** `/home/infogenx-candidates/htdocs/candidates.infogenx.com/dist`
- **App Type:** `NODEJS` (Node 20 LTS)

---

## 📄 License & Ownership
Copyright © 2026 **Infogenx Private Limited**. All rights reserved.
