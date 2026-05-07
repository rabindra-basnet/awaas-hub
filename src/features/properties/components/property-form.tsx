"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProperty } from "@/features/properties/queries/properties.queries";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, ImagePlus, X, MapPin, CheckCircle2, Upload } from "lucide-react";
import dynamic from "next/dynamic";

const LocationMapPicker = dynamic(
  () => import("./location-map-picker"),
  { ssr: false, loading: () => <div className="h-72 w-full rounded-xl bg-muted animate-pulse" /> },
);

/* ── Schema ─────────────────────────────────────────────────────────────── */

const schema = z.object({
  title:       z.string().min(3, "At least 3 characters").max(200, "Too long"),
  price:       z.number({ coerce: true, invalid_type_error: "Enter a valid price" }).min(1, "Price must be greater than 0"),
  location:    z.string().min(3, "At least 3 characters").max(100, "Too long"),
  category:    z.enum(["House", "Apartment", "Land", "Colony"], { required_error: "Pick a category" }),
  status:      z.enum(["available", "booked", "sold"]).default("available"),
  description: z.string().max(2000, "Max 2000 characters").optional(),
  area:        z.string().max(50).optional(),
  bedrooms:    z.number({ coerce: true }).int().min(0).max(20).optional(),
  bathrooms:   z.number({ coerce: true }).int().min(0).max(20).optional(),
  face:        z.string().optional(),
  roadType:    z.string().optional(),
  roadAccess:  z.string().max(50).optional(),
  negotiable:  z.boolean().default(false),
  municipality: z.string().max(100).optional(),
  wardNo:      z.string().max(10).optional(),
  ringRoad:    z.string().max(50).optional(),
  latitude:    z.number().nullable().optional(),
  longitude:   z.number().nullable().optional(),
  boundaryPoints: z.array(z.tuple([z.number(), z.number()])).default([]),
  nearHospital:    z.string().max(100).optional(),
  nearAirport:     z.string().max(100).optional(),
  nearSupermarket: z.string().max(100).optional(),
  nearSchool:      z.string().max(100).optional(),
  nearGym:         z.string().max(100).optional(),
  nearTransport:   z.string().max(100).optional(),
  nearAtm:         z.string().max(100).optional(),
  nearRestaurant:  z.string().max(100).optional(),
  videoUrl:    z.union([z.literal(""), z.string().url("Must be a valid URL")]).optional(),
});

type FormValues = z.infer<typeof schema>;
type ImageFile  = { file: File; preview: string; id: string };

/* ── Steps ──────────────────────────────────────────────────────────────── */

const STEPS = [
  { label: "Basic",      full: "Basic Info"    },
  { label: "Details",    full: "Details"       },
  { label: "Location",   full: "Location"      },
  { label: "Facilities", full: "Facilities"    },
  { label: "Photos",     full: "Photos"        },
] as const;

/* Step 0 required fields for pre-advance validation */
const STEP0_FIELDS = ["title", "price", "location", "category"] as const;

/* ── Upload helper ──────────────────────────────────────────────────────── */

async function uploadImage(file: File, propertyId: string) {
  const res = await fetch("/api/files/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimetype: file.type, size: file.size, propertyId, isPrivate: false }),
  });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.message || "Upload failed"); }
  const { uploadUrl } = await res.json();
  const up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!up.ok) throw new Error("Storage upload failed");
}

/* ── Field component ─────────────────────────────────────────────────────── */

function Field({ label, error, hint, required, children }: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive flex items-center gap-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function PropertyForm() {
  const [step, setStep]                     = useState(0);
  const [images, setImages]                 = useState<ImageFile[]>([]);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const router                              = useRouter();
  const create                              = useCreateProperty();

  const {
    register, handleSubmit, setValue, watch, trigger,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<FormValues>({
    resolver:        zodResolver(schema),
    mode:            "onChange",
    defaultValues:   { negotiable: false, status: "available", category: "House", boundaryPoints: [] },
  });

  const category       = watch("category");
  const status         = watch("status");
  const latitude       = watch("latitude");
  const longitude      = watch("longitude");
  const boundaryPoints = watch("boundaryPoints") ?? [];
  const description    = watch("description") ?? "";

  /* Images */
  const addImages = useCallback((files: FileList | null) => {
    if (!files) return;
    const next: ImageFile[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (images.length + next.length >= 10) { toast.error("Maximum 10 images"); break; }
      next.push({ file, preview: URL.createObjectURL(file), id: `${Date.now()}-${Math.random()}` });
    }
    setImages((p) => [...p, ...next]);
  }, [images.length]);

  const removeImage = (id: string) =>
    setImages((p) => { const img = p.find((i) => i.id === id); if (img) URL.revokeObjectURL(img.preview); return p.filter((i) => i.id !== id); });

  /* Navigation */
  const goNext = async () => {
    if (step === 0) { const ok = await trigger(STEP0_FIELDS); if (!ok) return; }
    setStep((s) => s + 1);
  };
  const goBack = () => setStep((s) => s - 1);

  /* Submit */
  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    try {
      const data: any = await new Promise((res, rej) => create.mutate(values, { onSuccess: res, onError: rej }));
      const pid: string = data._id;
      for (let i = 0; i < images.length; i++) {
        await uploadImage(images[i].file, pid);
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }
      toast.success("Listing created! Pending admin verification.");
      router.push(`/properties/${pid}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create listing");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const isLast       = step === STEPS.length - 1;
  const isSubmitting = create.isPending || uploading;

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Horizontal stepper ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const done    = i < step;
              const current = i === step;
              return (
                <li key={s.label} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => done && setStep(i)}
                    className={`flex flex-col items-center gap-1 group ${done ? "cursor-pointer" : "cursor-default"}`}
                    tabIndex={done ? 0 : -1}
                  >
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
                      ${done    ? "bg-primary text-primary-foreground shadow-sm"                          :
                        current ? "bg-primary/10 text-primary ring-[2.5px] ring-primary ring-offset-2"   :
                                  "bg-muted text-muted-foreground"}
                    `}>
                      {done ? <CheckCircle2 className="w-4.5 h-4.5" strokeWidth={2.5} /> : <span>{i + 1}</span>}
                    </span>
                    <span className={`
                      text-[11px] font-medium leading-none tracking-wide hidden sm:block transition-colors
                      ${current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}
                    `}>
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${i < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-4 space-y-4">

          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Basic Information</h2>
                <p className="text-sm text-muted-foreground">Start with the key details buyers look for</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Title" required error={errors.title?.message}
                    hint={!errors.title ? "Include property type and area" : undefined}>
                    <Input placeholder="e.g. 3BHK Villa with Garden in Lalitpur"
                      className={errors.title ? "border-destructive" : ""}
                      {...register("title")} />
                  </Field>
                </div>

                <Field label="Price (NPR)" required error={errors.price?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">NPR</span>
                    <Input type="number" placeholder="5,000,000" className={`pl-12 ${errors.price ? "border-destructive" : ""}`} {...register("price")} />
                  </div>
                </Field>

                <Field label="Status" error={errors.status?.message}>
                  <Select value={status} onValueChange={(v) => setValue("status", v as any, { shouldValidate: true })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Location" required error={errors.location?.message}
                  hint={!errors.location ? "City, district or neighbourhood" : undefined}>
                  <Input placeholder="e.g. Bhaisepati, Lalitpur"
                    className={errors.location ? "border-destructive" : ""}
                    {...register("location")} />
                </Field>

                <Field label="Category" required error={errors.category?.message}>
                  <Select value={category} onValueChange={(v) => setValue("category", v as any, { shouldValidate: true })}>
                    <SelectTrigger className={`w-full ${errors.category ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["House", "Apartment", "Land", "Colony"] as const).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="col-span-2">
                  <Field label="Description" error={errors.description?.message}
                    hint={`${description.length}/2000 characters`}>
                    <Textarea
                      placeholder="Describe key features, surroundings, recent renovations…"
                      rows={3} className="resize-none"
                      {...register("description")} />
                  </Field>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors select-none">
                    <input type="checkbox" className="rounded accent-primary w-4 h-4" {...register("negotiable")} />
                    <div>
                      <p className="text-sm font-medium">Price is negotiable</p>
                      <p className="text-xs text-muted-foreground">Buyers will see a "Negotiable" badge</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Property Details</h2>
                <p className="text-sm text-muted-foreground">Specific attributes — leave blank if not applicable</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Bedrooms" error={errors.bedrooms?.message}>
                  <Input type="number" min={0} max={20} placeholder="0"
                    className={errors.bedrooms ? "border-destructive" : ""}
                    {...register("bedrooms")} />
                </Field>

                <Field label="Bathrooms" error={errors.bathrooms?.message}>
                  <Input type="number" min={0} max={20} placeholder="0"
                    className={errors.bathrooms ? "border-destructive" : ""}
                    {...register("bathrooms")} />
                </Field>

                <Field label="Area" error={errors.area?.message} hint="e.g. 5 Aana, 200 sqft">
                  <Input placeholder="5 Aana" {...register("area")} />
                </Field>

                <Field label="Road Access Width" error={errors.roadAccess?.message} hint="e.g. 20 feet">
                  <Input placeholder="20 feet" {...register("roadAccess")} />
                </Field>

                <Field label="Facing Direction">
                  <Select onValueChange={(v) => setValue("face", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select direction" /></SelectTrigger>
                    <SelectContent>
                      {["North","South","East","West","North-East","North-West","South-East","South-West"].map((d) =>
                        <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Road Type">
                  <Select onValueChange={(v) => setValue("roadType", v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["Blacktopped","Graveled","Dirt","Goreto"].map((r) =>
                        <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="col-span-2">
                  <Field label="Video Tour URL" error={errors.videoUrl?.message}
                    hint={!errors.videoUrl ? "YouTube, Vimeo, or any direct video link" : undefined}>
                    <Input placeholder="https://youtube.com/watch?v=…"
                      className={errors.videoUrl ? "border-destructive" : ""}
                      {...register("videoUrl")} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Location & Map ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Location Details</h2>
                <p className="text-sm text-muted-foreground">Administrative location and map pin for buyers</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Municipality">
                    <Input placeholder="e.g. Kathmandu Metropolitan City" {...register("municipality")} />
                  </Field>
                </div>

                <Field label="Ward No.">
                  <Input placeholder="e.g. 10" {...register("wardNo")} />
                </Field>

                <Field label="Ring Road Distance" hint="Distance from ring road">
                  <Input placeholder="e.g. 500m inside" {...register("ringRoad")} />
                </Field>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Map Pin & Boundary</span>
                  <span className="text-xs text-muted-foreground ml-1">— optional but recommended</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-border">
                  <LocationMapPicker
                    lat={latitude ?? null}
                    lng={longitude ?? null}
                    boundaryPoints={boundaryPoints as [number, number][]}
                    onPinChange={(lat, lng) => { setValue("latitude", lat); setValue("longitude", lng); }}
                    onBoundaryChange={(pts) => setValue("boundaryPoints", pts)}
                  />
                </div>
                {latitude && longitude && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                    <span className="font-medium text-foreground">
                      {(latitude as number).toFixed(5)}, {(longitude as number).toFixed(5)}
                    </span>
                    <button type="button" className="text-destructive hover:underline ml-auto"
                      onClick={() => { setValue("latitude", null); setValue("longitude", null); }}>
                      Remove pin
                    </button>
                  </div>
                )}
                {boundaryPoints.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {boundaryPoints.length} boundary point{boundaryPoints.length !== 1 ? "s" : ""} drawn
                    {boundaryPoints.length < 3 ? ` · ${3 - boundaryPoints.length} more needed` : " · boundary complete"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Facilities ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Nearby Facilities</h2>
                <p className="text-sm text-muted-foreground">Enter distance or description — leave blank to skip</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "nearHospital",    label: "Hospital",        placeholder: "e.g. 5 min walk"    },
                  { key: "nearSchool",      label: "School",          placeholder: "e.g. 2 km away"     },
                  { key: "nearSupermarket", label: "Supermarket",     placeholder: "e.g. 500m nearby"   },
                  { key: "nearTransport",   label: "Public Transport", placeholder: "e.g. bus stop 2 min"},
                  { key: "nearAtm",         label: "ATM",             placeholder: "e.g. 100m"          },
                  { key: "nearRestaurant",  label: "Restaurant",      placeholder: "e.g. on same road"  },
                  { key: "nearGym",         label: "Gym",             placeholder: "e.g. 1 km"          },
                  { key: "nearAirport",     label: "Airport",         placeholder: "e.g. 20 km"         },
                ].map((f) => (
                  <Field key={f.key} label={f.label}>
                    <Input placeholder={f.placeholder} {...register(f.key as any)} />
                  </Field>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Photos ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Property Photos</h2>
                <p className="text-sm text-muted-foreground">Add up to 10 photos — the first one is the cover image</p>
              </div>

              <div
                onDrop={(e) => { e.preventDefault(); addImages(e.dataTransfer.files); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 py-8 cursor-pointer hover:bg-muted/40 hover:border-primary/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                  <ImagePlus className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Drop images here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP · max 10MB each · up to 10 files</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only"
                  onChange={(e) => addImages(e.target.files)} />
              </div>

              {images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{images.length} / 10 photos added</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map((img, i) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/65 text-white tracking-wide">
                            COVER
                          </span>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 10 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all">
                        <ImagePlus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading photos…</span>
                    <span className="font-medium text-foreground">{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <div className="flex-1" />
            {!isLast ? (
              <Button type="button" onClick={goNext}>
                Continue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="min-w-36">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {uploading && images.length > 0 ? `Uploading ${uploadProgress}%` : "Creating…"}
                  </>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" />Submit Listing</>
                )}
              </Button>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}
