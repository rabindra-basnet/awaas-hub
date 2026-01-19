// "use client";

// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Calendar, Plus } from "lucide-react";

// import { useAppointments } from "@/hooks/services/useAppointments";
// import { useProperties } from "@/hooks/services/useProperties";
// import Loading from "@/components/loading";
// import { Button } from "@/components/ui/button";

// type AppointmentStatus = "scheduled" | "approved" | "completed" | "cancelled";

// type ScheduleItem = {
//   id: string; // appointment ID
//   title: string;
//   time: string;
//   type: string;
//   status: AppointmentStatus;
// };

// type Appointment = {
//   _id: string;
//   title: string;
//   date: string;
//   type?: string;
//   status: AppointmentStatus;
//   propertyId: string;
// };

// type Property = {
//   _id: string;
//   title: string;
//   type?: string;
// };

// const statusColors: Record<AppointmentStatus, string> = {
//   scheduled: "bg-blue-100",
//   approved: "bg-green-100",
//   completed: "bg-gray-200",
//   cancelled: "bg-red-100",
// };

// export default function TodayScheduleCard() {
//   const { data: appointments, isLoading: loadingAppointments } =
//     useAppointments();
//   const { data: properties = [], isLoading: loadingProperties } =
//     useProperties();

//   if (loadingAppointments || loadingProperties)
//     return <Loading message="Fetching appointments..." />;

//   const safeAppointments: Appointment[] = Array.isArray(appointments)
//     ? appointments
//     : [];
//   const safeProperties: Property[] = Array.isArray(properties)
//     ? properties
//     : [];

//   const schedule: ScheduleItem[] = safeAppointments.map((a) => {
//     const property = safeProperties.find((p) => p._id === a.propertyId);
//     const time = new Date(a.date).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//     const type = a.type || property?.type || "Property Viewing";

//     return {
//       id: a._id,
//       title: a.title,
//       time,
//       type,
//       status: a.status,
//     };
//   });

//   return (
//     <Card>
//       <CardHeader className="flex justify-between items-center">
//         <div>
//           <CardTitle>Today’s Schedule</CardTitle>
//           <CardDescription>{schedule.length} appointments</CardDescription>
//         </div>
//         <Link href="/appointments/new">
//           <Button
//             size="sm"
//             variant="outline"
//             className="flex items-center gap-2"
//           >
//             <Plus className="h-4 w-4" />
//             Create new Appointments
//           </Button>
//         </Link>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {schedule.map((item) => (
//           <Link
//             key={item.id}
//             href={`/appointments/${item.id}`}
//             className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
//           >
//             {/* Status circle */}
//             <div
//               className={`h-9 w-9 rounded-full ${statusColors[item.status]}`}
//             />

//             {/* Appointment info */}
//             <div className="flex-1">
//               <p className="font-medium text-foreground">{item.title}</p>
//               <p className="text-xs text-muted-foreground">
//                 {item.time} · {item.type}
//               </p>
//             </div>

//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </Link>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppointmentStatus = "scheduled" | "approved" | "completed" | "cancelled";

type ScheduleItem = {
  _id: string;
  title: string;
  date: string;
  type?: string;
  status: AppointmentStatus;
};

const statusColors: Record<AppointmentStatus, string> = {
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
          <CardTitle>Today’s Schedule</CardTitle>
          <CardDescription>{schedule.length} appointments</CardDescription>
        </div>

        <Link href="/appointments/new">
          <Button size="sm" variant="outline" className="flex gap-2">
            <Plus className="h-4 w-4" />
            Create new Appointment
          </Button>
        </Link>
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
              <div
                className={`h-9 w-9 rounded-full ${statusColors[item.status]}`}
              />

              <div className="flex-1">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {time} · {item.type ?? "Property Viewing"}
                </p>
              </div>

              <Calendar className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
