"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Plus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  MapPin,
  Utensils,
  ImageIcon,
  Check,
} from "lucide-react";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";
import { cn } from "@/lib/utils";
import {
  PROPERTY_STATUS,
  PROPERTY_CATEGORY,
  PROPERTY_FACE,
  PROPERTY_ROAD_TYPE,
  PROPERTY_LOCATION,
} from "@/lib/models/Property";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(1, "Location is required"),
  description: z.string().max(5000).optional(),
  category: z.string().min(1, "Property type is required"),
  status: z.enum(["available", "booked", "sold"]),
  area: z.string().min(1, "Area is required"),
  face: z.string().min(1, "Property Face is required"),
  roadType: z.string().min(1, "Property Road type is required"),
  roadAccess: z.string().optional(),
  negotiable: z.boolean(),
  municipality: z.string().optional(),
  wardNo: z.string().optional(),
  ringRoad: z.string().optional(),
  nearHospital: z.string().optional(),
  nearAirport: z.string().optional(),
  nearSupermarket: z.string().optional(),
  nearSchool: z.string().optional(),
  nearGym: z.string().optional(),
  nearTransport: z.string().optional(),
  nearAtm: z.string().optional(),
  nearRestaurant: z.string().optional(),
});

export type PropertyStatus = z.infer<typeof formSchema>["status"];
export type PropertyFormValues = z.infer<typeof formSchema>;

type PreviewFile = {
  file: File;
  url: string;
  uploadProgress?: number;
  fileId?: string;
};

type ExistingImage = {
  id: string;
  url: string;
  filename: string;
};

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  existingImages?: ExistingImage[];
  propertyId?: string;
  onSubmit: (
    values: PropertyFormValues & {
      fileIds: string[];
      deletedFileIds: string[];
    },
  ) => void;
  isSubmitting?: boolean;
  buttonText?: string;
}

const STEPS = [
  {
    id: 0,
    label: "Basic Info",
    short: "Basic",
    icon: Info,
    accent: "bg-primary",
    border: "border-primary",
  },
  {
    id: 1,
    label: "Property",
    short: "Property",
    icon: Building2,
    accent: "bg-amber-500",
    border: "border-amber-500",
  },
  {
    id: 2,
    label: "Location",
    short: "Location",
    icon: MapPin,
    accent: "bg-blue-500",
    border: "border-blue-500",
  },
  {
    id: 3,
    label: "Facilities",
    short: "Nearby",
    icon: Utensils,
    accent: "bg-green-500",
    border: "border-green-500",
  },
  {
    id: 4,
    label: "Images",
    short: "Images",
    icon: ImageIcon,
    accent: "bg-purple-500",
    border: "border-purple-500",
  },
];

const STEP_FIELDS: Record<number, (keyof PropertyFormValues)[]> = {
  0: ["title", "price", "location", "category", "status"],
  1: ["area", "face", "roadType", "roadAccess", "negotiable"],
  2: ["municipality", "wardNo", "ringRoad"],
  3: [
    "nearHospital",
    "nearAirport",
    "nearSupermarket",
    "nearSchool",
    "nearGym",
    "nearTransport",
    "nearAtm",
    "nearRestaurant",
  ],
  4: [],
};

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[11px] text-destructive font-semibold">{error}</p>
      )}
    </div>
  );
}

export default function PropertyForm({
  initialData,
  existingImages: initialExistingImages,
  propertyId,
  onSubmit,
  isSubmitting = false,
  buttonText = "Save Property",
}: PropertyFormProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [images, setImages] = useState<PreviewFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // ✅ Single ref, always mounted outside step conditionals
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || 0,
      location: initialData?.location || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      status: initialData?.status || "available",
      area: initialData?.area || "",
      face: initialData?.face || "",
      roadType: initialData?.roadType || "",
      roadAccess: initialData?.roadAccess || "",
      negotiable: initialData?.negotiable ?? false,
      municipality: initialData?.municipality || "",
      wardNo: initialData?.wardNo || "",
      ringRoad: initialData?.ringRoad || "",
      nearHospital: initialData?.nearHospital || "",
      nearAirport: initialData?.nearAirport || "",
      nearSupermarket: initialData?.nearSupermarket || "",
      nearSchool: initialData?.nearSchool || "",
      nearGym: initialData?.nearGym || "",
      nearTransport: initialData?.nearTransport || "",
      nearAtm: initialData?.nearAtm || "",
      nearRestaurant: initialData?.nearRestaurant || "",
    },
  });

  const negotiable = watch("negotiable");
  const locationValue = watch("location");
  const categoryValue = watch("category");
  const statusValue = watch("status");
  const faceValue = watch("face");
  const roadTypeValue = watch("roadType");

  const { data: fetchedImages = [], isLoading: loadingExisting } =
    usePropertyImages(propertyId);

  useEffect(() => {
    if (fetchedImages.length) setExistingImages(fetchedImages);
    else if (!propertyId && initialExistingImages?.length)
      setExistingImages(initialExistingImages);
  }, [fetchedImages, propertyId, initialExistingImages]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setCompletedSteps((prev) => new Set(prev).add(step));
    setDirection("forward");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimating(false);
    }, 180);
  }

  function goBack() {
    setDirection("back");
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 180);
  }

  function jumpTo(target: number) {
    const canJump =
      target < step ||
      completedSteps.has(target) ||
      completedSteps.has(target - 1);
    if (!canJump) return;
    setDirection(target > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setAnimating(false);
    }, 180);
  }

  // ── Image handling ─────────────────────────────────────────────────────────
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      uploadProgress: undefined, // undefined = not yet uploading
    }));
    setImages((prev) => [...prev, ...newFiles]);
    // Reset so same file can be picked again
    e.target.value = "";
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(images[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(imageId: string) {
    setDeletedFileIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function uploadImages(): Promise<string[]> {
    if (!images.length) return [];
    setUploading(true);
    const fileIds: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.fileId) {
        fileIds.push(img.fileId);
        continue;
      }

      const fd = new FormData();
      fd.append("file", img.file);
      fd.append("isPrivate", "true");

      // Mark as started
      setImages((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 10 } : p)),
      );

      let fakeProgress = 10;
      const interval = setInterval(() => {
        fakeProgress = Math.min(
          fakeProgress + Math.floor(Math.random() * 15 + 5),
          85,
        );
        const captured = fakeProgress;
        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i &&
            typeof p.uploadProgress === "number" &&
            p.uploadProgress < 100 &&
            p.uploadProgress !== -1
              ? { ...p, uploadProgress: captured }
              : p,
          ),
        );
      }, 300);

      try {
        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: fd,
        });
        clearInterval(interval);
        if (!res.ok) throw new Error(`Upload failed for ${img.file.name}`);
        const data = await res.json();
        const fileId = data.file._id;
        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, uploadProgress: 100, fileId } : p,
          ),
        );
        fileIds.push(fileId);
      } catch (error) {
        clearInterval(interval);
        console.error(error);
        setImages((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
        );
        setUploading(false);
        throw error;
      }
    }

    setUploading(false);
    return fileIds;
  }

  async function onFormSubmit(values: PropertyFormValues) {
    try {
      const newFileIds = await uploadImages();
      onSubmit({ ...values, fileIds: newFileIds, deletedFileIds });
    } catch (error) {
      console.error(error);
    }
  }

  const currentStep = STEPS[step];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* ✅ Always mounted — never inside a conditional */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        disabled={uploading}
      />

      {/* ── STEP INDICATOR ── */}
      <div className="relative">
        <div className="absolute top-5 left-8 right-8 h-px bg-border hidden sm:block" />
        <div
          className="absolute top-5 left-8 h-px bg-primary transition-all duration-500 hidden sm:block"
          style={{
            width: `calc((${step} / ${STEPS.length - 1}) * (100% - 4rem))`,
          }}
        />
        <div className="relative flex justify-between items-start px-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = completedSteps.has(s.id);
            const isCurrent = step === s.id;
            const isReachable =
              s.id < step ||
              completedSteps.has(s.id) ||
              completedSteps.has(s.id - 1);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(s.id)}
                disabled={!isReachable && !isCurrent}
                className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
                    isCurrent &&
                      `${s.border} ${s.accent} text-white scale-110 shadow-lg`,
                    isCompleted &&
                      !isCurrent &&
                      "border-primary bg-primary text-white",
                    !isCurrent &&
                      !isCompleted &&
                      "border-border text-muted-foreground",
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider transition-colors hidden sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP CARD ── */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/30">
          <div className={cn("w-1 h-6 rounded-full", currentStep.accent)} />
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              {currentStep.label}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200 ease-out",
            animating && direction === "forward" && "opacity-0 translate-x-3",
            animating && direction === "back" && "opacity-0 -translate-x-3",
            !animating && "opacity-100 translate-x-0",
          )}
        >
          {/* ── STEP 0: Basic Info ── */}
          {step === 0 && (
            <>
              <Field
                label="Property Title"
                error={errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  placeholder="e.g. Modern Villa at Baneshwor"
                  className="h-10 rounded-xl text-sm"
                  {...register("title")}
                />
              </Field>
              <Field label="Price (NPR)" error={errors.price?.message}>
                <Input
                  type="number"
                  placeholder="e.g. 12500000"
                  className="h-10 rounded-xl text-sm"
                  {...register("price", { valueAsNumber: true })}
                />
              </Field>
              <Field label="Location" error={errors.location?.message}>
                <Select
                  onValueChange={(v) => setValue("location", v)}
                  // defaultValue={initialData?.location}
                  value={locationValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Kathmandu", "Lalitpur", "Bhaktapur"].map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Property Type" error={errors.category?.message}>
                <Select
                  onValueChange={(v) => setValue("category", v)}
                  value={categoryValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["House", "Apartment", "Land", "Colony"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" error={errors.status?.message}>
                <Select
                  onValueChange={(v) => setValue("status", v as PropertyStatus)}
                  value={statusValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["available"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  placeholder="Describe the property..."
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                  {...register("description")}
                />
              </Field>
            </>
          )}

          {/* ── STEP 1: Property Details ── */}
          {step === 1 && (
            <>
              <Field label="Area (e.g. 5 Aana)" error={errors.area?.message}>
                <Input
                  placeholder="e.g. 5 Aana"
                  className="h-10 rounded-xl text-sm"
                  {...register("area")}
                />
              </Field>
              <Field label="Property Face" error={errors.face?.message}>
                <Select
                  onValueChange={(v) => setValue("face", v)}
                  value={faceValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select facing" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "North",
                      "South",
                      "East",
                      "West",
                      "North-East",
                      "North-West",
                      "South-East",
                      "South-West",
                    ].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Road Type" error={errors.roadType?.message}>
                <Select
                  onValueChange={(v) => setValue("roadType", v)}
                  value={roadTypeValue}
                >
                  <SelectTrigger className="h-10 rounded-xl text-sm w-full">
                    <SelectValue placeholder="Select road type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Blacktopped", "Graveled", "Dirt", "Goreto"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Road Access">
                <Input
                  placeholder="e.g. 13 Feet"
                  className="h-10 rounded-xl text-sm"
                  {...register("roadAccess")}
                />
              </Field>
              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Negotiable
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Is the price open to negotiation?
                  </p>
                </div>
                <Switch
                  checked={negotiable}
                  onCheckedChange={(v) => setValue("negotiable", v)}
                />
              </div>
            </>
          )}

          {/* ── STEP 2: Location Details ── */}
          {step === 2 && (
            <>
              <Field label="Municipality">
                <Input
                  placeholder="e.g. Suryabinayak"
                  className="h-10 rounded-xl text-sm"
                  {...register("municipality")}
                />
              </Field>
              <Field label="Ward No.">
                <Input
                  placeholder="e.g. 05"
                  className="h-10 rounded-xl text-sm"
                  {...register("wardNo")}
                />
              </Field>
              <Field label="Distance from Ring Road" className="sm:col-span-2">
                <Input
                  placeholder="e.g. 4km"
                  className="h-10 rounded-xl text-sm"
                  {...register("ringRoad")}
                />
              </Field>
            </>
          )}

          {/* ── STEP 3: Nearby Facilities ── */}
          {step === 3 &&
            (
              [
                { field: "nearHospital", label: "Hospital" },
                { field: "nearAirport", label: "Airport" },
                { field: "nearSupermarket", label: "Supermarket" },
                { field: "nearSchool", label: "School" },
                { field: "nearGym", label: "Gym" },
                { field: "nearTransport", label: "Public Transport" },
                { field: "nearAtm", label: "ATM" },
                { field: "nearRestaurant", label: "Restaurant" },
              ] as const
            ).map(({ field, label }) => (
              <Field key={field} label={label}>
                <Input
                  placeholder="e.g. 500m or 2km"
                  className="h-10 rounded-xl text-sm"
                  {...register(field)}
                />
              </Field>
            ))}

          {/* ── STEP 4: Images ── */}
          {step === 4 && (
            <div className="sm:col-span-2">
              {loadingExisting ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {/* Existing saved images */}
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden border border-border/50"
                      >
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="h-32 w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          Saved
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          disabled={uploading}
                          className="absolute top-2 right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {/* New image previews */}
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-xl overflow-hidden border border-border/50"
                      >
                        <img
                          src={img.url}
                          alt="preview"
                          className="h-32 w-full object-cover"
                        />

                        {/* Uploading: progress 1–99 */}
                        {typeof img.uploadProgress === "number" &&
                          img.uploadProgress > 0 &&
                          img.uploadProgress < 100 && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 px-3">
                              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${img.uploadProgress}%` }}
                                />
                              </div>
                              <span className="text-white text-[10px] font-bold">
                                {img.uploadProgress}%
                              </span>
                            </div>
                          )}

                        {/* Failed */}
                        {img.uploadProgress === -1 && (
                          <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center rounded-xl">
                            <span className="text-white text-[10px] font-bold">
                              Upload Failed
                            </span>
                          </div>
                        )}

                        {/* Success */}
                        {img.uploadProgress === 100 && (
                          <div className="absolute top-2 left-2">
                            <CheckCircle2
                              size={18}
                              className="text-green-400 drop-shadow"
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          disabled={uploading}
                          className="absolute top-2 right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Add image button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Plus size={16} className="text-muted-foreground" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        Add Image
                      </span>
                    </button>
                  </div>

                  {(existingImages.length > 0 || images.length > 0) && (
                    <p className="text-[11px] text-muted-foreground mt-3 font-semibold">
                      {existingImages.length} saved &bull; {images.length} new
                      {deletedFileIds.length > 0 &&
                        ` • ${deletedFileIds.length} queued for deletion`}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={animating}
            className="h-11 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest"
          >
            <ChevronLeft size={15} className="mr-1" /> Back
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={animating}
            className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest"
          >
            Next <ChevronRight size={15} className="ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || uploading || animating}
            className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg"
          >
            {uploading
              ? "Uploading images..."
              : isSubmitting
                ? "Saving..."
                : buttonText}
          </Button>
        )}
      </div>
    </form>
  );
}
