"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

type FileDetails = {
  signedUrl: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
  propertyId?: string;
};

export default function FilePreviewPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = use(params);
  const router = useRouter();

  // Fetch file details using TanStack Query
  const { data, isLoading, isError } = useQuery<FileDetails>({
    queryKey: ["file", key],
    queryFn: async () => {
      const res = await fetch(`/api/files/${key}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to load file");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="h-64 bg-muted animate-pulse rounded-md" />;
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-red-500">Failed to load file.</div>
    );
  }
  console.log(data)
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {data.mimetype.startsWith("image/") ? (
        <img
          src={data.signedUrl}
          alt={data.filename}
          className="max-h-[70vh] mx-auto rounded-lg shadow"
        />
      ) : data.mimetype.startsWith("video/") ? (
        <video
          src={data.signedUrl}
          controls
          className="max-h-[70vh] mx-auto rounded-lg shadow"
        />
      ) : data.mimetype === "application/pdf" ? (
        <iframe
          src={data.signedUrl}
          className="w-full h-[70vh] border rounded-lg"
        />
      ) : (
        <div className="p-6 border rounded-md text-center space-y-3">
          <p>Preview not available for this file type</p>
          <Button asChild>
            <a href={data.signedUrl} target="_blank" rel="noopener noreferrer">
              Open File
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
