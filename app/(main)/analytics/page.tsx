// "use client";

// import { useAdminAnalytics } from "@/hooks/services/useAdminAnalytics";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// export default function AdminAnalyticsPage() {
//   const { data, isLoading, isError, error } = useAdminAnalytics();

//   if (isLoading) return <p>Loading analytics...</p>;
//   if (isError) return <p>Error: {error?.message}</p>;
//   if (!data) return <p>No analytics data</p>;

//   const { stats, charts } = data;
//   const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#F44336"];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {Object.entries(stats).map(([label, value]: [string, unknown]) => (
//           <div key={label} className="p-4 bg-white shadow rounded">
//             <p className="text-gray-500 capitalize">
//               {label.replace(/([A-Z])/g, " $1")}
//             </p>
//             <p className="text-2xl font-bold">{String(value)}</p>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-4 shadow rounded">
//           <h3 className="font-semibold mb-2">Appointments by Status</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={charts.appointmentsByStatus}>
//               <XAxis dataKey="_id" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="count">
//                 {charts.appointmentsByStatus.map(
//                   (_entry: any, index: number) => (
//                     <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                   ),
//                 )}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white p-4 shadow rounded">
//           <h3 className="font-semibold mb-2">Properties by Status</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={charts.propertiesByStatus}
//                 dataKey="count"
//                 nameKey="_id"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 label
//               >
//                 {charts.propertiesByStatus.map((_entry: any, index: number) => (
//                   <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useAdminAnalytics } from "@/hooks/services/useAdminAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError, error } = useAdminAnalytics();

  // State to hold colors for dynamic color picker
  const [appointmentColors, setAppointmentColors] = useState<string[]>([]);
  const [propertyColors, setPropertyColors] = useState<string[]>([]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground animate-pulse">
          Loading analytics...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-destructive">Error: {error?.message}</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );

  const { stats, charts } = data;

  // Initialize colors if not set
  if (appointmentColors.length === 0 && charts.appointmentsByStatus.length) {
    setAppointmentColors(charts.appointmentsByStatus.map(() => "#4CAF50"));
  }
  if (propertyColors.length === 0 && charts.propertiesByStatus.length) {
    setPropertyColors(charts.propertiesByStatus.map(() => "#2196F3"));
  }

  return (
    <div className="p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(stats).map(([label, value]: [string, unknown]) => (
          <Card key={label} className="shadow hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground capitalize">
                {label.replace(/([A-Z])/g, " $1")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{String(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointments Bar Chart */}
        <Card className="shadow">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Appointments by Status</CardTitle>
            <div className="flex gap-2">
              {charts.appointmentsByStatus.map((_entry, idx) => (
                <input
                  key={idx}
                  type="color"
                  value={appointmentColors[idx] || "#4CAF50"}
                  onChange={(e) =>
                    setAppointmentColors((prev) => {
                      const copy = [...prev];
                      copy[idx] = e.target.value;
                      return copy;
                    })
                  }
                  title={_entry._id}
                  className="w-6 h-6 rounded border"
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.appointmentsByStatus}>
                <XAxis dataKey="_id" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="count">
                  {charts.appointmentsByStatus.map((_entry, index) => (
                    <Cell
                      key={index}
                      fill={appointmentColors[index] || "#4CAF50"}
                      className="transition-all"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Properties Pie Chart */}
        <Card className="shadow">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Properties by Status</CardTitle>
            <div className="flex gap-2">
              {charts.propertiesByStatus.map((_entry, idx) => (
                <input
                  key={idx}
                  type="color"
                  value={propertyColors[idx] || "#2196F3"}
                  onChange={(e) =>
                    setPropertyColors((prev) => {
                      const copy = [...prev];
                      copy[idx] = e.target.value;
                      return copy;
                    })
                  }
                  title={_entry._id}
                  className="w-6 h-6 rounded border"
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts.propertiesByStatus}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {charts.propertiesByStatus.map((_entry, index) => (
                    <Cell
                      key={index}
                      fill={propertyColors[index] || "#2196F3"}
                      className="transition-all"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
