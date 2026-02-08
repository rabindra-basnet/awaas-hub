// components/NewAppointmentForm.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCreateAppointment } from "@/lib/client/queries/appointments.queries";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Property Viewing", "Inspection", "Legal Review"]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  propertyId: z.string().min(1, "Property is required"),
  image: z.string().optional(),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function NewAppointmentForm() {
  const router = useRouter();
  const createAppointment = useCreateAppointment();
  const searchParams = useSearchParams();
  const propertyIdFromUrl = searchParams.get("propertyId") ?? "";
  const { data: images = [] } = usePropertyImages(propertyIdFromUrl);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      type: "Property Viewing",
      date: "",
      notes: "",
      propertyId: propertyIdFromUrl,
      image: "",
    },
  });

  useEffect(() => {
    if (images.length === 0) return;

    // Only set if not already the same value
    const currentImage = watch("image");
    if (currentImage !== images[0].url) {
      setValue("image", images[0].url);
    }
  }, [images, setValue, watch]);
  const selectedType = watch("type");

  const onSubmit = (data: AppointmentForm) => {
    const payload = {
      ...data,
      participants: [], // populate if needed
    };

    createAppointment.mutate(payload, {
      onSuccess: () => {
        toast.success("Appointment booked!");
        router.push("/dashboard");
      },
      onError: (err: any) => toast.error(err?.message || "Failed"),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <Label>Title</Label>
          <Input {...register("title")} placeholder="Appointment title" />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          {/* <Label>Property</Label> */}
          <Input
            type="hidden"
            {...register("propertyId")}
            defaultValue={propertyIdFromUrl}
          />
        </div>

        {/* Type (select) */}
        <div className="space-y-1">
          <Label>Type</Label>
          <Select
            value={selectedType}
            onValueChange={(v) => setValue("type", v as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Property Viewing">Property Viewing</SelectItem>
              <SelectItem value="Inspection">Inspection</SelectItem>
              <SelectItem value="Legal Review">Legal Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Date & Time</Label>
          <Input type="datetime-local" {...register("date")} />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea
            {...register("notes")}
            placeholder="Add notes..."
            rows={6}
          />
        </div>

        <input type="hidden" {...register("image")} />

        <Button type="submit" className="w-full">
          {createAppointment.isPending ? "Booking..." : "Book Appointment"}
        </Button>
      </div>

      <div className="w-full h-112 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {watch("image") ? (
          <img
            src={watch("image")}
            alt="Property"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm text-center px-4">
            No property image available
          </span>
        )}
      </div>
    </form>
  );
}
