"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAppointment } from "@/features/appointments/queries/appointments.queries";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type:  z.enum(["Property Viewing", "Inspection", "Legal Review"]),
  date:  z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AppointmentForm() {
  const router = useRouter();
  const create = useCreateAppointment();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "Property Viewing" },
  });

  const type = watch("type");

  const onSubmit = (values: FormValues) => {
    create.mutate(
      { ...values, date: new Date(values.date).toISOString() },
      {
        onSuccess: () => {
          toast.success("Appointment scheduled!");
          router.push("/appointments");
        },
        onError: (e) => toast.error(e.message || "Failed to schedule"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        {/* Left panel */}
        <div className="hidden lg:flex relative h-full rounded-2xl m-3 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex-col items-center justify-center gap-6 p-10">
          <Link
            href="/appointments"
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Calendar className="w-16 h-16 text-primary/60" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Schedule a Visit</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs">
              Book property viewings, inspections, and legal reviews all in one place.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="h-full overflow-y-auto flex flex-col bg-background border-l border-border">
          <div className="flex flex-col flex-1 justify-center px-8 lg:px-12 py-10 max-w-lg mx-auto w-full space-y-5">
            <div className="pb-2 border-b border-border">
              <h1 className="text-xl font-bold">New Appointment</h1>
              <p className="text-sm text-muted-foreground mt-1">Fill in the details below</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Kathmandu Villa Viewing" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Property Viewing">Property Viewing</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Legal Review">Legal Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" type="datetime-local" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" placeholder="Any special instructions..." {...register("notes")} />
            </div>

            <Button type="submit" className="w-full" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
