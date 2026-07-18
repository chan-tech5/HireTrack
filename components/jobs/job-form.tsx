"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createJobSchema, type CreateJobInput } from "@/lib/validations/job.schema";
import { createJob, updateJob } from "@/lib/actions/job.actions";
import { JOB_TYPE_LABELS, WORK_MODE_LABELS, JOB_STATUS_LABELS } from "@/lib/utils/constants";
import type { Job } from "@prisma/client";

interface JobFormProps {
  job?: Partial<Job>;
}

export function JobForm({ job }: JobFormProps) {
  const router = useRouter();
  const isEditing = !!job?.id;

  const form = useForm<any>({
    resolver: zodResolver(createJobSchema) as any,
    defaultValues: {
      title: job?.title ?? "",
      department: job?.department ?? "",
      description: job?.description ?? "",
      requirements: job?.requirements ?? "",
      responsibilities: job?.responsibilities ?? "",
      location: job?.location ?? "",
      workMode: job?.workMode ?? "ONSITE",
      type: job?.type ?? "FULL_TIME",
      status: job?.status ?? "DRAFT",
      skills: job?.skills ?? [],
      openings: job?.openings ?? 1,
      currency: job?.currency ?? "USD",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: any) {
    const result = isEditing
      ? await updateJob(job!.id!, data)
      : await createJob(data);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Job updated successfully" : "Job posted successfully");
    router.push("/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="job-form">
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input id="job-title" placeholder="e.g. Senior Frontend Engineer" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g. Engineering" {...form.register("department")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-type">Job Type</Label>
              <Select
                defaultValue={form.getValues("type")}
                onValueChange={(v) => form.setValue("type", v as CreateJobInput["type"])}
              >
                <SelectTrigger id="job-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-mode">Work Mode</Label>
              <Select
                defaultValue={form.getValues("workMode")}
                onValueChange={(v) => form.setValue("workMode", v as CreateJobInput["workMode"])}
              >
                <SelectTrigger id="work-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_MODE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openings">Openings</Label>
              <Input id="openings" type="number" min="1" {...form.register("openings")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. San Francisco, CA" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing-date">Closing Date</Label>
              <Input id="closing-date" type="date" {...form.register("closingDate")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Compensation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary-min">Min Salary</Label>
              <Input id="salary-min" type="number" placeholder="80000" {...form.register("salaryMin")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary-max">Max Salary</Label>
              <Input id="salary-max" type="number" placeholder="120000" {...form.register("salaryMax")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="USD" {...form.register("currency")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Job Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={6} placeholder="Describe the role and its impact..." {...form.register("description")} />
            {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea id="responsibilities" rows={4} placeholder="Key responsibilities..." {...form.register("responsibilities")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" rows={4} placeholder="Required skills and experience..." {...form.register("requirements")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Publish Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="job-status">Status</Label>
            <Select
              defaultValue={form.getValues("status")}
              onValueChange={(v) => form.setValue("status", v as CreateJobInput["status"])}
            >
              <SelectTrigger id="job-status" className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["DRAFT", "OPEN"] as const).map((s) => (
                  <SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} id="job-form-submit">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : isEditing ? "Update Job" : "Post Job"}
        </Button>
      </div>
    </form>
  );
}
