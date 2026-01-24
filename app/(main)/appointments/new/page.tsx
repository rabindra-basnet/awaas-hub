"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// import { useCreateAppointment } from "@/hooks/services/useAppointments";
// import { useProperties } from "@/hooks/services/useProperties";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointment } from "@/lib/client/queries/appointments.queries";
import { useProperties } from "@/lib/client/queries/properties.queries";

export const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Property Viewing", "Inspection", "Legal Review"]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  propertyId: z.string().min(1, "Property is required"),
  image: z.string().optional(),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const createAppointment = useCreateAppointment();
  const { data: properties = [], isLoading: loadingProperties } =
    useProperties();

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
      propertyId: "",
      image: "",
    },
  });

  const selectedPropertyId = watch("propertyId");
  const selectedProperty = properties.find(
    (p: any) => p._id === selectedPropertyId,
  );

  // Update image when property changes
  useEffect(() => {
    if (selectedProperty?.images?.[0]) {
      setValue("image", selectedProperty.images[0]);
    } else {
      setValue("image", "");
    }
  }, [selectedProperty, selectedPropertyId, setValue]);

  const onSubmit = (data: AppointmentForm) => {
    if (!selectedProperty) return toast.error("Select a valid property");

    const payload = {
      ...data,
      participants: [selectedProperty.createdBy],
    };

    createAppointment.mutate(payload, {
      onSuccess: () => {
        toast.success("Appointment booked successfully!");
        router.push("/dashboard");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to book appointment");
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-10 text-center lg:text-left">
        Book a New Appointment
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
      >
        {/* Left Column: Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              className="w-full"
              {...register("title")}
              placeholder="title for the appointments"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Property */}
          <div className="space-y-1">
            <Label htmlFor="property">Select Property</Label>
            {loadingProperties ? (
              <p>Loading properties...</p>
            ) : (
              <Select
                onValueChange={(value) => setValue("propertyId", value)}
                value={watch("propertyId")}
              >
                <SelectTrigger id="property" className="w-full">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p: any) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.propertyId && (
              <p className="text-red-500 text-sm">
                {errors.propertyId.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              value={watch("type")}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Property Viewing">
                  Property Viewing
                </SelectItem>
                <SelectItem value="Inspection">Inspection</SelectItem>
                <SelectItem value="Legal Review">Legal Review</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              className="w-full"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any notes..."
              rows={10}
              cols={20}
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <input type="hidden" {...register("image")} />

          <Button className="w-full mt-4" type="submit">
            {createAppointment.isPending ? "Booking..." : "Book Appointment"}
          </Button>
        </div>

        {/* Right Column: Property Image */}
        <div className="w-full h-112 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          {watch("image") ? (
            <img
              src={watch("image")}
              alt="Property"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm text-center px-4">
              Select a property to preview its image
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
