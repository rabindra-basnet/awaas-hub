"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/client/auth-client";
import { UploadFileDialog } from "./_components/upload-file-dialog";
import { FilesTable } from "./_components/files-table";



export interface FileItem {
  _id: string;
  filename: string;
  storedName: string;
  isPrivate: boolean;
  mimetype: string;
  size: number;
  createdAt: string;
  propertyId?: string;
}

export default function FilesPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") ?? "";
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);

  /** Fetch files */
  const {
    data: files = [],
    isLoading,
    refetch,
  } = useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await fetch("/api/files", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load files");
      return res.json();
    },
  });

  /** Upload */
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("File uploaded");
      setOpen(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /** Delete */
  const deleteMutation = useMutation({
    mutationFn: async (storedName: string) => {
      const res = await fetch(`/api/files/${storedName}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("File deleted");
      refetch();
    },
    onError: () => toast.error("Delete failed"),
  });

  /** View */
  const viewFile = async (storedName: string) => {
    try {
      const res = await fetch(`/api/files/${storedName}`, {
        credentials: "include",
      });
      const { signedUrl } = await res.json();
      
    } catch {
      toast.error("Unable to view file");
    }
  };

  /** Copy */
  const copyToClipboard = (storedName: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/api/files/${storedName}`,
    );
    toast.success("URL copied");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Files</h1>

        <UploadFileDialog
          open={open}
          onOpenChange={setOpen}
          propertyId={propertyId}
          isUploading={uploadMutation.isPending}
          onUpload={(data) => uploadMutation.mutate(data)}
        />
      </div>

      <FilesTable
        files={files}
        isLoading={isLoading}
        onView={viewFile}
        onCopy={copyToClipboard}
        onDelete={(name) => deleteMutation.mutate(name)}
      />
    </div>
  );
}
