"use client";

import { MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns"; // Recommended for date formatting
import { IActivity } from "@/lib/models/Activity";

interface TimelineProps {
  activities: IActivity[];
  isLoading?: boolean;
}

export function AppointmentTimeline({ activities, isLoading }: TimelineProps) {
  if (isLoading) return <div className="animate-pulse space-y-4">...</div>;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Activity Timeline
        </h3>
      </div>

      <div className="relative space-y-0 pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-2">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="relative pl-8 pb-8 last:pb-0 group"
          >
            {/* The Indicator Dot */}
            <div className="absolute -left-[1.28rem] top-1.5 w-4 h-4 rounded-full border-4 border-background bg-primary shadow-sm group-hover:scale-110 transition-transform" />

            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-border bg-card/50 shadow-sm hover:bg-card transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-sm tracking-tight text-foreground uppercase">
                  {activity.action}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3" />
                  {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                </div>
              </div>

              {activity.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic bg-muted/30 p-2 rounded border-l-2 border-primary/20">
                  "{activity.note}"
                </p>
              )}

              <div className="pt-1">
                <Badge
                  variant={
                    activity.status === "approved" ? "success" : "secondary"
                  }
                  className="text-[10px] h-5"
                >
                  {activity.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground italic ml-4">
            No activity history found for this appointment.
          </p>
        )}
      </div>
    </div>
  );
}
