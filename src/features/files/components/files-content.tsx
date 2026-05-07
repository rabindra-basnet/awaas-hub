"use client";

import { useFiles, useDeleteFile } from "@/features/files/queries/file.queries";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { File, Trash2, Download, Image, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesContent() {
  const { data } = useFiles();
  const deleteFile = useDeleteFile();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");

  const files: any[] = data?.files ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Files</h1>
        <p className="text-sm text-muted-foreground mt-1">{files.length} files</p>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 gap-4 text-muted-foreground">
          <File className="w-12 h-12 opacity-20" />
          <p className="text-sm">No files uploaded yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">File</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Size</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Uploaded</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((f: any) => (
                <tr key={f._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {f.mimetype?.startsWith("image/") ? (
                          <Image className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="truncate max-w-48 font-medium">{f.filename}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatBytes(f.size)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {format(new Date(f.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" render={<a href={f.url} download={f.filename} target="_blank" />}><Download className="w-3.5 h-3.5" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(f.storedName)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setConfirm(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. Type <strong>delete</strong> to confirm.</p>
          <Input placeholder='Type "delete"' value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <Button
            variant="destructive"
            disabled={confirm !== "delete" || deleteFile.isPending}
            onClick={() => {
              if (!deleteTarget) return;
              deleteFile.mutate(deleteTarget, {
                onSuccess: () => { toast.success("File deleted"); setDeleteTarget(null); setConfirm(""); },
                onError: (e) => toast.error(e.message),
              });
            }}
          >
            {deleteFile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Delete File
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
