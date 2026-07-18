# HireTrack

![Hero Screenshot](public/images/hero_screenshot.png)

## Overview
HireTrack is a production-grade, portfolio-quality Applicant Tracking System (ATS) designed for modern HR and recruiting teams. It streamlines hiring workflows, automates candidate tracking, organizes evaluations, and offers deep analytical insights—all within a fast, responsive, and beautifully designed user interface. 

---

## Features

### Features Table
| Feature | Status | Description |
| :--- | :---: | :--- |
| **Authentication** | ✅ | Secure registration and login using email/password and Google OAuth via NextAuth. |
| **Role-Based Access (RBAC)** | ✅ | Different workspaces for Admin, Recruiter, and Interviewer with strict page controls. |
| **Dashboard Summary** | ✅ | Real-time analytical statistics, activity feeds, and metric tracking at a glance. |
| **Interactive Kanban Board** | ✅ | Drag-and-drop board for candidate stage tracking with optimistic UI updates. |
| **Candidate Management** | ✅ | Full candidate profiles, resume attachment uploads, and audit trail histories. |
| **Interviews Scheduler** | ✅ | Schedule technical, HR, and cultural interview panels with dedicated evaluators. |
| **Detailed Scorecards** | ✅ | Structure ratings on criteria, overall star ratings, and written recruiter feedback. |
| **Notifications Feed** | ✅ | Bell dropdowns and notifications page alerting users to stage movements or schedules. |
| **Settings Dashboard** | ✅ | Modify organization metadata and manage team members role levels and active states. |

---

## Architecture

HireTrack implements a decoupled layered architecture using React Server Components (RSC) and Next.js Server Actions:

```mermaid
graph TD
    A[Browser Client] -->|HTTP / Forms| B[Next.js Server]
    B -->|RSC Rendering| C[Pages & Layouts]
    B -->|Server Actions| D[Services Layer]
    D -->|Validations| E[Zod Schemas]
    D -->|Query Operations| F[Prisma client]
    F -->|ORM Connection| G[PostgreSQL Supabase]
```

---

## Tech Stack
*   **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript
*   **Styles & Theme:** Tailwind CSS v4, next-themes (Light & Dark modes)
*   **UI Components:** shadcn/ui (powered by @base-ui/react primitives), Lucide Icons
*   **State & Forms:** TanStack Query, React Hook Form, Zod validation
*   **Database & ORM:** PostgreSQL (Supabase) + Prisma ORM v7
*   **Authentication:** NextAuth v5 (Auth.js)
*   **Data Visualization:** Recharts
*   **File Uploads:** Node.js stream upload endpoint to public directories

---

## Folder Structure
```
hiretrack/
├── app/                                # App Router Pages
│   ├── (auth)/                         # Login & Registration pages
│   ├── (dashboard)/                    # Dashboard layout with Sidebar & Topbar
│   │   ├── dashboard/                  # Main analytics view
│   │   ├── jobs/                       # Jobs listings and pipelines
│   │   ├── candidates/                 # Candidates profiles and histories
│   │   ├── interviews/                 # Agenda scheduling & evaluations
│   │   ├── reports/                    # Recharts metrics
│   │   ├── notifications/              # Alerts log
│   │   ├── settings/                   # Org & Team permissions
│   │   └── profile/                    # Personal password updates
│   ├── api/                            # Next.js API Routes (auth/upload)
│   └── globals.css                     # Global styles & design system
├── components/                         # UI components
├── lib/                                # Core utility & business logic
│   ├── actions/                        # Next.js Server Actions
│   ├── auth/                           # Permissions & session helpers
│   ├── db/                             # Prisma DB Client singleton
│   ├── utils/                          # Common constants & formats
│   └── validations/                    # Form schema rules
├── prisma/                             # Prisma Schema & Database Seeder
├── public/                             # Public images & assets
└── prisma.config.ts                    # Prisma v7 configuration file
```

---

## Screenshots

### Dashboard
![Dashboard Screenshot](public/images/dashboard.png)

### Jobs List
![Jobs List](public/images/jobs.png)

### Draggable Kanban Pipeline
![Kanban Board](public/images/kanban.png)

### Candidate Profile & Timelines
![Candidate Profile](public/images/candidate_profile.png)

### Interview Scorecard Evaluation
![Interview Scorecard](public/images/interview.png)

### Analytics Reports
![Reports Charts](public/images/reports.png)

### Dark Mode Toggle
![Dark Mode Toggle](public/images/dark_mode.png)

---

## Database Schema
HireTrack uses a fully normalized schema containing 13 tables:
*   `Organization`: Stores workspace profile name, website, and industry size.
*   `User`: Hashed credential details and workspace roles (Admin, Recruiter, Interviewer).
*   `Job`: Job listings, compensation details, location, status, and department.
*   `Candidate`: Basic profile data, skills, source, and resume file link.
*   `Application`: Links candidates to jobs with current pipeline stages.
*   `StageHistory`: Full audit trail of candidate stage movement with transition dates.
*   `Interview`: Structured scheduling with connected interviewers and status tags.
*   `Scorecard`: Evaluators numerical metrics, overall ratings, and recommendations.
*   `Notification`: User-specific notification logs.
*   `ActivityLog`: System-wide audit history showing who performed what action.

Link to schema: [prisma/schema.prisma](file:///c:/Users/chandru/Downloads/DH/hiretrack/prisma/schema.prisma)

---

## Setup & Local Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@host:port/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@host:port/dbname?sslmode=require"
NEXTAUTH_SECRET="your-32-character-secret-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

### 3. Deploy Database Schema
Push the schema to your PostgreSQL instance:
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Seeding Script
Populate your workspace with mock recruitment data:
```bash
npm run seed
```

### 5. Start Dev Server
```bash
npm run dev
```
Explore the app at `http://localhost:3000`.

---

## Seed Accounts (Testing Credentials)
Running the seeder script populates the database with the following demo credentials:

*   **Administrator Account:**
    *   **Email:** `jane@vercel.com`
    *   **Password:** `Password123`
    *   **Permissions:** Full access to edit organization, manage team members, delete jobs/candidates, and schedule interviews.
*   **Recruiter Account:**
    *   **Email:** `john@vercel.com`
    *   **Password:** `Password123`
    *   **Permissions:** Create/edit jobs, manage candidate profiles, move stages, and schedule interviews.
*   **Interviewer Account:**
    *   **Email:** `alice@vercel.com`
    *   **Password:** `Password123`
    *   **Permissions:** View jobs, read candidate profiles, and submit evaluation scorecards.

---

## API Routes
*   `POST /api/auth/[...nextauth]` — NextAuth route handler for session cookies and credentials parsing.
*   `POST /api/upload` — Form file uploader saving candidate resumes and user avatars to local directories and returning URLs.

---

## Roadmap

### Future Improvements
*   **AI Resume Parsing:** Extract skills, experience, and contact details from PDF uploads automatically using serverless AI endpoints.
*   **Email Automation:** Draft template trigger updates and schedule rejections directly from candidate stage controls.
*   **Calendar Integration:** Connect meeting schedulers to Microsoft Outlook or Google Calendar.
*   **Offer Letter Generator:** Create template dynamic offer forms pulling compensation values directly from job settings.
*   **AI Candidate Ranking:** Rank pool applicants based on relevance to requirements text.

---

## License
Distributed under the MIT License. See `LICENSE` for more information.
