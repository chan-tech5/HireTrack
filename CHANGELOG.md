# Changelog

All notable changes to the HireTrack project will be documented in this file.

## [1.0.0] - 2026-07-18

### Added
*   **Authentication & Session Management**: Built secure credentials authentication and Google OAuth provider hooks via NextAuth v5.
*   **Access Control (RBAC)**: Added database-enforced role assignments (Admin, Recruiter, Interviewer) mapping page routing permissions.
*   **KPI Metrics & Analytics**: Visualized dashboard stats cards (open jobs, active candidates, interviews) and Recharts funnel bar charts.
*   **Jobs Management**: Completed fully-functional Jobs list views, creation forms, editing screens, and archive flows.
*   **Draggable Kanban Pipeline**: Interactive Kanban board using HTML5 native drag-and-drop to update candidate stage flows optimistically.
*   **Candidates & Timeline Notes**: Constructed Candidate profiles, timeline progressions, resume attachment uploader API, and note boards.
*   **Interviews & Scorecard Feedback**: Integrated interview schedulers and scoring evaluation sheets with custom rating matrices.
*   **Notifications**: Created dropdown and notifications list page marking alerts as read/unread.
*   **Organization & Profile Settings**: Configured org metadata configuration tabs, team member roles management table, and user password update inputs.
*   **Mock Seeding Script**: Added `prisma/seed.js` script to instantly populate a local/hosted database.
*   **Screenshots & Documentation**: Added high-end UI mockups and comprehensive codebase architecture diagram to `README.md`.
