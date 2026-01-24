// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { MoreHorizontal, Eye, Copy, Trash } from "lucide-react";
// import { FileItem } from "../page";

// interface Props {
//   files: FileItem[];
//   isLoading: boolean;
//   onView: (storedName: string) => void;
//   onCopy: (storedName: string) => void;
//   onDelete: (storedName: string) => void;
// }

// export function FilesTable({
//   files,
//   isLoading,
//   onView,
//   onCopy,
//   onDelete,
// }: Props) {
//   return (
//     <div className="p-4 bg-slate-900 rounded-md shadow-md">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Filename</TableHead>
//             <TableHead>Privacy</TableHead>
//             <TableHead>Size</TableHead>
//             <TableHead>Property</TableHead>
//             <TableHead>Uploaded</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {isLoading ? (
//             [...Array(5)].map((_, i) => (
//               <TableRow key={i}>
//                 <TableCell colSpan={6}>
//                   <div className="h-8 bg-slate-800 animate-pulse rounded" />
//                 </TableCell>
//               </TableRow>
//             ))
//           ) : files.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={6} className="text-center py-8">
//                 No files uploaded
//               </TableCell>
//             </TableRow>
//           ) : (
//             files.map((f) => (
//               <TableRow key={f._id}>
//                 <TableCell>{f.filename}</TableCell>
//                 <TableCell>{f.isPrivate ? "Private" : "Public"}</TableCell>
//                 <TableCell>{(f.size / 1024).toFixed(2)} KB</TableCell>
//                 <TableCell>{f.propertyId || "-"}</TableCell>
//                 <TableCell>{new Date(f.createdAt).toLocaleString()}</TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon">
//                         <MoreHorizontal />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem onClick={() => onView(f.storedName)}>
//                         <Eye className="mr-2 h-4 w-4" /> View
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => onCopy(f.storedName)}>
//                         <Copy className="mr-2 h-4 w-4" /> Copy URL
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         className="text-destructive"
//                         onClick={() => onDelete(f.storedName)}
//                       >
//                         <Trash className="mr-2 h-4 w-4" /> Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Copy, Trash } from "lucide-react";
import type { FileItem } from "../page";
import { useRouter } from "next/navigation";

interface Props {
  files: FileItem[];
  isLoading: boolean;
  onView: (storedName: string) => void;
  onCopy: (storedName: string) => void;
  onDelete: (storedName: string) => void;
}

export function FilesTable({
  files,
  isLoading,
  onView,
  onCopy,
  onDelete,
}: Props) {
  const router = useRouter();
  console.log(files);
  return (
    <div className="rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[260px]">Filename</TableHead>
            <TableHead>Privacy</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <div className="h-6 w-full animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))
          ) : files.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No files uploaded
              </TableCell>
            </TableRow>
          ) : (
            files.map((f) => (
              <TableRow
                onClick={() => router.push(`/files/${f.filename}`)}
                key={f._id || crypto.randomUUID()}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium truncate max-w-65">
                  {f.filename}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      f.isPrivate
                        ? "bg-red-500/10 text-red-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {f.isPrivate ? "Private" : "Public"}
                  </span>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {(f.size / 1024).toFixed(2)} KB
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {f.propertyId || "—"}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {new Date(f.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => onView(f.storedName)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onCopy(f.storedName)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(f.storedName)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
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
  );
}
