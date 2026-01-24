"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Trash } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const fileSchema = z.object({
  file: z.any().refine((f) => f instanceof File && f.size > 0, "File required"),
  isPrivate: z.boolean(),
});

type FileFormData = z.infer<typeof fileSchema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  propertyId?: string;
  isUploading: boolean;
  onUpload: (data: FormData) => void;
}

export function UploadFileDialog({
  open,
  onOpenChange,
  propertyId,
  isUploading,
  onUpload,
}: Props) {
  const { control, handleSubmit, reset, watch } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: { isPrivate: true },
  });

  const file = watch("file");

  const submit = (data: FileFormData) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("isPrivate", String(data.isPrivate));
    if (propertyId) formData.append("propertyId", propertyId);

    onUpload(formData);
    reset({ isPrivate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Upload New File</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl bg-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Property ID: <b>{propertyId || "None"}</b>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-6 mt-6">
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <>
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                  disabled={isUploading}
                />

                {file ? (
                  <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-xl border border-slate-700">
                    <Upload className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => reset({ file: undefined })}
                    >
                      <Trash />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/50 bg-slate-900/40"
                  >
                    <Upload className="h-12 w-12 mb-4" />
                    <p>Click or drag file here</p>
                  </label>
                )}
              </>
            )}
          />

          <Controller
            name="isPrivate"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Private File</Label>
              </div>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
