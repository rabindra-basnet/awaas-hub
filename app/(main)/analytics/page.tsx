import { redirect } from "next/navigation";

// Analytics merged into /dashboard
export default function AnalyticsPage() {
  redirect("/dashboard");
}
