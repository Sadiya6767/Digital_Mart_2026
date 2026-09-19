# Digital Mart Solutions - Online Assessment Platform

A production-grade, full-stack Online Assessment Platform tailored for **Digital Mart Solutions** for evaluating candidates applying for the **Web Developer + Business Development Executive** position.

---

## 🌟 Key Features

1. **50 Questions Question Bank**:
   - **30 Web Development Questions**: HTML5, CSS3, Flexbox/Grid, Responsive Design, JavaScript ES6, Async/Await, React components & state, REST APIs, Git, and SQL.
   - **20 Business Development Questions**: BANT qualification, cold outreach, objection handling, CRM pipeline management, B2B sales cycles, and digital marketing.
   - Clean question presentation without any category tags or badges.

2. **15-Second Running Line Countdown Timer**:
   - Dynamic progress line above each question:
     - 🟢 **Green**: > 8s remaining
     - 🟠 **Orange**: 4s - 8s remaining
     - 🔴 **Red**: < 4s remaining (with pulse effect)
   - When 15 seconds expire, progress is saved automatically and the test advances to the next question.

3. **Auto-Advance & Question Skipping**:
   - Clicking an option highlights it with a clean checkmark and advances within 200ms.
   - Includes a dedicated **"Skip Question"** button so candidates can skip questions without answering.

4. **Single-Candidate Concurrency Room Lock**:
   - Strictly allows only **1 candidate** to take the assessment at a time.
   - Other candidates see a clear waiting notice with the active candidate's name.
   - Unlocks automatically upon test submission or via the Admin Dashboard.

5. **Permanent Data Persistence Guarantee**:
   - Supports **Neon Cloud PostgreSQL** so records, scores, and answers **never get deleted** across server reboots or redeployments.
   - **Base64 Resume Storage**: Candidate PDF resumes are also encoded and stored directly inside the database, guaranteeing resumes will never be lost even if temporary server files are wiped.

6. **Admin Dashboard & Analytics**:
   - Private route: `/admin/login`
   - Candidate management with search, filter by status/college, and sorting.
   - View / Download candidate resumes.
   - Comprehensive question-by-question analysis (Correct answers in Green, Incorrect in Red with selected vs correct, Skipped in Gray).
   - Single delete, bulk delete, and emergency room unlock.

---

## 🔑 Default Admin Credentials

- **Admin Login URL**: `/admin/login`
- **Username**: `Sadiya7890`
- **Password**: `SadiyaAdmin@DigitalMart2026`

---

## Technology Stack

- **Frontend**: React 18, Vite, React Router DOM, Lucide Icons, Pure Modular CSS
- **Backend**: Node.js, Express.js, Multer, JSON Web Token (JWT), bcryptjs
- **Database**: SQLite (utilizing Node.js native `DatabaseSync` engine - zero installation overhead)

---

## Project Structure

```
digital-mart-assessment/
├── package.json
├── .env.example
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── candidateController.js
│   │   ├── testController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── candidateRoutes.js
│   │   ├── testRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── upload.js
│   │   └── auth.js
│   ├── database/
│   │   ├── assessment.sqlite
│   │   └── seedQuestions.js
│   └── uploads/                  # Uploaded PDF resumes
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css             # Digital Mart blue & white corporate design
        ├── components/
        │   ├── Header.jsx
        │   ├── Modal.jsx
        │   └── TabWarningModal.jsx
        ├── pages/
        │   ├── RegistrationPage.jsx
        │   ├── TestPage.jsx
        │   ├── ResultPage.jsx
        │   ├── AdminLoginPage.jsx
        │   └── AdminDashboardPage.jsx
        └── services/
            └── api.js
```

---

## 🚀 100% Free Cloud Deployment Guide

Follow these 3 simple steps to deploy the application permanently:

### Step 1: Free Cloud Database on [Neon.tech](https://neon.tech)
1. Sign up on [Neon.tech](https://neon.tech) using GitHub or Google.
2. Click **Create Project** (Name: `digital-mart`).
3. Copy your connection string (`DATABASE_URL`), which looks like:
   ```text
   postgresql://neondb_owner:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Deploy Backend on [Render.com](https://render.com)
1. Sign up on [Render.com](https://render.com) using GitHub (`Sadiya6767`).
2. Click **New +** -> **Web Service**.
3. Select your repository: `Digital_Mart_2026`.
4. Set configurations:
   - **Root Directory**: `backend` *(mandatory)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add **Environment Variables**:
   - `DATABASE_URL`: *(paste Neon.tech connection string from Step 1)*
   - `JWT_SECRET`: `DigitalMartAssessmentSecretKey2026`
   - `ADMIN_USERNAME`: `Sadiya7890`
   - `ADMIN_PASSWORD`: `SadiyaAdmin@DigitalMart2026`
6. Click **Deploy Web Service** and copy your backend URL (e.g. `https://digital-mart-backend.onrender.com`).

### Step 3: Deploy Frontend on [Vercel.com](https://vercel.com)
1. Sign up on [Vercel.com](https://vercel.com) with GitHub.
2. Click **Add New...** -> **Project** and import `Digital_Mart_2026`.
3. Set configurations:
   - **Root Directory**: Select `frontend` *(mandatory)*
   - **Framework Preset**: `Vite` (auto-detected)
4. Add **Environment Variable**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://digital-mart-backend.onrender.com` *(your Render backend URL from Step 2)*
5. Click **Deploy**! Your site is live with a free domain and SSL in 30 seconds.

---

## 💻 Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds the 50 MCQs and default admin account
npm start        # Runs Express API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 System Credentials & Endpoints

| Portal | Route | Credentials / Access |
|---|---|---|
| **Student Assessment Portal** | `/` | Open registration with PDF resume upload |
| **Admin Login** | `/admin/login` | **Username**: `Sadiya7890`<br>**Password**: `SadiyaAdmin@DigitalMart2026` |
| **Admin Dashboard** | `/admin/dashboard` | Candidate management, resume viewer, live score analysis |
| **Backend Health Check** | `/api/health` | Public API health verification |

