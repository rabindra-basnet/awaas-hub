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

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5 mt-2">
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
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                    <Upload className="w-7 h-7 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => reset({ file: undefined })}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">Click to select a file</p>
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
