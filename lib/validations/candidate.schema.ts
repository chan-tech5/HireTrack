import { z } from "zod";

export const createCandidateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  currentLocation: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0).max(50).optional(),
  skills: z.array(z.string()).default([]),
  source: z.string().optional(),
  tags: z.array(z.string()).default([]),
  resumeUrl: z.string().optional().or(z.literal("")),
  resumeFileName: z.string().optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  jobId: z.string().optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const candidateFiltersSchema = z.object({
  search: z.string().optional(),
  source: z.string().optional(),
  skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
});

export const moveCandidateStageSchema = z.object({
  applicationId: z.string().cuid(),
  stage: z.enum(["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"]),
  reason: z.string().optional(),
});

export const createApplicationNoteSchema = z.object({
  applicationId: z.string().cuid(),
  content: z.string().min(1, "Note cannot be empty").max(2000),
  isPrivate: z.boolean().default(false),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type CandidateFiltersInput = z.infer<typeof candidateFiltersSchema>;
export type MoveCandidateStageInput = z.infer<typeof moveCandidateStageSchema>;
export type CreateApplicationNoteInput = z.infer<typeof createApplicationNoteSchema>;
