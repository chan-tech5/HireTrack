"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCandidateSchema, type CreateCandidateInput } from "@/lib/validations/candidate.schema";
import { createCandidate, updateCandidate } from "@/lib/actions/candidate.actions";
import { CANDIDATE_SOURCES } from "@/lib/utils/constants";
import type { Candidate } from "@prisma/client";

interface CandidateFormProps {
  candidate?: Partial<Candidate>;
  jobs?: { id: string; title: string }[];
}

export function CandidateForm({ candidate, jobs = [] }: CandidateFormProps) {
  const router = useRouter();
  const isEditing = !!candidate?.id;
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(
    candidate?.resumeUrl && candidate?.resumeFileName
      ? { url: candidate.resumeUrl, name: candidate.resumeFileName }
      : null
  );

  const form = useForm<any>({
    resolver: zodResolver(createCandidateSchema) as any,
    defaultValues: {
      firstName: candidate?.firstName ?? "",
      lastName: candidate?.lastName ?? "",
      email: candidate?.email ?? "",
      phone: candidate?.phone ?? "",
      currentTitle: candidate?.currentTitle ?? "",
      currentCompany: candidate?.currentCompany ?? "",
      currentLocation: candidate?.currentLocation ?? "",
      experienceYears: candidate?.experienceYears ?? 0,
      skills: candidate?.skills ?? [],
      source: candidate?.source ?? "LinkedIn",
      tags: candidate?.tags ?? [],
      resumeUrl: candidate?.resumeUrl ?? "",
      resumeFileName: candidate?.resumeFileName ?? "",
      linkedinUrl: candidate?.linkedinUrl ?? "",
      portfolioUrl: candidate?.portfolioUrl ?? "",
      notes: candidate?.notes ?? "",
      jobId: "", // only for creation
    },
  });

  const { isSubmitting } = form.formState;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume file size cannot exceed 5MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedFile({ url: data.url, name: data.fileName });
      form.setValue("resumeUrl", data.url);
      form.setValue("resumeFileName", data.fileName);
      toast.success("Resume uploaded successfully.");
    } catch (err) {
      toast.error("Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: any) {
    if (!isEditing && !data.jobId) {
      toast.error("Please select a job for the candidate.");
      return;
    }

    const result = isEditing
      ? await updateCandidate(candidate!.id!, data)
      : await createCandidate(data);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Candidate profile updated" : "Candidate added successfully");
    router.push(isEditing ? `/candidates/${candidate!.id}` : "/candidates");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="candidate-form">
      {/* Target Job — Creation Only */}
      {!isEditing && jobs.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base text-primary">Job Application Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="jobId">Target Job Posting *</Label>
              <Select onValueChange={(v) => form.setValue("jobId", v)}>
                <SelectTrigger id="jobId"><SelectValue placeholder="Select a job to link application" /></SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input id="first-name" placeholder="John" {...form.register("firstName")} />
              {form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input id="last-name" placeholder="Doe" {...form.register("lastName")} />
              {form.formState.errors.lastName && <p className="text-xs text-destructive">{form.formState.errors.lastName.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="john.doe@gmail.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" {...form.register("phone")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Professional Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-title">Current Title</Label>
              <Input id="current-title" placeholder="Software Engineer" {...form.register("currentTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-company">Current Company</Label>
              <Input id="current-company" placeholder="Acme Corp" {...form.register("currentCompany")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-years">Years of Experience</Label>
              <Input id="experience-years" type="number" min="0" {...form.register("experienceYears")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-location">Current Location</Label>
              <Input id="current-location" placeholder="Austin, TX" {...form.register("currentLocation")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Candidate Source</Label>
              <Select
                defaultValue={form.getValues("source")}
                onValueChange={(v) => form.setValue("source", v)}
              >
                <SelectTrigger id="source"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CANDIDATE_SOURCES.map((src) => (
                    <SelectItem key={src} value={src}>{src}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Resume Attachment</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Label
                  htmlFor="resume-upload"
                  className="flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 rounded-xl px-5 py-8 text-sm font-medium transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Uploading resume...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      Choose Resume (PDF, DOCX)
                    </>
                  )}
                </Label>
              </div>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20 text-success text-sm max-w-md">
                <FileText className="h-5 w-5 text-success shrink-0" />
                <span className="truncate flex-1 font-medium">{uploadedFile.name}</span>
                <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Social Profiles & Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
              <Input id="linkedin-url" placeholder="https://linkedin.com/in/username" {...form.register("linkedinUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-url">Portfolio URL</Label>
              <Input id="portfolio-url" placeholder="https://myportfolio.com" {...form.register("portfolioUrl")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate-notes">Internal Notes</Label>
            <Textarea id="candidate-notes" rows={4} placeholder="Add any background, notes, or highlights..." {...form.register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || uploading} id="candidate-form-submit">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : isEditing ? "Update Profile" : "Add Candidate"}
        </Button>
      </div>
    </form>
  );
}
