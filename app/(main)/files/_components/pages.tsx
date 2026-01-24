// "use client";

// import { useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useSearchParams } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal, Eye, Copy, Trash, Upload } from "lucide-react";
// import { useSession } from "@/lib/client/auth-client";

// const fileSchema = z.object({
//   file: z.any().refine((f) => f instanceof File && f.size > 0, "File required"),
//   isPrivate: z.boolean(),
// });

// type FileFormData = z.infer<typeof fileSchema>;

// interface FileItem {
//   _id: string;
//   filename: string;
//   storedName: string;
//   isPrivate: boolean;
//   mimetype: string;
//   size: number;
//   createdAt: string;
//   propertyId?: string;
// }

// export default function FilesPage() {
//   const searchParams = useSearchParams();
//   const propertyId = searchParams.get("propertyId") ?? "";
//   const { data: session } = useSession();

//   const [open, setOpen] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<FileFormData>({
//     resolver: zodResolver(fileSchema),
//     defaultValues: { isPrivate: true },
//   });

//   const file = watch("file");
//   const isPrivate = watch("isPrivate");

//   const {
//     data: files = [],
//     refetch,
//     isLoading,
//   } = useQuery<FileItem[]>({
//     queryKey: ["files"],
//     queryFn: async () => {
//       const res = await fetch("/api/files", { credentials: "include" });
//       if (!res.ok) throw new Error("Failed");
//       return res.json();
//     },
//   });

//   const uploadMutation = useMutation({
//     mutationFn: async (data: FileFormData) => {
//       if (!data.file) throw new Error("No file");
//       const formData = new FormData();
//       formData.append("file", data.file);
//       formData.append("isPrivate", String(isPrivate));
//       formData.append("propertyId", propertyId);

//       const res = await fetch("/api/files/upload", {
//         method: "POST",
//         body: formData,
//         credentials: "include",
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Upload failed");
//       }
//       return res.json();
//     },
//     onSuccess: () => {
//       toast.success("Uploaded");
//       reset({ isPrivate: true });
//       setOpen(false);
//       setUploadProgress(0);
//       refetch();
//     },
//     onError: (err) => toast.error(err.message || "Failed"),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (storedName: string) => {
//       const res = await fetch(`/api/files/${storedName}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Delete failed");
//     },
//     onSuccess: () => {
//       toast.success("Deleted");
//       refetch();
//     },
//     onError: () => toast.error("Delete failed"),
//   });

//   const viewFile = async (storedName: string) => {
//     try {
//       const res = await fetch(`/api/files/${storedName}`, {
//         credentials: "include",
//       });
//       const { signedUrl } = await res.json();
//       window.open(signedUrl, "_blank");
//     } catch {
//       toast.error("View failed");
//     }
//   };

//   const copyToClipboard = (storedName: string) => {
//     navigator.clipboard.writeText(
//       `${window.location.origin}/api/files/${storedName}`,
//     );
//     toast.success("Copied");
//   };

//   return (
//     <div className="p-4 max-w-6xl mx-auto space-y-6 text-white">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">My Files</h1>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button>Upload New File</Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-2xl bg-slate-800 text-white">
//             <DialogHeader>
//               <DialogTitle>Upload File</DialogTitle>
//               <p className="text-sm text-muted-foreground">
//                 Property ID: <b>{propertyId || "None"}</b>
//               </p>
//             </DialogHeader>

//             <form
//               onSubmit={handleSubmit((d) => uploadMutation.mutate(d))}
//               className="space-y-6 mt-6"
//             >
//               <Controller
//                 name="file"
//                 control={control}
//                 render={({ field }) => (
//                   <>
//                     <Input
//                       type="file"
//                       id="file-upload"
//                       className="hidden"
//                       onChange={(e) => field.onChange(e.target.files?.[0])}
//                       disabled={isSubmitting}
//                     />

//                     {file ? (
//                       // Selected file card
//                       <div className="flex items-center gap-4 p-5 bg-slate-900/80 rounded-xl border border-slate-700">
//                         <div className="shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
//                           <Upload className="w-7 h-7 text-primary" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium truncate">{file.name}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
//                             {file.type || "Unknown type"}
//                           </p>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => reset({ file: undefined })}
//                           disabled={isSubmitting}
//                         >
//                           <Trash className="h-5 w-5 text-muted-foreground hover:text-destructive" />
//                         </Button>
//                       </div>
//                     ) : (
//                       // Drag-drop zone when no file
//                       <label
//                         htmlFor="file-upload"
//                         className={`
//                 flex flex-col items-center justify-center w-full h-64
//                 border-2 border-dashed rounded-2xl cursor-pointer
//                 transition-all duration-200
//                 ${
//                   isSubmitting
//                     ? "border-gray-600 bg-gray-900/50 cursor-not-allowed"
//                     : "border-primary/50 hover:border-primary bg-slate-900/40 hover:bg-slate-800/60"
//                 }
//               `}
//                       >
//                         <Upload className="w-14 h-14 mb-5 text-muted-foreground" />
//                         <p className="text-xl font-semibold text-white">
//                           Click or drag file here
//                         </p>
//                         <p className="mt-2 text-sm text-muted-foreground">
//                           Any file • Max 100MB recommended
//                         </p>
//                       </label>
//                     )}
//                   </>
//                 )}
//               />

//               {/* Checkbox */}
//               <div className="flex items-center space-x-3">
//                 <Controller
//                   name="isPrivate"
//                   control={control}
//                   render={({ field }) => (
//                     <>
//                       <Checkbox
//                         id="private-file"
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                         disabled={isSubmitting}
//                         className="h-5 w-5"
//                       />
//                       <Label
//                         htmlFor="private-file"
//                         className="text-base cursor-pointer"
//                       >
//                         Private File
//                       </Label>
//                     </>
//                   )}
//                 />
//               </div>

//               {/* Progress */}
//               {isSubmitting && (
//                 <div className="space-y-2">
//                   <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
//                     <div
//                       className="bg-green-500 h-full transition-all"
//                       style={{ width: `${uploadProgress}%` }}
//                     />
//                   </div>
//                   <p className="text-sm text-center text-muted-foreground">
//                     Uploading... {uploadProgress}%
//                   </p>
//                 </div>
//               )}

//               <DialogFooter className="gap-3">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => reset()}
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" size="lg" disabled={isSubmitting}>
//                   {isSubmitting ? "Uploading..." : "Upload File"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="p-4 bg-slate-900 rounded-md shadow-md">
//         <Table className="text-white">
//           <TableHeader>
//             <TableRow>
//               <TableHead>Filename</TableHead>
//               <TableHead>Privacy</TableHead>
//               <TableHead>Size</TableHead>
//               <TableHead>Property ID</TableHead>
//               <TableHead>Uploaded At</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {isLoading ? (
//               [...Array(5)].map((_, i) => (
//                 <TableRow key={i}>
//                   <TableCell colSpan={6}>
//                     <div className="h-8 bg-slate-800 animate-pulse rounded" />
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : files?.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={6}
//                   className="text-center py-8 text-muted-foreground"
//                 >
//                   No files uploaded yet.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               files.map((f) => (
//                 <TableRow
//                   key={f?._id ? String(f._id) : crypto.randomUUID()}
//                   className="hover:bg-slate-700"
//                 >
//                   <TableCell>{f?.filename || "-"}</TableCell>
//                   <TableCell>{f?.isPrivate ? "Private" : "Public"}</TableCell>
//                   <TableCell>
//                     {f?.size ? (f.size / 1024).toFixed(2) : 0} KB
//                   </TableCell>
//                   <TableCell>{f?.propertyId || "-"}</TableCell>
//                   <TableCell>
//                     {f?.createdAt
//                       ? new Date(f.createdAt).toLocaleString()
//                       : "-"}
//                   </TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-8 w-8 p-0"
//                         >
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem
//                           onClick={() => viewFile(f.storedName)}
//                         >
//                           <Eye className="mr-2 h-4 w-4" /> View
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           onClick={() => copyToClipboard(f.storedName)}
//                         >
//                           <Copy className="mr-2 h-4 w-4" /> Copy URL
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           className="text-destructive focus:bg-destructive/10"
//                           onClick={() => deleteMutation.mutate(f.storedName)}
//                         >
//                           <Trash className="mr-2 h-4 w-4" /> Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Copy, Trash, Upload } from "lucide-react";
import { useSession } from "@/lib/client/auth-client";

const fileSchema = z.object({
  file: z.any().refine((f) => f instanceof File && f.size > 0, "File required"),
  isPrivate: z.boolean(),
});

type FileFormData = z.infer<typeof fileSchema>;

interface FileItem {
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: { isPrivate: true },
  });

  const file = watch("file");
  const isPrivate = watch("isPrivate");

  const { data: files = [], refetch, isLoading } = useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await fetch("/api/files", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FileFormData) => {
      if (!data.file) throw new Error("No file");

      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("isPrivate", String(isPrivate));
      formData.append("propertyId", propertyId);

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
      toast.success("Uploaded");
      reset({ isPrivate: true });
      setOpen(false);
      setUploadProgress(0);
      refetch();
    },
    onError: (err) => toast.error(err.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (storedName: string) => {
      const res = await fetch(`/api/files/${storedName}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Deleted");
      refetch();
    },
    onError: () => toast.error("Delete failed"),
  });

  const viewFile = async (storedName: string) => {
    try {
      const res = await fetch(`/api/files/${storedName}`, {
        credentials: "include",
      });
      const { signedUrl } = await res.json();
      window.open(signedUrl, "_blank");
    } catch {
      toast.error("View failed");
    }
  };

  const copyToClipboard = (storedName: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/api/files/${storedName}`,
    );
    toast.success("Copied");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Files</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Upload New File</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Property ID: <b>{propertyId || "None"}</b>
              </p>
            </DialogHeader>

            <form
              onSubmit={handleSubmit((d) => uploadMutation.mutate(d))}
              className="space-y-6 mt-6"
            >
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
                      disabled={isSubmitting}
                    />

                    {file ? (
                      <div className="flex items-center gap-4 p-5 rounded-xl border bg-muted/50">
                        <div className="shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                            {file.type || "Unknown type"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => reset({ file: undefined })}
                          disabled={isSubmitting}
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="file-upload"
                        className={`
                          flex flex-col items-center justify-center w-full h-64
                          border-2 border-dashed rounded-2xl cursor-pointer
                          transition-colors
                          ${
                            isSubmitting
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:border-primary"
                          }
                        `}
                      >
                        <Upload className="w-14 h-14 mb-5 text-muted-foreground" />
                        <p className="text-xl font-semibold">
                          Click or drag file here
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Any file • Max 100MB recommended
                        </p>
                      </label>
                    )}
                  </>
                )}
              />

              {/* Checkbox */}
              <div className="flex items-center space-x-3">
                <Controller
                  name="isPrivate"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Checkbox
                        id="private-file"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="private-file" className="cursor-pointer">
                        Private File
                      </Label>
                    </>
                  )}
                />
              </div>

              {/* Progress */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Upload File"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="p-4 rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Privacy</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Property ID</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No files uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              files.map((f) => (
                <TableRow
                  key={f._id || crypto.randomUUID()}
                  className="hover:bg-muted/50"
                >
                  <TableCell>{f.filename || "-"}</TableCell>
                  <TableCell>
                    {f.isPrivate ? "Private" : "Public"}
                  </TableCell>
                  <TableCell>
                    {f.size ? (f.size / 1024).toFixed(2) : 0} KB
                  </TableCell>
                  <TableCell>{f.propertyId || "-"}</TableCell>
                  <TableCell>
                    {f.createdAt
                      ? new Date(f.createdAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => viewFile(f.storedName)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(f.storedName)}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10"
                          onClick={() => deleteMutation.mutate(f.storedName)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
