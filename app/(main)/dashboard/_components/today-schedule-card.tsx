"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type AppointmentStatus = "scheduled" | "approved" | "completed" | "cancelled";

type ScheduleItem = {
  _id: string;
  title: string;
  date: string;
  type?: string;
  status: AppointmentStatus;
  image?: string;
};

const statusDot: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-400",
  approved: "bg-green-400",
  completed: "bg-gray-400",
  cancelled: "bg-red-400",
};

const statusBg: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100",
  approved: "bg-green-100",
  completed: "bg-gray-200",
  cancelled: "bg-red-100",
};

export default function TodayScheduleCard({
  schedule = [],
}: {
  schedule: ScheduleItem[];
}) {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>{schedule.length} scheduled</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {schedule.map((item) => {
          const time = new Date(item.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Link
              key={item._id}
              href={`/appointments/${item._id}`}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="relative shrink-0">
                {item.image ? (
                  <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-border/50">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl",
                      statusBg[item.status],
                    )}
                  />
                )}
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                    statusDot[item.status],
                  )}
                />
              </div>

              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {item.title || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {time} · {item.type ?? "Property Viewing"}
                </p>
              </div>

              <Calendar className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}

        {schedule.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming appointments.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
