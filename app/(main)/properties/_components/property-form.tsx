// // components/PropertyForm.tsx
// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";

// const formSchema = z.object({
//     title: z.string().min(3, "Title must be at least 3 characters"),
//     price: z.number().positive("Price must be positive"),
//     location: z.string().min(2, "Location is required"),
//     description: z.string().optional(),
//     images: z.array(z.string()).optional(),
// });

// type PropertyFormValues = z.infer<typeof formSchema>;

// interface PropertyFormProps {
//     initialData?: Partial<PropertyFormValues>;
//     onSubmit: (values: PropertyFormValues) => void;
//     isSubmitting?: boolean;
//     buttonText?: string;
// }

// export default function PropertyForm({
//     initialData,
//     onSubmit,
//     isSubmitting = false,
//     buttonText = "Save",
// }: PropertyFormProps) {
//     const form = useForm<PropertyFormValues>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             title: initialData?.title || "",
//             price: initialData?.price || 0,
//             location: initialData?.location || "",
//             description: initialData?.description || "",
//             images: initialData?.images || [],
//         },
//     });

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = e.target.files;
//         if (!files) return;

//         const newImages: string[] = [];
//         Array.from(files).forEach((file) => {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (typeof reader.result === "string") {
//                     newImages.push(reader.result);
//                     form.setValue("images", [...(form.getValues("images") || []), reader.result]);
//                 }
//             };
//             reader.readAsDataURL(file);
//         });
//     };

//     return (
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <div>
//                 <Label>Title</Label>
//                 <Input {...form.register("title")} />
//                 {form.formState.errors.title && (
//                     <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
//                 )}
//             </div>

//             <div>
//                 <Label>Price (USD)</Label>
//                 <Input
//                     type="number"
//                     {...form.register("price", { valueAsNumber: true })}
//                 />
//                 {form.formState.errors.price && (
//                     <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
//                 )}
//             </div>

//             <div>
//                 <Label>Location</Label>
//                 <Input {...form.register("location")} />
//                 {form.formState.errors.location && (
//                     <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
//                 )}
//             </div>

//             <div>
//                 <Label>Description</Label>
//                 <Textarea {...form.register("description")} rows={4} />
//             </div>

//             <div>
//                 <Label>Images</Label>
//                 <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
//                 {form.watch("images")!.length > 0 && (
//                     <div className="mt-3 grid grid-cols-4 gap-2">
//                         {form.watch("images")?.map((img, i) => (
//                             <img
//                                 key={i}
//                                 src={img}
//                                 alt="preview"
//                                 className="h-20 w-full object-cover rounded"
//                             />
//                         ))}
//                     </div>
//                 )}
//             </div>

//             <Button type="submit" disabled={isSubmitting} className="w-full">
//                 {isSubmitting ? "Saving..." : buttonText}
//             </Button>
//         </form>
//     );
// }

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(2, "Location is required"),
  description: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof formSchema>;

type PreviewFile = {
  file: File;
  url: string;
  uploading?: boolean;
};

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => void;
  isSubmitting?: boolean;
  buttonText?: string;
}

export default function PropertyForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  buttonText = "Save",
}: PropertyFormProps) {
  const [images, setImages] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || 0,
      location: initialData?.location || "",
      description: initialData?.description || "",
    },
  });

  /* ---------------- Image handling ---------------- */

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...selected]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------------- Upload to YOUR API ---------------- */

  async function uploadImages() {
    if (!images.length) return;

    setUploading(true);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const fd = new FormData();

      fd.append("file", img.file);
      fd.append("isPrivate", "false");


      setImages((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p)),
      );

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        setUploading(false);
        throw new Error("File upload failed");
      }

      setImages((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, uploading: false } : p)),
      );
    }

    setUploading(false);
  }

  /* ---------------- Submit ---------------- */

  async function handleSubmit(values: PropertyFormValues) {
    await uploadImages(); // files linked via propertyId
    onSubmit(values); // save/update property
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} />
      </div>

      <div>
        <Label>Price (USD)</Label>
        <Input
          type="number"
          {...form.register("price", { valueAsNumber: true })}
        />
      </div>

      <div>
        <Label>Location</Label>
        <Input {...form.register("location")} />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...form.register("description")} rows={4} />
      </div>

      {/* ---------------- Images ---------------- */}
      <div>
        <Label>Images</Label>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img.url}
                  className="h-24 w-full object-cover rounded"
                />

                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center">
                    Uploading...
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-full"
      >
        {uploading || isSubmitting ? "Saving..." : buttonText}
      </Button>
    </form>
  );
}
