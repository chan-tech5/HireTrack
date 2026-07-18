import { Role, JobStatus, JobType, WorkMode, ApplicationStage, InterviewType, InterviewStatus } from "@prisma/client";

// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME = "HireTrack";
export const APP_DESCRIPTION = "Modern Applicant Tracking System for professional hiring teams.";
export const MAX_RESUME_SIZE_MB = 5;
export const MAX_AVATAR_SIZE_MB = 2;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Jobs", href: "/jobs", icon: "Briefcase" },
  { label: "Candidates", href: "/candidates", icon: "Users" },
  { label: "Interviews", href: "/interviews", icon: "Calendar" },
  { label: "Reports", href: "/reports", icon: "BarChart2" },
  { label: "Notifications", href: "/notifications", icon: "Bell" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

// ─── Role Labels ──────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  INTERVIEWER: "Interviewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Full access to all features and settings",
  RECRUITER: "Can manage jobs, candidates, and interviews",
  INTERVIEWER: "Can view candidates and submit scorecards",
};

// ─── Job Enums ────────────────────────────────────────────────────────────────

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PAUSED: "Paused",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

// ─── Application Stages ───────────────────────────────────────────────────────

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

export const TERMINAL_STAGES: ApplicationStage[] = ["HIRED", "REJECTED", "WITHDRAWN"];

// ─── Interview Types ──────────────────────────────────────────────────────────

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  PHONE_SCREENING: "Phone Screening",
  TECHNICAL: "Technical",
  HR: "HR",
  CULTURAL_FIT: "Cultural Fit",
  FINAL: "Final Round",
  PANEL: "Panel",
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No Show",
};

// ─── Scorecard ────────────────────────────────────────────────────────────────

export const SCORECARD_RATINGS = [1, 2, 3, 4, 5] as const;

export const RECOMMENDATIONS = [
  { value: "STRONG_YES", label: "Strong Yes" },
  { value: "YES", label: "Yes" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "NO", label: "No" },
  { value: "STRONG_NO", label: "Strong No" },
] as const;

export const SCORECARD_CRITERIA = [
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "culturalFit", label: "Cultural Fit" },
  { key: "leadership", label: "Leadership" },
] as const;

// ─── Candidate Sources ────────────────────────────────────────────────────────

export const CANDIDATE_SOURCES = [
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "Referral",
  "Company Website",
  "Job Fair",
  "GitHub",
  "Dribbble",
  "Behance",
  "AngelList",
  "Other",
] as const;

// ─── Industry Options ─────────────────────────────────────────────────────────

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Real Estate",
  "Transportation",
  "Energy",
  "Other",
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
