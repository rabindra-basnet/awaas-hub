// "use client";

// import { useState, useRef } from "react";
// import { useForm } from "react-hook-form";
// import {
//   useAds,
//   useCreateAd,
//   useUpdateAd,
//   useDeleteAd,
//   type CreateAdInput,
// } from "@/lib/client/queries/ads.queries";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import {
//   Trash2,
//   Plus,
//   MousePointerClick,
//   Eye,
//   ChevronDown,
//   ChevronUp,
//   ImageIcon,
//   Code2,
//   CalendarRange,
//   Megaphone,
//   Upload,
//   Link2,
//   X,
//   Loader2,
// } from "lucide-react";
// import Loading from "@/components/loading";

// // ─── Constants ────────────────────────────────────────────────────────────────

// const SLOTS = [
//   {
//     value: "properties-top",
//     label: "Properties — Top Banner",
//     description: "Wide banner above the property grid",
//   },
//   {
//     value: "properties-inline",
//     label: "Properties — Inline Grid",
//     description: "Injected every 6 property cards",
//   },
//   {
//     value: "interstitial",
//     label: "Interstitial (Popup)",
//     description: "Full-screen popup shown on page load",
//   },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function slotLabel(slot: string) {
//   return SLOTS.find((s) => s.value === slot)?.label ?? slot;
// }

// function ctr(impressions: number, clicks: number) {
//   if (!impressions) return "0%";
//   return ((clicks / impressions) * 100).toFixed(1) + "%";
// }

// function formatDate(d?: string) {
//   if (!d) return null;
//   return new Date(d).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// // ─── Image Upload Hook ────────────────────────────────────────────────────────

// function useImageUpload() {
//   const [uploading, setUploading] = useState(false);
//   const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
//   const [uploadedKey, setUploadedKey] = useState<string | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const upload = async (file: File) => {
//     setError(null);
//     setUploading(true);

//     try {
//       // 1. Get presigned URL from our API
//       const presignRes = await fetch("/api/ads", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           filename: file.name,
//           contentType: file.type,
//         }),
//       });

//       if (!presignRes.ok) throw new Error("Failed to get upload URL");

//       const { uploadUrl, previewUrl, key } = await presignRes.json();

//       // 2. Upload directly to R2
//       const uploadRes = await fetch(uploadUrl, {
//         method: "PUT",
//         headers: { "Content-Type": file.type },
//         body: file,
//       });

//       if (!uploadRes.ok) throw new Error("Upload to storage failed");

//       // previewUrl is a signed download URL — valid immediately after upload
//       setUploadedUrl(previewUrl);
//       setUploadedKey(key);
//       setPreview(previewUrl);
//     } catch (err: any) {
//       setError(err.message ?? "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const reset = () => {
//     setUploadedUrl(null);
//     setUploadedKey(null);
//     setPreview(null);
//     setError(null);
//   };

//   return { upload, uploading, uploadedUrl, uploadedKey, preview, error, reset };
// }

// // ─── Form Types ───────────────────────────────────────────────────────────────

// type FormValues = {
//   title: string;
//   slot: string;
//   targetUrl: string;
//   imageUrl: string; // used when imageSource === "url"
//   altText: string;
//   htmlContent: string;
//   startDate: string;
//   endDate: string;
//   isActive: boolean;
//   contentType: "image" | "html";
//   imageSource: "url" | "upload"; // ← new: controls which image input shows
// };

// // ─── Image Input Section ──────────────────────────────────────────────────────

// function ImageInputSection({
//   imageSource,
//   onSourceChange,
//   register,
//   errors,
//   imageUpload,
// }: {
//   imageSource: "url" | "upload";
//   onSourceChange: (v: "url" | "upload") => void;
//   register: any;
//   errors: any;
//   imageUpload: ReturnType<typeof useImageUpload>;
// }) {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate type
//     if (!file.type.startsWith("image/")) {
//       return;
//     }
//     // Validate size (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       return;
//     }

//     imageUpload.upload(file);
//   };

//   return (
//     <div className="space-y-3">
//       {/* Toggle */}
//       <div className="flex gap-2">
//         <button
//           type="button"
//           onClick={() => {
//             onSourceChange("url");
//             imageUpload.reset();
//           }}
//           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
//             imageSource === "url"
//               ? "bg-primary text-primary-foreground border-primary"
//               : "bg-background border-border hover:bg-muted"
//           }`}
//         >
//           <Link2 size={12} />
//           Image URL
//         </button>
//         <button
//           type="button"
//           onClick={() => {
//             onSourceChange("upload");
//           }}
//           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
//             imageSource === "upload"
//               ? "bg-primary text-primary-foreground border-primary"
//               : "bg-background border-border hover:bg-muted"
//           }`}
//         >
//           <Upload size={12} />
//           Upload Image
//         </button>
//       </div>

//       {imageSource === "url" ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-1.5">
//             <Label className="text-xs text-muted-foreground">
//               Image URL <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               placeholder="https://cdn.example.com/banner.jpg"
//               {...register("imageUrl", {
//                 validate: (v: string) =>
//                   imageSource !== "url" ||
//                   !!v?.trim() ||
//                   "Image URL is required",
//               })}
//               className={errors.imageUrl ? "border-destructive" : ""}
//             />
//             {errors.imageUrl && (
//               <p className="text-xs text-destructive">
//                 {errors.imageUrl.message}
//               </p>
//             )}
//           </div>
//           <div className="space-y-1.5">
//             <Label className="text-xs text-muted-foreground">Alt Text</Label>
//             <Input
//               placeholder="Describe the image for accessibility"
//               {...register("altText")}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {/* Upload zone */}
//           {!imageUpload.preview ? (
//             <div
//               onClick={() => fileInputRef.current?.click()}
//               className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
//             >
//               {imageUpload.uploading ? (
//                 <>
//                   <Loader2
//                     size={24}
//                     className="text-muted-foreground animate-spin"
//                   />
//                   <p className="text-xs text-muted-foreground">Uploading…</p>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
//                     <Upload
//                       size={18}
//                       className="text-muted-foreground group-hover:text-primary"
//                     />
//                   </div>
//                   <div className="text-center">
//                     <p className="text-xs font-semibold">Click to upload</p>
//                     <p className="text-[10px] text-muted-foreground mt-0.5">
//                       PNG, JPG, WEBP up to 5MB
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           ) : (
//             <div className="relative rounded-xl overflow-hidden border">
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={imageUpload.preview}
//                 alt="Preview"
//                 className="w-full h-36 object-cover"
//               />
//               <button
//                 type="button"
//                 onClick={() => {
//                   imageUpload.reset();
//                   if (fileInputRef.current) fileInputRef.current.value = "";
//                 }}
//                 className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
//               >
//                 <X size={12} />
//               </button>
//               <div className="absolute bottom-0 inset-x-0 bg-black/50 px-3 py-1.5">
//                 <p className="text-[10px] text-white/80 truncate">
//                   ✓ Uploaded to storage
//                 </p>
//               </div>
//             </div>
//           )}

//           {imageUpload.error && (
//             <p className="text-xs text-destructive">{imageUpload.error}</p>
//           )}

//           {/* Alt text always available */}
//           <div className="space-y-1.5">
//             <Label className="text-xs text-muted-foreground">Alt Text</Label>
//             <Input
//               placeholder="Describe the image for accessibility"
//               {...register("altText")}
//             />
//           </div>

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             className="hidden"
//             onChange={handleFileChange}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Create Ad Dialog ─────────────────────────────────────────────────────────

// function CreateAdDialog({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) {
//   const createAd = useCreateAd();
//   const imageUpload = useImageUpload();

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<FormValues>({
//     defaultValues: {
//       title: "",
//       slot: "properties-top",
//       targetUrl: "",
//       imageUrl: "",
//       altText: "",
//       htmlContent: "",
//       startDate: "",
//       endDate: "",
//       isActive: true,
//       contentType: "image",
//       imageSource: "url",
//     },
//   });

//   const contentType = watch("contentType");
//   const imageSource = watch("imageSource");
//   const isActive = watch("isActive");
//   const slot = watch("slot");

//   const handleClose = () => {
//     reset();
//     imageUpload.reset();
//     onClose();
//   };

//   const onSubmit = async (data: FormValues) => {
//     // Determine final image data
//     let finalImageUrl = "";
//     let finalImageKey = "";

//     if (data.contentType === "image") {
//       if (data.imageSource === "upload") {
//         if (!imageUpload.uploadedUrl) {
//           // No image uploaded yet — prevent submit
//           return;
//         }
//         finalImageUrl = imageUpload.uploadedUrl;
//         finalImageKey = imageUpload.uploadedKey ?? "";
//       } else {
//         finalImageUrl = data.imageUrl;
//       }
//     }

//     await createAd.mutateAsync({
//       title: data.title,
//       slot: data.slot,
//       targetUrl: data.targetUrl,
//       imageUrl: finalImageUrl,
//       imageKey: finalImageKey, // stored in DB to enable signed URL refresh + R2 deletion
//       altText: data.altText,
//       htmlContent: data.contentType === "html" ? data.htmlContent : "",
//       startDate: data.startDate || null,
//       endDate: data.endDate || null,
//       isActive: data.isActive,
//     } as CreateAdInput);

//     handleClose();
//   };

//   const uploadPending =
//     contentType === "image" &&
//     imageSource === "upload" &&
//     imageUpload.uploading;
//   const canSubmit = !createAd.isPending && !uploadPending;

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
//       <DialogContent className="w-full max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Megaphone size={16} className="text-primary" />
//             Create New Ad
//           </DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
//           {/* Title + Slot */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <Label className="text-xs font-semibold">
//                 Title <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 placeholder="e.g. Summer Campaign Banner"
//                 {...register("title", { required: "Title is required" })}
//                 className={errors.title ? "border-destructive" : ""}
//               />
//               {errors.title && (
//                 <p className="text-xs text-destructive">
//                   {errors.title.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-1.5">
//               <Label className="text-xs font-semibold">
//                 Ad Slot <span className="text-destructive">*</span>
//               </Label>
//               <Select
//                 value={slot}
//                 onValueChange={(v) =>
//                   setValue("slot", v, { shouldValidate: true })
//                 }
//               >
//                 <SelectTrigger
//                   className={errors.slot ? "border-destructive" : ""}
//                 >
//                   <SelectValue placeholder="Where to show?" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {SLOTS.map((s) => (
//                     <SelectItem key={s.value} value={s.value}>
//                       <div>
//                         <p className="font-medium text-sm">{s.label}</p>
//                         <p className="text-xs text-muted-foreground">
//                           {s.description}
//                         </p>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <input type="hidden" {...register("slot", { required: true })} />
//               {errors.slot && (
//                 <p className="text-xs text-destructive">Slot is required</p>
//               )}
//             </div>
//           </div>

//           {/* Target URL */}
//           <div className="space-y-1.5">
//             <Label className="text-xs font-semibold">
//               Target URL <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               placeholder="https://advertiser.com/landing-page"
//               {...register("targetUrl", {
//                 required: "Target URL is required",
//                 pattern: {
//                   value: /^https?:\/\/.+/,
//                   message: "Must be a valid URL starting with http(s)://",
//                 },
//               })}
//               className={errors.targetUrl ? "border-destructive" : ""}
//             />
//             {errors.targetUrl && (
//               <p className="text-xs text-destructive">
//                 {errors.targetUrl.message}
//               </p>
//             )}
//           </div>

//           {/* Content type: Image vs HTML */}
//           <div className="space-y-3">
//             <Label className="text-xs font-semibold">Ad Content</Label>
//             <div className="flex gap-2">
//               <button
//                 type="button"
//                 onClick={() => setValue("contentType", "image")}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
//                   contentType === "image"
//                     ? "bg-primary text-primary-foreground border-primary"
//                     : "bg-background border-border hover:bg-muted"
//                 }`}
//               >
//                 <ImageIcon size={14} />
//                 Image
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setValue("contentType", "html")}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
//                   contentType === "html"
//                     ? "bg-primary text-primary-foreground border-primary"
//                     : "bg-background border-border hover:bg-muted"
//                 }`}
//               >
//                 <Code2 size={14} />
//                 HTML Embed
//               </button>
//             </div>

//             {contentType === "image" ? (
//               <ImageInputSection
//                 imageSource={imageSource}
//                 onSourceChange={(v) => setValue("imageSource", v)}
//                 register={register}
//                 errors={errors}
//                 imageUpload={imageUpload}
//               />
//             ) : (
//               <div className="space-y-1.5">
//                 <Label className="text-xs text-muted-foreground">
//                   HTML Content <span className="text-destructive">*</span>
//                 </Label>
//                 <textarea
//                   placeholder={'<div style="...">Your ad HTML here</div>'}
//                   rows={5}
//                   {...register("htmlContent", {
//                     validate: (v: string) =>
//                       contentType !== "html" ||
//                       !!v?.trim() ||
//                       "HTML content is required",
//                   })}
//                   className={`w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
//                     errors.htmlContent ? "border-destructive" : "border-input"
//                   }`}
//                 />
//                 {errors.htmlContent && (
//                   <p className="text-xs text-destructive">
//                     {errors.htmlContent.message}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Upload pending warning */}
//           {contentType === "image" &&
//             imageSource === "upload" &&
//             !imageUpload.uploadedUrl &&
//             !imageUpload.uploading && (
//               <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
//                 Please upload an image before saving.
//               </p>
//             )}

//           {/* Scheduling */}
//           <div className="space-y-3">
//             <Label className="text-xs font-semibold flex items-center gap-1.5">
//               <CalendarRange size={13} />
//               Schedule (optional)
//             </Label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-1.5">
//                 <Label className="text-xs text-muted-foreground">
//                   Start Date
//                 </Label>
//                 <Input type="datetime-local" {...register("startDate")} />
//               </div>
//               <div className="space-y-1.5">
//                 <Label className="text-xs text-muted-foreground">
//                   End Date
//                 </Label>
//                 <Input
//                   type="datetime-local"
//                   {...register("endDate", {
//                     validate: (v: string, formValues: FormValues) => {
//                       if (!v || !formValues.startDate) return true;
//                       return (
//                         new Date(v) > new Date(formValues.startDate) ||
//                         "End date must be after start date"
//                       );
//                     },
//                   })}
//                   className={errors.endDate ? "border-destructive" : ""}
//                 />
//                 {errors.endDate && (
//                   <p className="text-xs text-destructive">
//                     {errors.endDate.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Leave blank to show the ad indefinitely.
//             </p>
//           </div>

//           {/* Active toggle */}
//           <div className="flex items-center gap-3">
//             <Switch
//               checked={isActive}
//               onCheckedChange={(v) => setValue("isActive", v)}
//             />
//             <div>
//               <p className="text-sm font-medium">
//                 {isActive ? "Active immediately" : "Save as inactive"}
//               </p>
//               <p className="text-xs text-muted-foreground">
//                 {isActive
//                   ? "Ad will be served as soon as it's created"
//                   : "Ad won't be served until you activate it"}
//               </p>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex gap-3 pt-2 border-t">
//             <Button type="submit" disabled={!canSubmit} className="min-w-32">
//               {createAd.isPending ? (
//                 <>
//                   <Loader2 size={14} className="mr-2 animate-spin" /> Creating…
//                 </>
//               ) : uploadPending ? (
//                 <>
//                   <Loader2 size={14} className="mr-2 animate-spin" /> Uploading…
//                 </>
//               ) : (
//                 "Create Ad"
//               )}
//             </Button>
//             <Button type="button" variant="outline" onClick={handleClose}>
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Ad Row ───────────────────────────────────────────────────────────────────

// function AdRow({ ad }: { ad: any }) {
//   const updateAd = useUpdateAd();
//   const deleteAd = useDeleteAd();
//   const [expanded, setExpanded] = useState(false);

//   const isExpired = ad.endDate && new Date(ad.endDate) < new Date();
//   const isScheduled = ad.startDate && new Date(ad.startDate) > new Date();

//   return (
//     <div className="border rounded-xl overflow-hidden bg-background transition-shadow hover:shadow-sm">
//       <div className="flex items-center gap-4 px-4 py-3">
//         {/* Thumbnail */}
//         <div className="shrink-0">
//           {ad.imageUrl ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={ad.imageUrl}
//               alt={ad.altText ?? ""}
//               className="w-20 h-12 object-cover rounded-lg border"
//             />
//           ) : (
//             <div className="w-20 h-12 rounded-lg border bg-muted/60 flex flex-col items-center justify-center gap-0.5">
//               <Code2 size={14} className="text-muted-foreground" />
//               <span className="text-[9px] text-muted-foreground font-medium">
//                 HTML
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Info */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 flex-wrap">
//             <p className="font-semibold text-sm truncate">{ad.title}</p>
//             {isExpired && (
//               <Badge variant="destructive" className="text-[10px] h-4">
//                 Expired
//               </Badge>
//             )}
//             {isScheduled && (
//               <Badge variant="secondary" className="text-[10px] h-4">
//                 Scheduled
//               </Badge>
//             )}
//             {ad.imageKey && (
//               <Badge variant="outline" className="text-[10px] h-4 gap-1">
//                 <Upload size={8} /> R2
//               </Badge>
//             )}
//           </div>
//           <div className="flex items-center gap-2 mt-1 flex-wrap">
//             <Badge variant="outline" className="text-[10px] h-5">
//               {slotLabel(ad.slot)}
//             </Badge>
//             {ad.startDate && (
//               <span className="text-[10px] text-muted-foreground">
//                 {formatDate(ad.startDate)} →{" "}
//                 {ad.endDate ? formatDate(ad.endDate) : "∞"}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
//           <div className="text-center">
//             <p className="font-bold text-foreground text-sm">
//               {ad.impressions.toLocaleString()}
//             </p>
//             <p className="flex items-center gap-0.5">
//               <Eye size={10} /> Views
//             </p>
//           </div>
//           <div className="text-center">
//             <p className="font-bold text-foreground text-sm">
//               {ad.clicks.toLocaleString()}
//             </p>
//             <p className="flex items-center gap-0.5">
//               <MousePointerClick size={10} /> Clicks
//             </p>
//           </div>
//           <div className="text-center">
//             <p className="font-bold text-primary text-sm">
//               {ctr(ad.impressions, ad.clicks)}
//             </p>
//             <p>CTR</p>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="flex items-center gap-2 shrink-0">
//           <Switch
//             checked={ad.isActive}
//             onCheckedChange={(v) =>
//               updateAd.mutate({ id: ad._id, isActive: v })
//             }
//           />

//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
//               >
//                 <Trash2 size={14} />
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   "{ad.title}" will be permanently deleted
//                   {ad.imageKey
//                     ? " and its uploaded image will be removed from storage"
//                     : ""}
//                   . This cannot be undone.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={() => deleteAd.mutate(ad._id)}
//                   className="bg-destructive hover:bg-destructive/90"
//                 >
//                   Delete
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>

//           <button
//             onClick={() => setExpanded((v) => !v)}
//             className="p-1 rounded hover:bg-muted transition-colors"
//           >
//             {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//           </button>
//         </div>
//       </div>

//       {/* Expanded details */}
//       {expanded && (
//         <div className="border-t px-4 py-3 bg-muted/20 space-y-2 text-xs text-muted-foreground">
//           <p>
//             <span className="font-semibold text-foreground">Target URL: </span>
//             <a
//               href={ad.targetUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-primary hover:underline break-all"
//             >
//               {ad.targetUrl}
//             </a>
//           </p>
//           {ad.imageUrl && (
//             <p>
//               <span className="font-semibold text-foreground">
//                 {ad.imageKey ? "Storage URL (signed): " : "Image URL: "}
//               </span>
//               <span className="break-all">{ad.imageUrl.slice(0, 80)}…</span>
//             </p>
//           )}
//           {ad.imageKey && (
//             <p>
//               <span className="font-semibold text-foreground">R2 Key: </span>
//               <code className="bg-muted px-1 rounded">{ad.imageKey}</code>
//             </p>
//           )}
//           {ad.htmlContent && (
//             <p>
//               <span className="font-semibold text-foreground">HTML: </span>
//               <code className="bg-muted px-1 rounded text-[10px]">
//                 {ad.htmlContent.slice(0, 100)}
//                 {ad.htmlContent.length > 100 ? "…" : ""}
//               </code>
//             </p>
//           )}
//           <p>
//             <span className="font-semibold text-foreground">Created: </span>
//             {new Date(ad.createdAt).toLocaleString()}
//           </p>
//           <div className="flex sm:hidden items-center gap-4 pt-1">
//             <span>
//               <Eye size={10} className="inline mr-1" />
//               {ad.impressions.toLocaleString()} views
//             </span>
//             <span>
//               <MousePointerClick size={10} className="inline mr-1" />
//               {ad.clicks.toLocaleString()} clicks
//             </span>
//             <span className="text-primary font-bold">
//               CTR: {ctr(ad.impressions, ad.clicks)}
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function AdsAdminPage() {
//   const { data: ads = [], isLoading } = useAds();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [slotFilter, setSlotFilter] = useState("all");

//   const safeAds = Array.isArray(ads) ? ads : [];
//   const filtered =
//     slotFilter === "all"
//       ? safeAds
//       : safeAds.filter((a: any) => a.slot === slotFilter);

//   const activeCount = safeAds.filter((a: any) => a.isActive).length;
//   const totalImpressions = safeAds.reduce(
//     (sum: number, a: any) => sum + (a.impressions ?? 0),
//     0,
//   );
//   const totalClicks = safeAds.reduce(
//     (sum: number, a: any) => sum + (a.clicks ?? 0),
//     0,
//   );

//   if (isLoading) return <Loading />;

//   return (
//     <div className="w-full max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-6 min-h-screen">
//       <CreateAdDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Ad Manager</h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             Create and manage ads shown across the platform
//           </p>
//         </div>
//         <Button onClick={() => setDialogOpen(true)}>
//           <Plus size={16} className="mr-2" />
//           New Ad
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//         {[
//           { label: "Total Ads", value: safeAds.length },
//           { label: "Active", value: activeCount },
//           {
//             label: "Total Impressions",
//             value: totalImpressions.toLocaleString(),
//           },
//           { label: "Total Clicks", value: totalClicks.toLocaleString() },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="rounded-xl border bg-background px-4 py-3"
//           >
//             <p className="text-xs text-muted-foreground">{s.label}</p>
//             <p className="text-xl font-bold mt-0.5">{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Slot filter */}
//       {safeAds.length > 0 && (
//         <div className="flex items-center gap-2 flex-wrap">
//           {["all", ...SLOTS.map((s) => s.value)].map((v) => (
//             <button
//               key={v}
//               onClick={() => setSlotFilter(v)}
//               className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
//                 slotFilter === v
//                   ? "bg-primary text-primary-foreground border-primary"
//                   : "bg-background border-border hover:bg-muted"
//               }`}
//             >
//               {v === "all" ? "All Slots" : slotLabel(v)}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Ad list */}
//       {filtered.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border rounded-2xl bg-muted/10">
//           <Megaphone size={40} className="mb-3 opacity-30" />
//           <p className="text-sm font-medium">No ads yet</p>
//           <p className="text-xs mt-1">
//             Click "New Ad" above to create your first advertisement
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {filtered.map((ad: any) => (
//             <AdRow key={ad._id} ad={ad} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useAds,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
  type CreateAdInput,
  type Ad,
} from "@/lib/client/queries/ads.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Plus,
  MousePointerClick,
  Eye,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Code2,
  CalendarRange,
  Megaphone,
  Upload,
  Link2,
  X,
  Loader2,
  Pencil,
} from "lucide-react";
import Loading from "@/components/loading";

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOTS = [
  {
    value: "properties-top",
    label: "Properties — Top Banner",
    description: "Wide banner above the property grid",
  },
  {
    value: "properties-inline",
    label: "Properties — Inline Grid",
    description: "Injected every 6 property cards",
  },
  {
    value: "interstitial",
    label: "Interstitial (Popup)",
    description: "Full-screen popup shown on page load",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slotLabel(slot: string) {
  return SLOTS.find((s) => s.value === slot)?.label ?? slot;
}

function ctr(impressions: number, clicks: number) {
  if (!impressions) return "0%";
  return ((clicks / impressions) * 100).toFixed(1) + "%";
}

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDatetimeLocal(d?: string) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

// ─── Image Upload Hook ────────────────────────────────────────────────────────

function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const presignRes = await fetch("/api/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, previewUrl, key } = await presignRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      setUploadedUrl(previewUrl);
      setUploadedKey(key);
      setPreview(previewUrl);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploadedUrl(null);
    setUploadedKey(null);
    setPreview(null);
    setError(null);
  };

  return { upload, uploading, uploadedUrl, uploadedKey, preview, error, reset };
}

// ─── Form Types ───────────────────────────────────────────────────────────────

type FormValues = {
  title: string;
  slot: string;
  targetUrl: string;
  imageUrl: string;
  altText: string;
  htmlContent: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  contentType: "image" | "html";
  imageSource: "url" | "upload";
};

// ─── Image Input ──────────────────────────────────────────────────────────────

function ImageInputSection({
  imageSource,
  onSourceChange,
  register,
  errors,
  imageUpload,
}: {
  imageSource: "url" | "upload";
  onSourceChange: (v: "url" | "upload") => void;
  register: any;
  errors: any;
  imageUpload: ReturnType<typeof useImageUpload>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    imageUpload.upload(file);
  };

  // ── Paste (Ctrl+V) support — works on both url and upload tabs ───────────
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            // Auto-switch to upload tab if on url tab
            if (imageSource !== "upload") onSourceChange("upload");
            imageUpload.upload(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [imageSource, imageUpload, onSourceChange]);

  // ── Drag & drop support ────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    imageUpload.upload(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onSourceChange("url");
            imageUpload.reset();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            imageSource === "url"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-muted"
          }`}
        >
          <Link2 size={12} /> Image URL
        </button>
        <button
          type="button"
          onClick={() => onSourceChange("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            imageSource === "upload"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-muted"
          }`}
        >
          <Upload size={12} /> Upload Image
        </button>
      </div>

      {imageSource === "url" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Image URL <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="https://cdn.example.com/banner.jpg"
              {...register("imageUrl", {
                validate: (v: string) =>
                  imageSource !== "url" ||
                  !!v?.trim() ||
                  "Image URL is required",
              })}
              className={errors.imageUrl ? "border-destructive" : ""}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">
                {errors.imageUrl.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Alt Text</Label>
            <Input placeholder="Describe the image" {...register("altText")} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {!imageUpload.preview ? (
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {imageUpload.uploading ? (
                <>
                  <Loader2
                    size={24}
                    className="text-muted-foreground animate-spin"
                  />
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                </>
              ) : isDragging ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Upload size={18} className="text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-primary">
                    Drop to upload
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Upload
                      size={18}
                      className="text-muted-foreground group-hover:text-primary"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold">Click to upload</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      or drag & drop, or{" "}
                      <kbd className="px-1 py-0.5 rounded bg-muted border text-[9px] font-mono">
                        Ctrl+V
                      </kbd>{" "}
                      to paste
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUpload.preview}
                alt="Preview"
                className="w-full h-36 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  imageUpload.reset();
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/50 px-3 py-1.5">
                <p className="text-[10px] text-white/80 truncate">
                  ✓ Uploaded to storage
                </p>
              </div>
            </div>
          )}
          {imageUpload.error && (
            <p className="text-xs text-destructive">{imageUpload.error}</p>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Alt Text</Label>
            <Input placeholder="Describe the image" {...register("altText")} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}

// ─── Ad Form (shared between Create + Edit) ───────────────────────────────────

function AdForm({
  defaultValues,
  onSubmit,
  isPending,
  onClose,
  submitLabel,
}: {
  defaultValues: Partial<FormValues>;
  onSubmit: (
    data: FormValues,
    imageUpload: ReturnType<typeof useImageUpload>,
  ) => Promise<void>;
  isPending: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  const imageUpload = useImageUpload();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      slot: "properties-top",
      targetUrl: "",
      imageUrl: "",
      altText: "",
      htmlContent: "",
      startDate: "",
      endDate: "",
      isActive: true,
      contentType: "image",
      imageSource: "url",
      ...defaultValues,
    },
  });

  const contentType = watch("contentType");
  const imageSource = watch("imageSource");
  const isActive = watch("isActive");
  const slot = watch("slot");

  const uploadPending =
    contentType === "image" &&
    imageSource === "upload" &&
    imageUpload.uploading;

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, imageUpload))}
      className="space-y-5 pt-1"
    >
      {/* Title + Slot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. Summer Campaign Banner"
            {...register("title", { required: "Title is required" })}
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Ad Slot <span className="text-destructive">*</span>
          </Label>
          <Select
            value={slot}
            onValueChange={(v) => setValue("slot", v, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.slot ? "border-destructive" : ""}>
              <SelectValue placeholder="Where to show?" />
            </SelectTrigger>
            <SelectContent>
              {SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div>
                    <p className="font-medium text-sm">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("slot", { required: true })} />
          {errors.slot && (
            <p className="text-xs text-destructive">Slot is required</p>
          )}
        </div>
      </div>

      {/* Target URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Target URL <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="https://advertiser.com/landing-page"
          {...register("targetUrl", {
            required: "Target URL is required",
            pattern: {
              value: /^https?:\/\/.+/,
              message: "Must start with http(s)://",
            },
          })}
          className={errors.targetUrl ? "border-destructive" : ""}
        />
        {errors.targetUrl && (
          <p className="text-xs text-destructive">{errors.targetUrl.message}</p>
        )}
      </div>

      {/* Content type */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold">Ad Content</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setValue("contentType", "image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              contentType === "image"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            <ImageIcon size={14} /> Image
          </button>
          <button
            type="button"
            onClick={() => setValue("contentType", "html")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              contentType === "html"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            <Code2 size={14} /> HTML Embed
          </button>
        </div>

        {contentType === "image" ? (
          <ImageInputSection
            imageSource={imageSource}
            onSourceChange={(v) => setValue("imageSource", v)}
            register={register}
            errors={errors}
            imageUpload={imageUpload}
          />
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              HTML Content <span className="text-destructive">*</span>
            </Label>
            <textarea
              placeholder={'<div style="...">Your ad HTML here</div>'}
              rows={5}
              {...register("htmlContent", {
                validate: (v: string) =>
                  contentType !== "html" ||
                  !!v?.trim() ||
                  "HTML content is required",
              })}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                errors.htmlContent ? "border-destructive" : "border-input"
              }`}
            />
            {errors.htmlContent && (
              <p className="text-xs text-destructive">
                {errors.htmlContent.message}
              </p>
            )}
          </div>
        )}
      </div>

      {contentType === "image" &&
        imageSource === "upload" &&
        !imageUpload.uploadedUrl &&
        !imageUpload.uploading && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Please upload an image before saving.
          </p>
        )}

      {/* Schedule */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <CalendarRange size={13} /> Schedule (optional)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Input type="datetime-local" {...register("startDate")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">End Date</Label>
            <Input
              type="datetime-local"
              {...register("endDate", {
                validate: (v: string, fv: FormValues) => {
                  if (!v || !fv.startDate) return true;
                  return (
                    new Date(v) > new Date(fv.startDate) ||
                    "End must be after start"
                  );
                },
              })}
              className={errors.endDate ? "border-destructive" : ""}
            />
            {errors.endDate && (
              <p className="text-xs text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Leave blank to show indefinitely.
        </p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={(v) => setValue("isActive", v)}
        />
        <div>
          <p className="text-sm font-medium">
            {isActive ? "Active" : "Inactive"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isActive
              ? "Ad will be served immediately"
              : "Ad won't be served until activated"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 pt-2 border-t">
        <Button
          type="submit"
          disabled={isPending || uploadPending}
          className="min-w-32"
        >
          {isPending || uploadPending ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              {uploadPending ? "Uploading…" : "Saving…"}
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Create Dialog ────────────────────────────────────────────────────────────

function CreateAdDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createAd = useCreateAd();

  const handleSubmit = async (
    data: FormValues,
    imageUpload: ReturnType<typeof useImageUpload>,
  ) => {
    let finalImageUrl = "";
    let finalImageKey = "";

    if (data.contentType === "image") {
      if (data.imageSource === "upload") {
        if (!imageUpload.uploadedUrl) return;
        finalImageUrl = imageUpload.uploadedUrl;
        finalImageKey = imageUpload.uploadedKey ?? "";
      } else {
        finalImageUrl = data.imageUrl;
      }
    }

    await createAd.mutateAsync({
      title: data.title,
      slot: data.slot,
      targetUrl: data.targetUrl,
      imageUrl: finalImageUrl,
      imageKey: finalImageKey,
      altText: data.altText,
      htmlContent: data.contentType === "html" ? data.htmlContent : "",
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      isActive: data.isActive,
    } as CreateAdInput);

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone size={16} className="text-primary" /> Create New Ad
          </DialogTitle>
        </DialogHeader>
        <AdForm
          defaultValues={{}}
          onSubmit={handleSubmit}
          isPending={createAd.isPending}
          onClose={onClose}
          submitLabel="Create Ad"
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

function EditAdDialog({
  ad,
  open,
  onClose,
}: {
  ad: Ad;
  open: boolean;
  onClose: () => void;
}) {
  const updateAd = useUpdateAd();

  const handleSubmit = async (
    data: FormValues,
    imageUpload: ReturnType<typeof useImageUpload>,
  ) => {
    let finalImageUrl = data.imageUrl;
    let finalImageKey: string | undefined = undefined;

    if (
      data.contentType === "image" &&
      data.imageSource === "upload" &&
      imageUpload.uploadedUrl
    ) {
      finalImageUrl = imageUpload.uploadedUrl;
      finalImageKey = imageUpload.uploadedKey ?? undefined;
    }

    await updateAd.mutateAsync({
      id: ad._id,
      title: data.title,
      slot: data.slot,
      targetUrl: data.targetUrl,
      imageUrl: data.contentType === "image" ? finalImageUrl : "",
      ...(finalImageKey ? { imageKey: finalImageKey } : {}),
      altText: data.altText,
      htmlContent: data.contentType === "html" ? data.htmlContent : "",
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      isActive: data.isActive,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={16} className="text-primary" /> Edit Ad
          </DialogTitle>
        </DialogHeader>
        <AdForm
          defaultValues={{
            title: ad.title,
            slot: ad.slot,
            targetUrl: ad.targetUrl,
            imageUrl: ad.imageUrl ?? "",
            altText: ad.altText ?? "",
            htmlContent: ad.htmlContent ?? "",
            startDate: toDatetimeLocal(ad.startDate),
            endDate: toDatetimeLocal(ad.endDate),
            isActive: ad.isActive,
            contentType: ad.htmlContent ? "html" : "image",
            imageSource: "url",
          }}
          onSubmit={handleSubmit}
          isPending={updateAd.isPending}
          onClose={onClose}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Ad Row ───────────────────────────────────────────────────────────────────

function AdRow({ ad }: { ad: Ad }) {
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isExpired = ad.endDate && new Date(ad.endDate) < new Date();
  const isScheduled = ad.startDate && new Date(ad.startDate) > new Date();

  return (
    <>
      <EditAdDialog
        ad={ad}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <div className="border rounded-xl overflow-hidden bg-background transition-shadow hover:shadow-sm">
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Thumbnail */}
          <div className="shrink-0">
            {ad.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ad.imageUrl}
                alt={ad.altText ?? ""}
                className="w-20 h-12 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-20 h-12 rounded-lg border bg-muted/60 flex flex-col items-center justify-center gap-0.5">
                <Code2 size={14} className="text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground font-medium">
                  HTML
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{ad.title}</p>
              {isExpired && (
                <Badge variant="destructive" className="text-[10px] h-4">
                  Expired
                </Badge>
              )}
              {isScheduled && (
                <Badge variant="secondary" className="text-[10px] h-4">
                  Scheduled
                </Badge>
              )}
              {(ad as any).imageKey && (
                <Badge variant="outline" className="text-[10px] h-4 gap-1">
                  <Upload size={8} /> R2
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] h-5">
                {slotLabel(ad.slot)}
              </Badge>
              {ad.startDate && (
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(ad.startDate)} →{" "}
                  {ad.endDate ? formatDate(ad.endDate) : "∞"}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <div className="text-center">
              <p className="font-bold text-foreground text-sm">
                {ad.impressions.toLocaleString()}
              </p>
              <p className="flex items-center gap-0.5">
                <Eye size={10} /> Views
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground text-sm">
                {ad.clicks.toLocaleString()}
              </p>
              <p className="flex items-center gap-0.5">
                <MousePointerClick size={10} /> Clicks
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-primary text-sm">
                {ctr(ad.impressions, ad.clicks)}
              </p>
              <p>CTR</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Active toggle */}
            <Switch
              checked={ad.isActive}
              onCheckedChange={(v) =>
                updateAd.mutate({ id: ad._id, isActive: v })
              }
            />

            {/* Edit */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
            >
              <Pencil size={14} className="text-muted-foreground" />
            </Button>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{ad.title}" will be permanently deleted
                    {(ad as any).imageKey
                      ? " and its uploaded image removed from storage"
                      : ""}
                    . This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAd.mutate(ad._id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Expand */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t px-4 py-3 bg-muted/20 space-y-2 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">
                Target URL:{" "}
              </span>
              <a
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {ad.targetUrl}
              </a>
            </p>
            {ad.imageUrl && (
              <p>
                <span className="font-semibold text-foreground">
                  {(ad as any).imageKey ? "Storage URL: " : "Image URL: "}
                </span>
                <span className="break-all">{ad.imageUrl.slice(0, 80)}…</span>
              </p>
            )}
            {ad.htmlContent && (
              <p>
                <span className="font-semibold text-foreground">HTML: </span>
                <code className="bg-muted px-1 rounded text-[10px]">
                  {ad.htmlContent.slice(0, 100)}
                  {ad.htmlContent.length > 100 ? "…" : ""}
                </code>
              </p>
            )}
            <p>
              <span className="font-semibold text-foreground">Created: </span>
              {new Date(ad.createdAt).toLocaleString()}
            </p>
            <div className="flex sm:hidden items-center gap-4 pt-1">
              <span>
                <Eye size={10} className="inline mr-1" />
                {ad.impressions.toLocaleString()} views
              </span>
              <span>
                <MousePointerClick size={10} className="inline mr-1" />
                {ad.clicks.toLocaleString()} clicks
              </span>
              <span className="text-primary font-bold">
                CTR: {ctr(ad.impressions, ad.clicks)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdsAdminPage() {
  const { data: ads = [], isLoading } = useAds();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotFilter, setSlotFilter] = useState("all");

  const safeAds = Array.isArray(ads) ? ads : [];
  const filtered =
    slotFilter === "all"
      ? safeAds
      : safeAds.filter((a) => a.slot === slotFilter);

  const activeCount = safeAds.filter((a) => a.isActive).length;
  const totalImpressions = safeAds.reduce(
    (sum, a) => sum + (a.impressions ?? 0),
    0,
  );
  const totalClicks = safeAds.reduce((sum, a) => sum + (a.clicks ?? 0), 0);

  if (isLoading) return <Loading />;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-6 min-h-screen">
      <CreateAdDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ad Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage ads shown across the platform
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-2" /> New Ad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Ads", value: safeAds.length },
          { label: "Active", value: activeCount },
          {
            label: "Total Impressions",
            value: totalImpressions.toLocaleString(),
          },
          { label: "Total Clicks", value: totalClicks.toLocaleString() },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-background px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Slot filter */}
      {safeAds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {["all", ...SLOTS.map((s) => s.value)].map((v) => (
            <button
              key={v}
              onClick={() => setSlotFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                slotFilter === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {v === "all" ? "All Slots" : slotLabel(v)}
            </button>
          ))}
        </div>
      )}

      {/* Ad list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border rounded-2xl bg-muted/10">
          <Megaphone size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">No ads yet</p>
          <p className="text-xs mt-1">
            Click "New Ad" above to create your first advertisement
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ad) => (
            <AdRow key={ad._id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}
