# HireTrack

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://www.postgresql.org/)


![Hero Screenshot](docs/hero_screenshot.png)

## Overview
HireTrack is a modern Applicant Tracking System (ATS) built with Next.js, TypeScript, Prisma, PostgreSQL, and NextAuth. It streamlines recruitment by providing candidate management, interview scheduling, analytics dashboards, and role-based collaboration.

## Why this project?
This project was built as part of the Digital Heroes Full Stack Developer Trial Task to demonstrate modern full-stack engineering practices including authentication, RBAC, database design, analytics dashboards, drag-and-drop workflows, and scalable architecture.

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

### Frontend
*   **Core:** Next.js 15 (App Router), React 19, TypeScript
*   **Styling:** Tailwind CSS v4, next-themes (Light & Dark modes)
*   **UI Primitives:** shadcn/ui (powered by @base-ui/react primitives), Lucide Icons
*   **State Management:** TanStack Query (React Query)
*   **Charts:** Recharts

### Backend
*   **ORM:** Prisma ORM v7
*   **Database:** PostgreSQL (Supabase)
*   **Authentication:** NextAuth v5 (Auth.js)
*   **Form Validation:** Zod
*   **File Storage:** Local Node.js stream uploads to public directory

---

## Folder Structure
```
hiretrack/
├── app/                                # Next.js pages & layouts
│   ├── (auth)/                         # Login & Registration views
│   ├── (dashboard)/                    # Dashboard layout & features
│   └── api/                            # Next.js API Routes (auth/upload)
├── components/                         # Shared UI components
├── lib/                                # Core utilities & logic
│   ├── actions/                        # Next.js Server Actions
│   ├── auth/                           # Permissions & configuration
│   ├── db/                             # Prisma DB Client singleton
│   ├── utils/                          # Constants & formatter utils
│   └── validations/                    # Zod validation schemas
├── prisma/                             # Prisma Schema & Database Seeder
└── docs/                               # Screenshots & documentation assets
```

---

## Screenshots

| Dashboard | Pipeline (Kanban) |
| :---: | :---: |
| ![Dashboard](docs/dashboard.png) | ![Kanban](docs/kanban.png) |
| **Candidate Profile** | **Interview Scorecard** |
| ![Candidate Profile](docs/candidate_profile.png) | ![Interview Scorecard](docs/interview.png) |
| **Analytics Reports** | **Dark Mode** |
| ![Reports Charts](docs/reports.png) | ![Dark Mode Toggle](docs/dark_mode.png) |

---

## Database Schema
HireTrack uses a fully normalized schema containing 13 tables (Organization, User, Job, Candidate, Application, StageHistory, Interview, Scorecard, Notification, ActivityLog, etc.) to support a robust audit trail and full RBAC controls.

Link to schema: [prisma/schema.prisma](prisma/schema.prisma)

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
Populate your database with mock recruitment data:
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

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `jane@vercel.com` | `Password123` | Full access to organization settings, team members, job configurations, and candidate pools. |
| **Recruiter** | `john@vercel.com` | `Password123` | Create/edit jobs, manage candidate profiles, move stages, and schedule interviews. |
| **Interviewer** | `alice@vercel.com` | `Password123` | View jobs, read candidate profiles, and submit evaluation scorecards. |

---

## API Routes
*   `POST /api/auth/[...nextauth]` — NextAuth route handler for session cookies and credentials parsing.
*   `POST /api/upload` — Form file uploader saving candidate resumes and user avatars locally and returning URLs.

---

## Deployment

### Intended Platforms
*   **Frontend & Serverless Hosting:** Vercel (seamless App Router, Middleware, and Server Actions support).
*   **Database:** Supabase PostgreSQL (utilizing pooled connections for serverless actions).

### Required Environment Variables (Production)
Configure the following in your hosting provider dashboards:
*   `DATABASE_URL` — Connection pooling URL.
*   `NEXTAUTH_SECRET` — Unique 32-character JWT encryption key.
*   `NEXTAUTH_URL` — The production domain name (e.g. `https://hiretrack-ats.vercel.app`).
*   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth values registered on Google Cloud Console.

---

## Roadmap

### Future Improvements
*   **AI Resume Parsing:** Extract skills, experience, and contact details from PDF uploads automatically using serverless AI endpoints.
*   **Email Automation:** Draft template trigger updates and schedule rejections directly from candidate stage controls.
*   **Calendar Integration:** Connect meeting schedulers to Microsoft Outlook or Google Calendar.
*   **Offer Letter Generator:** Create template dynamic offer forms pulling compensation values directly from job settings.
*   **AI Candidate Ranking:** Rank pool applicants based on relevance to requirements text.

---

## Project Documentation
*   [Case Study](case_study.md) — Problem, technical approach, results, and architecture lessons learned.
*   [Changelog](CHANGELOG.md) — Version release logs and features trace.
*   [Contributing Guidelines](CONTRIBUTING.md) — Code style guides and pull request policies.

## Author

**Chandru S**

- Portfolio: https://chan-tech5.github.io/Portfolio/
- GitHub: https://github.com/chan-tech5
- LinkedIn: https://www.linkedin.com/in/chandru-s5

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
