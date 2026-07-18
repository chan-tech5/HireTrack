"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StageBadge } from "@/components/shared/status-badge";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/utils/constants";
import { formatFullName, formatDate } from "@/lib/utils/format";
import { moveCandidateStage } from "@/lib/actions/candidate.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { ApplicationStage } from "@prisma/client";

interface KanbanApplication {
  id: string;
  stage: ApplicationStage;
  appliedAt: Date;
  candidateId: string;
  candidate: {
    firstName: string;
    lastName: string;
    currentTitle: string | null;
  };
}

interface JobKanbanBoardProps {
  initialApplications: KanbanApplication[];
  jobId: string;
  userRole: string;
}

export function JobKanbanBoard({ initialApplications, jobId, userRole }: JobKanbanBoardProps) {
  const [applications, setApplications] = useState<KanbanApplication[]>(initialApplications);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Group applications by stage
  const appsByStage = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = applications.filter((app) => app.stage === stage);
    return acc;
  }, {} as Record<ApplicationStage, KanbanApplication[]>);

  // HTML5 Drag and Drop handlers
  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(e: React.DragEvent, targetStage: ApplicationStage) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (!id) return;

    const targetApp = applications.find((app) => app.id === id);
    if (!targetApp) return;

    if (targetApp.stage === targetStage) return;

    // Optimistic Update
    const prevApps = [...applications];
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: targetStage } : app))
    );

    try {
      const result = await moveCandidateStage({
        applicationId: id,
        stage: targetStage,
        reason: "Moved via Kanban drag-and-drop",
      });

      if (result?.error) {
        toast.error(result.error);
        setApplications(prevApps); // Revert
      } else {
        toast.success(`Moved ${formatFullName(targetApp.candidate.firstName, targetApp.candidate.lastName)} to ${STAGE_LABELS[targetStage]}`);
      }
    } catch (err) {
      toast.error("An error occurred while moving the candidate.");
      setApplications(prevApps); // Revert
    } finally {
      setDraggingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 h-[600px] overflow-hidden">
      {STAGE_ORDER.map((stage) => {
        const apps = appsByStage[stage] || [];
        return (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className={cn(
              "bg-muted/40 rounded-xl p-3 border border-border/50 flex flex-col h-full transition-colors duration-200",
              draggingId && "hover:bg-muted/70 hover:border-primary/20"
            )}
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-xs font-semibold text-foreground tracking-wider uppercase">
                {STAGE_LABELS[stage]}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-bold">
                {apps.length}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
              {apps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  className="block p-3 rounded-lg bg-card hover:bg-accent/40 border border-border/80 shadow-xs hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 group"
                >
                  <Link href={`/candidates/${app.candidateId}`}>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {formatFullName(app.candidate.firstName, app.candidate.lastName)}
                    </p>
                  </Link>
                  {app.candidate.currentTitle && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {app.candidate.currentTitle}
                    </p>
                  )}
                  <p className="text-[9px] text-muted-foreground/60 mt-2">
                    Applied {formatDate(app.appliedAt)}
                  </p>
                </div>
              ))}

              {apps.length === 0 && (
                <div className="h-full flex items-center justify-center border border-dashed border-border/60 rounded-lg p-4 text-center">
                  <p className="text-[10px] text-muted-foreground/60">Drag candidates here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
