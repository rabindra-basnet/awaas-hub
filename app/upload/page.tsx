// // // // "use client";

// // // // import { useState } from "react";
// // // // import { useMutation } from "@tanstack/react-query";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Input } from "@/components/ui/input";
// // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // import { toast } from "sonner";
// // // // import { Label } from "@/components/ui/label";

// // // // interface UploadResponse {
// // // //   url: string;
// // // //   message?: string;
// // // //   filename: string;
// // // //   storedName: string;
// // // //   size: number;
// // // //   mimetype: string;
// // // // }

// // // // interface UploadParams {
// // // //   file: File;
// // // //   isPrivate: boolean;
// // // // }

// // // // export default function UploadPage() {
// // // //   const [file, setFile] = useState<File | null>(null);
// // // //   const [isPrivate, setIsPrivate] = useState(true);

// // // //   // Upload mutation
// // // //   const uploadMutation = useMutation({
// // // //     mutationFn: async ({
// // // //       file,
// // // //       isPrivate,
// // // //     }: UploadParams): Promise<UploadResponse> => {
// // // //       const formData = new FormData();
// // // //       formData.append("file", file);

// // // //       const res = await fetch(`/api/upload?isPrivate=${isPrivate}`, {
// // // //         method: "POST",
// // // //         credentials: "include",
// // // //         body: formData,
// // // //       });

// // // //       const data = await res.json();

// // // //       if (!res.ok) {
// // // //         throw new Error(data.error || "Upload failed");
// // // //       }

// // // //       return data;
// // // //     },
// // // //     onSuccess: (data) => {
// // // //       toast.success(data.message || "Upload successful!");
// // // //       // Reset file input
// // // //       setFile(null);
// // // //     },
// // // //     onError: (error: Error) => {
// // // //       console.error("Upload error:", error);
// // // //       toast.error(error.message || "Upload error");
// // // //     },
// // // //   });

// // // //   const handleUpload = () => {
// // // //     if (!file) {
// // // //       toast.error("Please select a file");
// // // //       return;
// // // //     }

// // // //     uploadMutation.mutate({ file, isPrivate });
// // // //   };

// // // //   return (
// // // //     <div className="p-4 max-w-md mx-auto space-y-4">
// // // //       <h2 className="text-xl font-bold mb-4">Upload File</h2>

// // // //       <div className="space-y-2">
// // // //         <Label htmlFor="file-upload">Select File</Label>
// // // //         <Input
// // // //           id="file-upload"
// // // //           type="file"
// // // //           onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
// // // //           className="cursor-pointer"
// // // //           disabled={uploadMutation.isPending}
// // // //         />
// // // //         {file && (
// // // //           <p className="text-sm text-muted-foreground">
// // // //             Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
// // // //           </p>
// // // //         )}
// // // //       </div>

// // // //       <div className="flex items-center space-x-2">
// // // //         <Checkbox
// // // //           id="isPrivate"
// // // //           checked={isPrivate}
// // // //           onCheckedChange={(checked) => setIsPrivate(Boolean(checked))}
// // // //           disabled={uploadMutation.isPending}
// // // //         />
// // // //         <Label
// // // //           htmlFor="isPrivate"
// // // //           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
// // // //         >
// // // //           Private File
// // // //         </Label>
// // // //       </div>

// // // //       <Button
// // // //         onClick={handleUpload}
// // // //         disabled={uploadMutation.isPending || !file}
// // // //         className="w-full"
// // // //       >
// // // //         {uploadMutation.isPending ? "Uploading..." : "Upload"}
// // // //       </Button>

// // // //       {uploadMutation.isSuccess && uploadMutation.data && (
// // // //         <div className="p-4 bg-green-50 border border-green-200 rounded-md">
// // // //           <p className="text-sm font-medium text-green-800">
// // // //             Upload successful!
// // // //           </p>
// // // //           <p className="text-xs text-green-600 break-all mt-1">
// // // //             URL: {uploadMutation.data.url}
// // // //           </p>
// // // //         </div>
// // // //       )}

// // // //       {uploadMutation.isError && (
// // // //         <div className="p-4 bg-red-50 border border-red-200 rounded-md">
// // // //           <p className="text-sm font-medium text-red-800">Upload failed</p>
// // // //           <p className="text-xs text-red-600 mt-1">
// // // //             {uploadMutation.error.message}
// // // //           </p>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }
// // // //
// // // "use client";

// // // import { useState } from "react";
// // // import { useMutation } from "@tanstack/react-query";
// // // import { useRouter } from "next/navigation";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Checkbox } from "@/components/ui/checkbox";
// // // import { toast } from "sonner";
// // // import { Label } from "@/components/ui/label";
// // // import { ExternalLink, Eye } from "lucide-react";

// // // interface UploadResponse {
// // //   url: string;
// // //   message?: string;
// // //   filename: string;
// // //   storedName: string;
// // //   size: number;
// // //   mimetype: string;
// // //   isPrivate: boolean;
// // // }

// // // interface UploadParams {
// // //   file: File;
// // //   isPrivate: boolean;
// // // }

// // // export default function UploadPage() {
// // //   const [file, setFile] = useState<File | null>(null);
// // //   const [isPrivate, setIsPrivate] = useState(true);
// // //   const router = useRouter();

// // //   // Upload mutation
// // //   const uploadMutation = useMutation({
// // //     mutationFn: async ({
// // //       file,
// // //       isPrivate,
// // //     }: UploadParams): Promise<UploadResponse> => {
// // //       const formData = new FormData();
// // //       formData.append("file", file);

// // //       const res = await fetch(`/api/upload?isPrivate=${isPrivate}`, {
// // //         method: "POST",
// // //         credentials: "include",
// // //         body: formData,
// // //       });

// // //       const data = await res.json();

// // //       if (!res.ok) {
// // //         throw new Error(data.error || "Upload failed");
// // //       }

// // //       return data;
// // //     },
// // //     onSuccess: (data) => {
// // //       toast.success(data.message || "Upload successful!");
// // //       // Reset file input
// // //       setFile(null);
// // //       const input = document.querySelector(
// // //         'input[type="file"]',
// // //       ) as HTMLInputElement;
// // //       if (input) input.value = "";
// // //     },
// // //     onError: (error: Error) => {
// // //       console.error("Upload error:", error);
// // //       toast.error(error.message || "Upload error");
// // //     },
// // //   });

// // //   const handleUpload = () => {
// // //     if (!file) {
// // //       toast.error("Please select a file");
// // //       return;
// // //     }

// // //     uploadMutation.mutate({ file, isPrivate });
// // //   };

// // //   const handleViewFile = () => {
// // //     if (uploadMutation.data?.storedName) {
// // //       const fileUrl = uploadMutation.data.isPrivate
// // //         ? `/api/files/private/${uploadMutation.data.storedName}`
// // //         : `/api/files/public/${uploadMutation.data.storedName}`;

// // //       // Open in new tab
// // //       window.open(fileUrl, "_blank");
// // //     }
// // //   };

// // //   const handleRedirectToFile = () => {
// // //     if (uploadMutation.data?.storedName) {
// // //       const fileUrl = uploadMutation.data.isPrivate
// // //         ? `/api/files/private/${uploadMutation.data.storedName}`
// // //         : `/api/files/public/${uploadMutation.data.storedName}`;

// // //       // Navigate to file URL
// // //       router.push(fileUrl);
// // //     }
// // //   };

// // //   const copyUrlToClipboard = () => {
// // //     if (uploadMutation.data?.url) {
// // //       const fullUrl = `${window.location.origin}${uploadMutation.data.url}`;
// // //       navigator.clipboard.writeText(fullUrl);
// // //       toast.success("URL copied to clipboard!");
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-4 max-w-md mx-auto space-y-4">
// // //       <h2 className="text-xl font-bold mb-4">Upload File</h2>

// // //       <div className="space-y-2">
// // //         <Label htmlFor="file-upload">Select File</Label>
// // //         <Input
// // //           id="file-upload"
// // //           type="file"
// // //           onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
// // //           className="cursor-pointer"
// // //           disabled={uploadMutation.isPending}
// // //         />
// // //         {file && (
// // //           <p className="text-sm text-muted-foreground">
// // //             Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
// // //           </p>
// // //         )}
// // //       </div>

// // //       <div className="flex items-center space-x-2">
// // //         <Checkbox
// // //           id="isPrivate"
// // //           checked={isPrivate}
// // //           onCheckedChange={(checked) => setIsPrivate(Boolean(checked))}
// // //           disabled={uploadMutation.isPending}
// // //         />
// // //         <Label
// // //           htmlFor="isPrivate"
// // //           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
// // //         >
// // //           Private File
// // //         </Label>
// // //       </div>

// // //       <Button
// // //         onClick={handleUpload}
// // //         disabled={uploadMutation.isPending || !file}
// // //         className="w-full"
// // //       >
// // //         {uploadMutation.isPending ? "Uploading..." : "Upload"}
// // //       </Button>

// // //       {uploadMutation.isSuccess && uploadMutation.data && (
// // //         <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
// // //           <div>
// // //             <p className="text-sm font-medium text-green-800">
// // //               Upload successful!
// // //             </p>
// // //             <p className="text-xs text-green-600 mt-1">
// // //               {uploadMutation.data.filename}
// // //             </p>
// // //             <p className="text-xs text-green-600 break-all">
// // //               Stored as: {uploadMutation.data.storedName}
// // //             </p>
// // //           </div>

// // //           <div className="flex flex-col gap-2">
// // //             <Button
// // //               variant="outline"
// // //               size="sm"
// // //               onClick={handleViewFile}
// // //               className="w-full justify-start"
// // //             >
// // //               <Eye className="mr-2 h-4 w-4" />
// // //               View File (New Tab)
// // //             </Button>

// // //             <Button
// // //               variant="outline"
// // //               size="sm"
// // //               onClick={handleRedirectToFile}
// // //               className="w-full justify-start"
// // //             >
// // //               <ExternalLink className="mr-2 h-4 w-4" />
// // //               Go to File
// // //             </Button>

// // //             <Button
// // //               variant="outline"
// // //               size="sm"
// // //               onClick={copyUrlToClipboard}
// // //               className="w-full justify-start"
// // //             >
// // //               Copy URL
// // //             </Button>
// // //           </div>

// // //           {/* File Preview for Images */}
// // //           {uploadMutation.data.mimetype.startsWith("image/") && (
// // //             <div className="mt-3">
// // //               <p className="text-xs text-green-600 mb-2">Preview:</p>
// // //               <img
// // //                 src={uploadMutation.data.url}
// // //                 alt={uploadMutation.data.filename}
// // //                 className="max-w-full h-auto rounded border border-green-300"
// // //               />
// // //             </div>
// // //           )}

// // //           {/* File Preview for PDFs */}
// // //           {uploadMutation.data.mimetype === "application/pdf" && (
// // //             <div className="mt-3">
// // //               <p className="text-xs text-green-600 mb-2">Preview:</p>
// // //               <iframe
// // //                 src={uploadMutation.data.url}
// // //                 className="w-full h-64 rounded border border-green-300"
// // //                 title={uploadMutation.data.filename}
// // //               />
// // //             </div>
// // //           )}
// // //         </div>
// // //       )}

// // //       {uploadMutation.isError && (
// // //         <div className="p-4 bg-red-50 border border-red-200 rounded-md">
// // //           <p className="text-sm font-medium text-red-800">Upload failed</p>
// // //           <p className="text-xs text-red-600 mt-1">
// // //             {uploadMutation.error.message}
// // //           </p>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState } from "react";
// // import { useMutation } from "@tanstack/react-query";
// // import { useRouter } from "next/navigation";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Checkbox } from "@/components/ui/checkbox";
// // import { toast } from "sonner";
// // import { Label } from "@/components/ui/label";
// // import { ExternalLink, Eye, Copy } from "lucide-react";
// // import { FileUploadResponse, UploadParams } from "@/types/file.types";

// // export default function UploadPage() {
// //   const [file, setFile] = useState<File | null>(null);
// //   const [isPrivate, setIsPrivate] = useState(true);
// //   const router = useRouter();

// //   const uploadMutation = useMutation({
// //     mutationFn: async ({
// //       file,
// //       isPrivate,
// //     }: UploadParams): Promise<FileUploadResponse> => {
// //       const formData = new FormData();
// //       formData.append("file", file);

// //       const res = await fetch(`/api/files?isPrivate=${isPrivate}`, {
// //         method: "POST",
// //         credentials: "include",
// //         body: formData,
// //       });

// //       const data = await res.json();

// //       if (!res.ok) {
// //         throw new Error(data.error || "Upload failed");
// //       }

// //       return data;
// //     },
// //     onSuccess: (data) => {
// //       toast.success(data.message || "Upload successful!");
// //       setFile(null);
// //       const input = document.querySelector(
// //         'input[type="file"]',
// //       ) as HTMLInputElement;
// //       if (input) input.value = "";
// //     },
// //     onError: (error: Error) => {
// //       console.error("Upload error:", error);
// //       toast.error(error.message || "Upload error");
// //     },
// //   });

// //   const handleUpload = () => {
// //     if (!file) {
// //       toast.error("Please select a file");
// //       return;
// //     }

// //     uploadMutation.mutate({ file, isPrivate });
// //   };

// //   const handleViewFile = () => {
// //     if (uploadMutation.data?.url) {
// //       window.open(uploadMutation.data.url, "_blank");
// //     }
// //   };

// //   const handleRedirectToFile = () => {
// //     if (uploadMutation.data?.url) {
// //       router.push(uploadMutation.data.url);
// //     }
// //   };

// //   const copyUrlToClipboard = () => {
// //     if (uploadMutation.data?.url) {
// //       const fullUrl = `${window.location.origin}${uploadMutation.data.url}`;
// //       navigator.clipboard.writeText(fullUrl);
// //       toast.success("URL copied to clipboard!");
// //     }
// //   };

// //   return (
// //     <div className="p-4 max-w-md mx-auto space-y-4">
// //       <h2 className="text-xl font-bold mb-4">Upload File</h2>

// //       <div className="space-y-2">
// //         <Label htmlFor="file-upload">Select File</Label>
// //         <Input
// //           id="file-upload"
// //           type="file"
// //           onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
// //           className="cursor-pointer"
// //           disabled={uploadMutation.isPending}
// //         />
// //         {file && (
// //           <p className="text-sm text-muted-foreground">
// //             Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
// //           </p>
// //         )}
// //       </div>

// //       <div className="flex items-center space-x-2">
// //         <Checkbox
// //           id="isPrivate"
// //           checked={isPrivate}
// //           onCheckedChange={(checked) => setIsPrivate(Boolean(checked))}
// //           disabled={uploadMutation.isPending}
// //         />
// //         <Label
// //           htmlFor="isPrivate"
// //           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
// //         >
// //           Private File
// //         </Label>
// //       </div>

// //       <Button
// //         onClick={handleUpload}
// //         disabled={uploadMutation.isPending || !file}
// //         className="w-full"
// //       >
// //         {uploadMutation.isPending ? "Uploading..." : "Upload"}
// //       </Button>

// //       {uploadMutation.isSuccess && uploadMutation.data && (
// //         <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
// //           <div>
// //             <p className="text-sm font-medium text-green-800">
// //               Upload successful!
// //             </p>
// //             <p className="text-xs text-green-600 mt-1">
// //               {uploadMutation.data.filename}
// //             </p>
// //             <p className="text-xs text-green-600">
// //               Size:{" "}
// //               {uploadMutation.data.readableSize ||
// //                 `${(uploadMutation.data.size / 1024).toFixed(2)} KB`}
// //             </p>
// //             <p className="text-xs text-green-600 break-all">
// //               Stored as: {uploadMutation.data.storedName}
// //             </p>
// //           </div>

// //           <div className="flex flex-col gap-2">
// //             <Button
// //               variant="outline"
// //               size="sm"
// //               onClick={handleViewFile}
// //               className="w-full justify-start"
// //             >
// //               <Eye className="mr-2 h-4 w-4" />
// //               View File (New Tab)
// //             </Button>

// //             <Button
// //               variant="outline"
// //               size="sm"
// //               onClick={handleRedirectToFile}
// //               className="w-full justify-start"
// //             >
// //               <ExternalLink className="mr-2 h-4 w-4" />
// //               Go to File
// //             </Button>

// //             <Button
// //               variant="outline"
// //               size="sm"
// //               onClick={copyUrlToClipboard}
// //               className="w-full justify-start"
// //             >
// //               <Copy className="mr-2 h-4 w-4" />
// //               Copy URL
// //             </Button>
// //           </div>

// //           {uploadMutation.data.mimetype.startsWith("image/") && (
// //             <div className="mt-3">
// //               <p className="text-xs text-green-600 mb-2">Preview:</p>
// //               <img
// //                 src={uploadMutation.data.url}
// //                 alt={uploadMutation.data.filename}
// //                 className="max-w-full h-auto rounded border border-green-300"
// //               />
// //             </div>
// //           )}

// //           {uploadMutation.data.mimetype === "application/pdf" && (
// //             <div className="mt-3">
// //               <p className="text-xs text-green-600 mb-2">Preview:</p>
// //               <iframe
// //                 src={uploadMutation.data.url}
// //                 className="w-full h-64 rounded border border-green-300"
// //                 title={uploadMutation.data.filename}
// //               />
// //             </div>
// //           )}
// //         </div>
// //       )}

// //       {uploadMutation.isError && (
// //         <div className="p-4 bg-red-50 border border-red-200 rounded-md">
// //           <p className="text-sm font-medium text-red-800">Upload failed</p>
// //           <p className="text-xs text-red-600 mt-1">
// //             {uploadMutation.error.message}
// //           </p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
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
// import { Eye, ExternalLink, Copy } from "lucide-react";

// interface FileItem {
//   id: string;
//   filename: string;
//   storedName: string;
//   isPrivate: boolean;
//   mimetype: string;
//   size: number;
//   url: string;
//   createdAt: string;
// }

// export default function FilesPage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [isPrivate, setIsPrivate] = useState(true);

//   // Fetch files
//   const {
//     data: files = [],
//     refetch,
//     isPending,
//   } = useQuery<FileItem[]>({
//     queryKey: ["files"],
//     queryFn: async () => {
//       const res = await fetch("/api/files");
//       if (!res.ok) throw new Error("Failed to fetch files");
//       return res.json();
//     },
//   });

//   // Upload mutation
//   const uploadMutation = useMutation({
//     mutationFn: async () => {
//       if (!file) throw new Error("Select a file first");
//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch(`/api/files?isPrivate=${isPrivate}`, {
//         method: "POST",
//         credentials: "include",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Upload failed");
//       return data;
//     },
//     onSuccess: (data) => {
//       toast.success("Upload successful!");
//       setFile(null);
//       refetch();
//     },
//     onError: (error: any) => {
//       toast.error(error.message || "Upload failed");
//     },
//   });

//   const handleUpload = () => uploadMutation.mutate();

//   const copyToClipboard = (url: string) => {
//     navigator.clipboard.writeText(`${window.location.origin}${url}`);
//     toast.success("Copied URL!");
//   };

//   return (
//     <div className="p-4 max-w-4xl mx-auto space-y-6">
//       <h1 className="text-2xl font-bold">My Files</h1>

//       {/* Upload Section */}
//       <div className="p-4 bg-white rounded-md shadow space-y-3">
//         <Label>Choose File</Label>
//         <Input
//           type="file"
//           onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
//           disabled={uploadMutation.isPending}
//         />
//         {file && (
//           <p className="text-sm text-muted-foreground">
//             {file.name} ({(file.size / 1024).toFixed(2)} KB)
//           </p>
//         )}

//         <div className="flex items-center space-x-2">
//           <Checkbox
//             checked={isPrivate}
//             onCheckedChange={(val) => setIsPrivate(Boolean(val))}
//           />
//           <Label>Private File</Label>
//         </div>

//         <Button
//           onClick={handleUpload}
//           disabled={uploadMutation.isPending || !file}
//         >
//           {uploadMutation.isPending ? "Uploading..." : "Upload"}
//         </Button>
//       </div>

//       {/* Files Table */}
//       <div className="p-4 bg-white rounded-md shadow">
//         {isPending ? (
//           <p>Loading files...</p>
//         ) : files.length === 0 ? (
//           <p>No files uploaded yet.</p>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Filename</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Size</TableHead>
//                 <TableHead>Uploaded At</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {files.map((f) => (
//                 <TableRow key={f.id}>
//                   <TableCell>{f.filename}</TableCell>
//                   <TableCell>{f.isPrivate ? "Private" : "Public"}</TableCell>
//                   <TableCell>{(f.size / 1024).toFixed(2)} KB</TableCell>
//                   <TableCell>
//                     {new Date(f.createdAt).toLocaleString()}
//                   </TableCell>
//                   <TableCell className="flex space-x-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => window.open(f.url, "_blank")}
//                     >
//                       <Eye className="h-4 w-4 mr-1" /> View
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => copyToClipboard(f.url)}
//                     >
//                       <Copy className="h-4 w-4 mr-1" /> Copy
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </div>
//     </div>
//   );
// }

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
