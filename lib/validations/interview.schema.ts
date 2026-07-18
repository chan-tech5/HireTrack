import { z } from "zod";
import { InterviewType, InterviewStatus } from "@prisma/client";

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().cuid("Invalid application"),
  title: z.string().min(2, "Title is required").max(100),
  type: z.nativeEnum(InterviewType),
  scheduledAt: z.string().refine(
    (val) => new Date(val) > new Date(),
    "Interview must be scheduled in the future"
  ),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(15, "Minimum 15 minutes")
    .max(480, "Maximum 8 hours"),
  interviewerIds: z
    .array(z.string().cuid())
    .min(1, "At least one interviewer is required"),
  meetingLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterviewSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  type: z.nativeEnum(InterviewType).optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  scheduledAt: z
    .string()
    .refine((val) => new Date(val) > new Date(), "Must be in the future")
    .optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
  interviewerIds: z.array(z.string().cuid()).min(1).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const submitScorecardSchema = z.object({
  interviewId: z.string().cuid(),
  overallRating: z.coerce.number().int().min(1).max(5),
  recommendation: z.enum([
    "STRONG_YES",
    "YES",
    "NEUTRAL",
    "NO",
    "STRONG_NO",
  ]),
  criteria: z.record(z.string(), z.coerce.number().int().min(1).max(5)),
  summary: z.string().optional(),
});

export const interviewFiltersSchema = z.object({
  status: z.nativeEnum(InterviewStatus).optional(),
  type: z.nativeEnum(InterviewType).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  interviewerId: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type SubmitScorecardInput = z.infer<typeof submitScorecardSchema>;
export type InterviewFiltersInput = z.infer<typeof interviewFiltersSchema>;
