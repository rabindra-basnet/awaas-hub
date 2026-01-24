"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Copy } from "lucide-react";

interface FileItem {
  id: string;
  filename: string;
  storedName: string;
  isPrivate: boolean;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [open, setOpen] = useState(false);

  // Fetch files
  const {
    data: files = [],
    refetch,
    isLoading,
  } = useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await fetch("/api/files", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select a file first");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/files?isPrivate=${isPrivate}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Upload successful!");
      setFile(null);
      setOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
      setOpen(false);
    },
  });

  const handleUpload = () => uploadMutation.mutate();

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    toast.success("Copied URL!");
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Files</h1>

        {/* Upload Dialog Trigger */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Upload New File</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                Select a file and choose whether it should be private or public.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                  disabled={uploadMutation.isPending}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isPrivate}
                  onCheckedChange={(val) => setIsPrivate(Boolean(val))}
                />
                <Label>Private File</Label>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between gap-2">
              {/* Toggle Button */}
              <Button
                size="sm"
                variant="default"
                onClick={() => setIsPrivate((prev) => !prev)}
                disabled={uploadMutation.isPending}
              >
                {isPrivate ? "Private" : "Public"}
              </Button>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !file}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Files Table */}
      <div className="p-4 bg-white rounded-md shadow">
        {isLoading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.filename}</TableCell>
                  <TableCell>{f.isPrivate ? "Private" : "Public"}</TableCell>
                  <TableCell>{(f.size / 1024).toFixed(2)} KB</TableCell>
                  <TableCell>
                    {new Date(f.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(f.url)}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
