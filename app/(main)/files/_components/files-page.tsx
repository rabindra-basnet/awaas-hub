"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/client/auth-client";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { UploadFileDialog } from "./upload-file-dialog";
import {
  FileText,
  Image as ImageIcon,
  File,
  Film,
  Archive,
  Eye,
  Copy,
  Trash2,
  MoreHorizontal,
  Upload,
  RefreshCw,
  Lock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

function fileIcon(mimetype: string) {
  if (mimetype.startsWith("image/")) return ImageIcon;
  if (mimetype.startsWith("video/")) return Film;
  if (mimetype.includes("pdf") || mimetype.includes("text")) return FileText;
  if (mimetype.includes("zip") || mimetype.includes("tar") || mimetype.includes("rar")) return Archive;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function FilesPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") ?? "";
  const { data: session } = useSession();
  const role = session?.user?.role as Role;
  const canManage = hasPermission(role, Permission.MANAGE_FILES);
  const [open, setOpen] = useState(false);

  const { data: files = [], isLoading, refetch, isRefetching } = useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await fetch("/api/files", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load files");
      return res.json();
    },
  });

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
    onSuccess: () => { toast.success("File uploaded"); setOpen(false); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (storedName: string) => {
      const res = await fetch(`/api/files/${storedName}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { toast.success("File deleted"); refetch(); },
    onError: () => toast.error("Delete failed"),
  });

  const viewFile = async (storedName: string) => {
    try {
      const res = await fetch(`/api/files/${storedName}`, { credentials: "include" });
      const { signedUrl } = await res.json();
      if (signedUrl) window.open(signedUrl, "_blank");
    } catch {
      toast.error("Unable to view file");
    }
  };

  const copyUrl = (storedName: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/files/${storedName}`);
    toast.success("URL copied");
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)} used
          </p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
          </Button>
        </div>
        <UploadFileDialog
          open={open}
          onOpenChange={setOpen}
          propertyId={propertyId}
          isUploading={uploadMutation.isPending}
          onUpload={(data) => uploadMutation.mutate(data)}
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-9 w-9 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-24 bg-muted/60 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">No files yet</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Upload your first file to get started</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-2.5 border-b border-border/40 bg-muted/20 grid grid-cols-[1fr_80px_80px_100px_40px] gap-4 items-center">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">File</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Privacy</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Size</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">Uploaded</span>
              <span />
            </div>
            <div className="divide-y divide-border/30">
              {files.map((f) => {
                const Icon = fileIcon(f.mimetype);
                const isImage = f.mimetype.startsWith("image/");
                return (
                  <div key={f._id || f.storedName} className="grid grid-cols-[1fr_80px_80px_100px_40px] gap-4 items-center px-5 py-3 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", isImage ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary")}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.filename}</p>
                        {f.propertyId && (
                          <p className="text-[10px] text-muted-foreground truncate">Property: {f.propertyId.slice(-8)}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {f.isPrivate ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400"><Lock size={10} /> Private</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><Globe size={10} /> Public</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => viewFile(f.storedName)}>
                          <Eye size={13} /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => copyUrl(f.storedName)}>
                          <Copy size={13} /> Copy URL
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => deleteMutation.mutate(f.storedName)}>
                              <Trash2 size={13} /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
