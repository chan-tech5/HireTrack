"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitScorecardSchema, type SubmitScorecardInput } from "@/lib/validations/interview.schema";
import { submitScorecard } from "@/lib/actions/interview.actions";
import { RECOMMENDATIONS, SCORECARD_CRITERIA } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

interface ScorecardFormProps {
  interviewId: string;
}

export function ScorecardForm({ interviewId }: ScorecardFormProps) {
  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(submitScorecardSchema) as any,
    defaultValues: {
      interviewId,
      overallRating: 3,
      recommendation: "NEUTRAL",
      criteria: {
        technicalSkills: 3,
        communication: 3,
        problemSolving: 3,
        culturalFit: 3,
        leadership: 3,
      },
      summary: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: any) {
    const result = await submitScorecard(data);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Scorecard submitted successfully.");
    router.refresh();
  }

  const currentOverallRating = form.watch("overallRating");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="scorecard-form">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Submit Candidate Scorecard</CardTitle>
          <CardDescription>Assess candidate against job criteria metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Criteria Ratings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground">Detailed Evaluation Criteria</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SCORECARD_CRITERIA.map((criterion) => (
                <div key={criterion.key} className="space-y-2 border border-border/80 rounded-xl p-4 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {criterion.label}
                    </Label>
                    <span className="text-sm font-bold text-foreground">
                      {form.watch(`criteria.${criterion.key}`)} / 5
                    </span>
                  </div>
                  <RadioGroup
                    defaultValue="3"
                    className="flex gap-2.5 mt-2"
                    onValueChange={(v) => form.setValue(`criteria.${criterion.key}`, parseInt(v))}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="flex items-center">
                        <RadioGroupItem
                          value={num.toString()}
                          id={`criteria-${criterion.key}-${num}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`criteria-${criterion.key}-${num}`}
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold cursor-pointer transition-all duration-150",
                            form.watch(`criteria.${criterion.key}`) === num
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {num}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/60">
            {/* Overall Star Rating */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">Overall Rating *</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => form.setValue("overallRating", star)}
                    className="p-1 cursor-pointer transition-colors"
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-all duration-150",
                        star <= currentOverallRating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Select */}
            <div className="space-y-2">
              <Label htmlFor="recommendation">Final Recommendation *</Label>
              <Select
                defaultValue={form.getValues("recommendation")}
                onValueChange={(v) => form.setValue("recommendation", v)}
              >
                <SelectTrigger id="recommendation"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RECOMMENDATIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feedback Notes */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="summary-feedback">Written Feedback Summary</Label>
            <Textarea
              id="summary-feedback"
              placeholder="Detail candidate's strengths, weaknesses, and rationale for your recommendation..."
              rows={5}
              {...form.register("summary")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto" id="scorecard-submit-btn">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Scorecard"}
        </Button>
      </div>
    </form>
  );
}
