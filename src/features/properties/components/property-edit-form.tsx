"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProperty, useUpdateProperty } from "@/features/properties/queries/properties.queries";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const LocationMapPicker = dynamic(
  () => import("./location-map-picker"),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-xl bg-muted animate-pulse" /> },
);

const schema = z.object({
  title:       z.string().min(1, "Title required").max(200),
  price:       z.number({ coerce: true }).min(0),
  location:    z.string().min(1, "Location required").max(100),
  category:    z.enum(["House", "Apartment", "Land", "Colony"]),
  description: z.string().max(2000).optional(),
  area:        z.string().optional(),
  bedrooms:    z.number({ coerce: true }).min(0).max(20).optional(),
  bathrooms:   z.number({ coerce: true }).min(0).max(20).optional(),
  face:        z.string().optional(),
  roadType:    z.string().optional(),
  roadAccess:  z.string().optional(),
  negotiable:  z.boolean().default(false),
  municipality: z.string().optional(),
  wardNo:      z.string().optional(),
  ringRoad:    z.string().optional(),
  latitude:    z.number().nullable().optional(),
  longitude:   z.number().nullable().optional(),
  boundaryPoints: z.array(z.tuple([z.number(), z.number()])).default([]),
  nearHospital:    z.string().optional(),
  nearAirport:     z.string().optional(),
  nearSupermarket: z.string().optional(),
  nearSchool:      z.string().optional(),
  nearGym:         z.string().optional(),
  nearTransport:   z.string().optional(),
  nearAtm:         z.string().optional(),
  nearRestaurant:  z.string().optional(),
  videoUrl:    z.union([z.literal(""), z.string().url()]).optional(),
  status:      z.enum(["available", "booked", "sold"]),
});

type FormValues = z.infer<typeof schema>;

export default function PropertyEditForm({ id }: { id: string }) {
  const { data: property } = useProperty(id);
  const update = useUpdateProperty(id);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (property) {
      reset({
        title:        property.title ?? "",
        price:        property.price ?? 0,
        location:     property.location ?? "",
        category:     (property.category as any) ?? "House",
        description:  property.description ?? "",
        area:         property.area ?? "",
        bedrooms:     property.bedrooms,
        bathrooms:    property.bathrooms,
        face:         property.face ?? "",
        roadType:     property.roadType ?? "",
        roadAccess:   property.roadAccess ?? "",
        negotiable:   property.negotiable ?? false,
        municipality: property.municipality ?? "",
        wardNo:       property.wardNo ?? "",
        ringRoad:     property.ringRoad ?? "",
        latitude:     (property as any).latitude ?? null,
        longitude:    (property as any).longitude ?? null,
        boundaryPoints: (property as any).boundaryPoints ?? [],
        nearHospital:    (property as any).nearHospital ?? "",
        nearAirport:     (property as any).nearAirport ?? "",
        nearSupermarket: (property as any).nearSupermarket ?? "",
        nearSchool:      (property as any).nearSchool ?? "",
        nearGym:         (property as any).nearGym ?? "",
        nearTransport:   (property as any).nearTransport ?? "",
        nearAtm:         (property as any).nearAtm ?? "",
        nearRestaurant:  (property as any).nearRestaurant ?? "",
        videoUrl:     property.videoUrl ?? "",
        status:       (property.status as any) ?? "available",
      });
    }
  }, [property, reset]);

  const category       = watch("category");
  const status         = watch("status");
  const latitude       = watch("latitude");
  const longitude      = watch("longitude");
  const boundaryPoints = watch("boundaryPoints") ?? [];

  const onSubmit = (values: FormValues) => {
    update.mutate(values, {
      onSuccess: () => {
        toast.success("Property updated!");
        router.push(`/properties/${id}`);
      },
      onError: (e) => toast.error(e.message || "Failed to update"),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        {/* Left panel */}
        <div className="hidden lg:flex relative h-full rounded-2xl m-3 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex-col items-center justify-center gap-6 p-10">
          <Link
            href={`/properties/${id}`}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Building2 className="w-16 h-16 text-primary/60" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Edit Listing</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs">
              Update your property details to keep buyers informed.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Changes to verified properties will reset to pending verification.
          </p>
        </div>

        {/* Right panel */}
        <div className="h-full overflow-y-auto flex flex-col bg-background border-l border-border">
          <div className="px-8 lg:px-12 py-10 max-w-lg mx-auto w-full space-y-5">
            <div className="pb-2 border-b border-border">
              <h1 className="text-xl font-bold">Edit Property</h1>
              <p className="text-sm text-muted-foreground mt-1">Update your listing information</p>
            </div>

            {/* Basic */}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="e.g. Beautiful Villa in Kathmandu" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Price (NPR) *</Label>
              <Input type="number" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Input {...register("location")} />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setValue("category", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["House", "Apartment", "Land", "Colony"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} className="resize-none" {...register("description")} />
            </div>

            {/* Details */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold mb-3">Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Bedrooms</Label>
                  <Input type="number" min={0} max={20} {...register("bedrooms")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bathrooms</Label>
                  <Input type="number" min={0} max={20} {...register("bathrooms")} />
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <Label>Area</Label>
                <Input placeholder="e.g. 5 Aana, 200 sqft" {...register("area")} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Facing</Label>
                  <Select onValueChange={(v) => setValue("face", v)} defaultValue={watch("face")}>
                    <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
                    <SelectContent>
                      {["North","South","East","West","North-East","North-West","South-East","South-West"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Road Type</Label>
                  <Select onValueChange={(v) => setValue("roadType", v)} defaultValue={watch("roadType")}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {["Blacktopped","Graveled","Dirt","Goreto"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <Label>Road Access</Label>
                <Input placeholder="e.g. 20 feet" {...register("roadAccess")} />
              </div>
              <div className="space-y-1.5 mt-4">
                <Label>Video Tour URL</Label>
                <Input placeholder="YouTube, Vimeo or direct video URL" {...register("videoUrl")} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                <input type="checkbox" className="rounded" {...register("negotiable")} />
                Price is negotiable
              </label>
            </div>

            {/* Location + Map */}
            <div className="pt-2 border-t border-border space-y-4">
              <p className="text-sm font-semibold">Location Details</p>
              <div className="space-y-1.5">
                <Label>Municipality</Label>
                <Input {...register("municipality")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Ward No.</Label>
                  <Input {...register("wardNo")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ring Road Distance</Label>
                  <Input placeholder="e.g. 500m" {...register("ringRoad")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Map — Pin & Boundary</Label>
                <LocationMapPicker
                  lat={latitude ?? null}
                  lng={longitude ?? null}
                  boundaryPoints={boundaryPoints as [number, number][]}
                  onPinChange={(lat, lng) => {
                    setValue("latitude", lat, { shouldDirty: true });
                    setValue("longitude", lng, { shouldDirty: true });
                  }}
                  onBoundaryChange={(pts) => setValue("boundaryPoints", pts, { shouldDirty: true })}
                />
                {latitude && longitude && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <span>Pin: {(latitude as number).toFixed(5)}, {(longitude as number).toFixed(5)}</span>
                    <button
                      type="button"
                      className="text-destructive hover:underline"
                      onClick={() => { setValue("latitude", null, { shouldDirty: true }); setValue("longitude", null, { shouldDirty: true }); }}
                    >
                      Clear pin
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Facilities */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold mb-3">Nearby Facilities</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "nearHospital",    label: "Hospital"    },
                  { key: "nearSchool",      label: "School"      },
                  { key: "nearSupermarket", label: "Supermarket" },
                  { key: "nearTransport",   label: "Transport"   },
                  { key: "nearAtm",         label: "ATM"         },
                  { key: "nearRestaurant",  label: "Restaurant"  },
                  { key: "nearGym",         label: "Gym"         },
                  { key: "nearAirport",     label: "Airport"     },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label>{f.label}</Label>
                    <Input placeholder="Distance or description" {...register(f.key as any)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 pb-6">
              <Button type="button" variant="outline" className="flex-1" render={<Link href={`/properties/${id}`} />} nativeButton={false}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={update.isPending || !isDirty}>
                {update.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-1.5" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
