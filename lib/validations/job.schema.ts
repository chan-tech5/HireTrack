import { z } from "zod";
import { JobStatus, JobType, WorkMode } from "@prisma/client";

const jobBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  department: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  location: z.string().optional(),
  workMode: z.nativeEnum(WorkMode),
  type: z.nativeEnum(JobType),
  status: z.nativeEnum(JobStatus).default("DRAFT"),
  skills: z.array(z.string()).default([]),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  currency: z.string().default("USD"),
  openings: z.coerce.number().int().min(1, "At least 1 opening is required").default(1),
  experienceMin: z.coerce.number().int().min(0).optional(),
  experienceMax: z.coerce.number().int().min(0).optional(),
  closingDate: z.string().optional(),
});

export const createJobSchema = jobBaseSchema
  .refine(
    (data) => {
      if (data.salaryMin && data.salaryMax) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    { message: "Minimum salary cannot exceed maximum salary", path: ["salaryMin"] }
  )
  .refine(
    (data) => {
      if (data.closingDate) {
        return new Date(data.closingDate) > new Date();
      }
      return true;
    },
    { message: "Closing date must be in the future", path: ["closingDate"] }
  );

export const updateJobSchema = jobBaseSchema.partial()
  .refine(
    (data) => {
      if (data.salaryMin && data.salaryMax) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    { message: "Minimum salary cannot exceed maximum salary", path: ["salaryMin"] }
  )
  .refine(
    (data) => {
      if (data.closingDate) {
        return new Date(data.closingDate) > new Date();
      }
      return true;
    },
    { message: "Closing date must be in the future", path: ["closingDate"] }
  );

export const jobFiltersSchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  type: z.nativeEnum(JobType).optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobFiltersInput = z.infer<typeof jobFiltersSchema>;
