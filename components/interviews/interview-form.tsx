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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { scheduleInterviewSchema, type ScheduleInterviewInput } from "@/lib/validations/interview.schema";
import { scheduleInterview } from "@/lib/actions/interview.actions";
import { INTERVIEW_TYPE_LABELS } from "@/lib/utils/constants";
import { formatFullName } from "@/lib/utils/format";

interface InterviewFormProps {
  applications: {
    id: string;
    candidate: { firstName: string; lastName: string };
    job: { title: string };
  }[];
  interviewers: { id: string; name: string }[];
}

export function InterviewForm({ applications, interviewers }: InterviewFormProps) {
  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(scheduleInterviewSchema) as any,
    defaultValues: {
      applicationId: "",
      title: "",
      type: "TECHNICAL",
      scheduledAt: "",
      durationMinutes: 60,
      interviewerIds: [],
      meetingLink: "",
      location: "",
      notes: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: any) {
    const result = await scheduleInterview(data);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Interview scheduled successfully.");
    router.push("/interviews");
    router.refresh();
  }

  const selectedInterviewerIds = form.watch("interviewerIds") || [];

  function handleInterviewerToggle(id: string, checked: boolean) {
    if (checked) {
      form.setValue("interviewerIds", [...selectedInterviewerIds, id]);
    } else {
      form.setValue("interviewerIds", selectedInterviewerIds.filter((item: string) => item !== id));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="interview-form">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview Linkage</CardTitle>
          <CardDescription>Select the candidate application and type of interview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationId">Candidate Application *</Label>
            <Select onValueChange={(v) => form.setValue("applicationId", v)}>
              <SelectTrigger id="applicationId"><SelectValue placeholder="Select candidate application" /></SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {formatFullName(app.candidate.firstName, app.candidate.lastName)} — {app.job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.applicationId && (
              <p className="text-xs text-destructive">{form.formState.errors.applicationId.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview-title">Interview Title *</Label>
              <Input id="interview-title" placeholder="e.g. Technical Round 1" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-type">Interview Type</Label>
              <Select
                defaultValue={form.getValues("type")}
                onValueChange={(v) => form.setValue("type", v)}
              >
                <SelectTrigger id="interview-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Schedule Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input id="scheduledAt" type="datetime-local" {...form.register("scheduledAt")} />
              {form.formState.errors.scheduledAt && (
                <p className="text-xs text-destructive">{form.formState.errors.scheduledAt.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Minutes)</Label>
              <Input id="duration" type="number" min="15" step="15" {...form.register("durationMinutes")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Video Meeting Link (e.g. Google Meet)</Label>
              <Input id="meetingLink" placeholder="https://meet.google.com/abc-defg-hij" {...form.register("meetingLink")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Physical Location</Label>
              <Input id="location" placeholder="e.g. Meeting Room A" {...form.register("location")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Interviewers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Interviewers *</CardTitle>
          <CardDescription>Assign team members to evaluate the candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {interviewers.map((i) => (
              <div key={i.id} className="flex items-center space-x-2 border border-border/80 rounded-lg p-3 hover:bg-muted/10 transition-colors">
                <Checkbox
                  id={`interviewer-${i.id}`}
                  checked={selectedInterviewerIds.includes(i.id)}
                  onCheckedChange={(checked) => handleInterviewerToggle(i.id, !!checked)}
                />
                <Label htmlFor={`interviewer-${i.id}`} className="text-sm font-medium cursor-pointer flex-1">
                  {i.name}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.interviewerIds && (
            <p className="text-xs text-destructive mt-2">{form.formState.errors.interviewerIds.message as string}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Interview Notes / Instructions</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={4} placeholder="Add focus areas, preparation notes or instructions..." {...form.register("notes")} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} id="schedule-interview-submit">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scheduling...</> : "Schedule Interview"}
        </Button>
      </div>
    </form>
  );
}
