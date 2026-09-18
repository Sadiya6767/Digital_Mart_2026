# Digital Mart Solutions - Online Assessment Platform

A full-stack, enterprise-grade Online Assessment Platform built for **Digital Mart Solutions** for evaluating candidates applying for the dual **Web Developer + Business Development Executive** job profile.

---

## Key Features

1. **Candidate Registration & Validation**:
   - Strict field validation (Full Name, Email format, 10-digit Indian mobile number, College, Degree, Branch, Graduation Year).
   - PDF Resume upload with Multer (validated mime-type and 5 MB size limit).
   - Mandatory confirmation declaration before test access.

2. **Assessment & Question Bank (30 MCQs)**:
   - **15 Web Development MCQs**: Semantic HTML, CSS Box Model, Flexbox, Responsive Design, JavaScript Scope (TDZ), Promises/Event Loop, DOM Delegation, React State & Hooks, REST APIs, Git, SQL Joins.
   - **15 Business Development & Sales MCQs**: BANT lead qualification, cold outreach, objection handling (budget, timing), CRM pipeline hygiene, B2B vs B2C, LTV:CAC unit economics, negotiation tactics, scope creep management.
   - Categorized by difficulty: 30% Basic, 50% Intermediate, 20% Practical Application.

3. **Randomized Question & Option Sequences**:
   - Every candidate receives a unique question sequence generated via Fisher-Yates shuffle.
   - Option order (A, B, C, D) is also shuffled per question while preserving backend answer correctness.
   - Shuffled sequence is saved in `test_sessions` to guarantee fixed question order across browser reloads.

4. **Synchronized 30-Minute Authoritative Timer**:
   - Backend-governed test duration with start and end timestamps.
   - Survives page refreshes and browser tab closures.
   - Warning notifications at **10 minutes**, **5 minutes**, and **1 minute** remaining.
   - Automatically submits when 30 minutes expire.

5. **Security & Anti-Cheating Controls**:
   - Zero correct answers exposed to the student browser.
   - Text selection disabled on questions (`user-select: none`).
   - Non-invasive tab switch detection alerts students if they navigate away.
   - Strict one-submission policy per candidate email.

6. **Admin Dashboard & Analytics**:
   - Accessible via private route: `/admin/login`.
   - KPI Summary: Total Candidates, Completed, In Progress, Auto Submitted, Registered Only, Average Score.
   - Candidate filtering (by Status and College), text search (Name, Email, Phone), and sorting by Score and Date.
   - "View Resume" opens candidate PDF directly.
   - "View Details" opens comprehensive breakdown: Scorecard, percentage, and question-by-question analysis (Correct in green, Incorrect in red).
   - Configurable settings: Toggle `SHOW_STUDENT_SCORE` and `ENABLE_TAB_WARNING`.

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

## Setup & Running the Platform

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Seeds the 30 MCQs and default admin account
npm start        # Runs Express API on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on http://localhost:5173
```

Now open your browser at **`http://localhost:5173`**.

---

## Default Admin Credentials

- **Admin Login URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `Admin@DigitalMart2026`

*(Passwords are securely hashed using bcrypt in the SQLite database).*

---

## Environment Variables

Copy `.env.example` to `backend/.env` if you wish to override default configurations:

```env
PORT=5000
JWT_SECRET=digital_mart_assessment_secret_jwt_key_2026
SHOW_STUDENT_SCORE=false
ENABLE_TAB_WARNING=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@DigitalMart2026
```

---

## Verification & Testing Scenarios

1. **Student Registration**:
   - Open `http://localhost:5173`.
   - Fill out candidate details with a valid 10-digit Indian phone (e.g., `9876543210`) and upload a sample PDF resume.
   - Click **Start Test**.

2. **Assessment Execution**:
   - Answer the 30 MCQs sequentially.
   - Refresh the page to verify that the remaining time, current question position, and selected answers are restored without data loss.
   - Observe the 10m, 5m, and 1m warnings.
   - Complete Question 30 and click **Submit Test**.

3. **Admin Verification**:
   - Go to `http://localhost:5173/admin/login`.
   - Log in using `admin` / `Admin@DigitalMart2026`.
   - Review candidate scores, click **View Resume** to view the candidate's PDF, and click **View Details** to inspect the question-by-question answer analysis.
