import { Suspense } from "react";
import Loading from "@/components/loading";
import NewAppointmentForm from "../_components/appointment-form";

export default function NewAppointmentPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-10 text-center lg:text-left">
        Book a New Appointment
      </h1>

      <Suspense fallback={<Loading />}>
        <NewAppointmentForm />
      </Suspense>
    </div>
  );
}
