"use server";

import { revalidatePath } from "next/cache";
import { Appointment } from "@/lib/models/Appointment";
import { Activity } from "@/lib/models/Activity";

export async function updateAppointmentStatusAction(
    appointmentId: string,
    newStatus: string,
    note?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Update the status on the main Appointment
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: newStatus },
            { new: true }
        );

        if (!appointment) throw new Error("Appointment not found");

        // 2. Create the separate Activity entry
        await Activity.create({
            appointmentId,
            action: `Status updated to ${newStatus}`,
            status: newStatus,
            note: note || "No note provided",
        });

        // 3. Revalidate the page to show fresh data
        revalidatePath(`/appointments/${appointmentId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update status:", error);
        return { success: false, error: error.message };
    }
}