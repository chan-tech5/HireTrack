import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo, formatInitials } from "@/lib/utils/format";

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
  user: { name: string; image: string | null };
}

interface RecentActivityProps {
  activities: Activity[];
}

function formatAction(action: string, entityType: string): string {
  const map: Record<string, string> = {
    created_job: "created a new job posting",
    updated_job: "updated a job posting",
    archived_job: "archived a job",
    added_candidate: "added a new candidate",
    moved_stage: "moved a candidate to a new stage",
    scheduled_interview: "scheduled an interview",
    completed_interview: "completed an interview",
    submitted_scorecard: "submitted a scorecard",
    sent_offer: "sent an offer",
  };
  return map[action] ?? `performed action on ${entityType}`;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity yet.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarImage
                    src={activity.user.image ?? undefined}
                    alt={activity.user.name}
                  />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {formatInitials(activity.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    <span className="text-muted-foreground">
                      {formatAction(activity.action, activity.entityType)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
