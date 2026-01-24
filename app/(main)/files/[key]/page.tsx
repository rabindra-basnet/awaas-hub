"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import Image from "next/image";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { useSession } from "@/lib/client/auth-client";

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
  const { data: session } = useSession();
  const role = session?.user?.role as Role;

  // Check if user has permission to view files
  const canView = hasPermission(role, Permission.VIEW_FILES);
  if (!canView) {
    return (
      <div className="p-6 text-center text-red-500">
        You do not have permission to view this file.
      </div>
    );
  }

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

  /* ---------- LOADING: NO FLASH ---------- */
  if (isLoading) return null;

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-red-500">Failed to load file.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button asChild>
          <a href={data.signedUrl} download>
            Download
          </a>
        </Button>
      </div>

      {/* ---------- GALLERY CARD ---------- */}
      <div className="flex justify-center">
        {data.mimetype.startsWith("image/") ? (
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
            <div className="bg-muted p-3">
              <Image
                src={data.signedUrl}
                alt={data.filename}
                width={1600}
                height={1600}
                priority
                className="max-h-[65vh] w-auto object-contain rounded-md transition-transform duration-200 hover:scale-[1.01]"
              />
            </div>

            <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
              <span className="truncate max-w-[60%]">{data.filename}</span>
              <span>{Math.round(data.size / 1024)} KB</span>
            </div>
          </div>
        ) : data.mimetype.startsWith("video/") ? (
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden max-w-4xl w-full">
            <video
              src={data.signedUrl}
              controls
              className="w-full max-h-[70vh] bg-black"
            />
          </div>
        ) : data.mimetype === "application/pdf" ? (
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden max-w-4xl w-full">
            <iframe src={data.signedUrl} className="w-full h-[70vh] bg-white" />

            <div className="px-4 py-2 text-xs text-muted-foreground flex justify-between border-t">
              <span className="truncate">{data.filename}</span>
              <span>{Math.round(data.size / 1024)} KB</span>
            </div>
          </div>
        ) : (
          <div className="p-6 border rounded-md text-center space-y-3">
            <p>Preview not available for this file type</p>
            <Button asChild>
              <a
                href={data.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open File
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
