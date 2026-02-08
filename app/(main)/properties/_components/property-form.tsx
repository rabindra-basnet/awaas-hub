"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";

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
  propertyId?: string; // For fetching existing images
  onSubmit: (
    values: PropertyFormValues & {
      fileIds: string[];
      deletedFileIds: string[];
    },
  ) => void;
  isSubmitting?: boolean;
  buttonText?: string;
}

export default function PropertyForm({
  initialData,
  existingImages: initialExistingImages,
  propertyId,
  onSubmit,
  isSubmitting = false,
  buttonText = "Save",
}: PropertyFormProps) {
  const [images, setImages] = useState<PreviewFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || 0,
      location: initialData?.location || "",
      description: initialData?.description || "",
    },
  });

  /* ---------------- Fetch existing images ---------------- */
  const { data: fetchedImages = [], isLoading: loadingExisting } =
    usePropertyImages(propertyId);

  useEffect(() => {
    if (fetchedImages.length) {
      setExistingImages(fetchedImages);
    } else if (!propertyId && initialExistingImages?.length) {
      setExistingImages(initialExistingImages);
    }
  }, [fetchedImages, propertyId, initialExistingImages]);

  /* ---------------- Image handling ---------------- */

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      uploadProgress: 0,
    }));

    setImages((prev) => [...prev, ...selected]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(images[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(imageId: string) {
    setDeletedFileIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
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

      try {
        setImages((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: 50 } : p)),
        );

        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          throw new Error(`Upload failed for ${img.file.name}`);
        }

        const data = await res.json();

        setImages((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? { ...p, uploadProgress: 100, fileId: data.file._id }
              : p,
          ),
        );

        fileIds.push(data.file._id);
      } catch (error) {
        console.error("Upload error:", error);
        setImages((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploadProgress: -1 } : p)),
        );
        throw error;
      }
    }

    setUploading(false);
    return fileIds;
  }

  /* ---------------- Submit ---------------- */

  async function handleSubmit(values: PropertyFormValues) {
    try {
      const newFileIds = await uploadImages();
      onSubmit({ ...values, fileIds: newFileIds, deletedFileIds });
    } catch (error) {
      console.error("Submission error:", error);
      setUploading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label>Price (USD)</Label>
        <Input
          type="number"
          {...form.register("price", { valueAsNumber: true })}
        />
        {form.formState.errors.price && (
          <p className="text-sm text-destructive">
            {form.formState.errors.price.message}
          </p>
        )}
      </div>

      <div>
        <Label>Location</Label>
        <Input {...form.register("location")} />
        {form.formState.errors.location && (
          <p className="text-sm text-destructive">
            {form.formState.errors.location.message}
          </p>
        )}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...form.register("description")} rows={4} />
      </div>

      {/* ---------------- Images ---------------- */}
      <div>
        <Label>Images</Label>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={uploading}
        />

        {loadingExisting ? (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                />

                {/* Existing badge */}
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Saved
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  disabled={uploading}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* New Images */}
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.url}
                  alt="preview"
                  className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                />

                {/* Upload Progress Overlay */}
                {img.uploadProgress !== undefined &&
                  img.uploadProgress < 100 &&
                  img.uploadProgress >= 0 && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center">
                      <div className="w-3/4 bg-gray-300 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${img.uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">
                        {img.uploadProgress}%
                      </span>
                    </div>
                  )}

                {/* Error State */}
                {img.uploadProgress === -1 && (
                  <div className="absolute inset-0 bg-red-500/80 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">Upload Failed</span>
                  </div>
                )}

                {/* Success Check */}
                {img.uploadProgress === 100 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  disabled={uploading}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Add Image Box */}
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Add Image</span>
            </button>
          </div>
        )}

        {(existingImages.length > 0 || images.length > 0) && (
          <p className="text-sm text-gray-500 mt-2">
            {existingImages.length} existing, {images.length} new
            {deletedFileIds.length > 0 &&
              `, ${deletedFileIds.length} to delete`}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-full"
      >
        {uploading
          ? "Uploading images..."
          : isSubmitting
            ? "Saving..."
            : buttonText}
      </Button>
    </form>
  );
}
