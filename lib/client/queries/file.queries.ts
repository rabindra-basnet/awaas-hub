import { useMutation, useQuery } from "@tanstack/react-query";

export interface FileItem {
  id: string;
  filename: string;
  storedName: string;
  isPrivate: boolean;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

/* =======================
   Fetch Files Query
======================= */
export const useFilesQuery = () => {
  return useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await fetch("/api/files", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch files");
      }

      return res.json();
    },
  });
};

/* =======================
   Upload File Mutation
======================= */
export const useUploadFileMutation = (
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) => {
  return useMutation({
    mutationFn: async ({
      file,
      isPrivate,
    }: {
      file: File;
      isPrivate: boolean;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/files?isPrivate=${isPrivate}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data;
    },
    onSuccess,
    onError,
  });
};
