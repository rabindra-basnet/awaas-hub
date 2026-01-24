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
  canManage: boolean;
}

export function FilesTable({
  files,
  isLoading,
  onView,
  onCopy,
  onDelete,
  canManage,
}: Props) {
  const router = useRouter();
  console.log(files);
  return (
    <div className="rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-65">Filename</TableHead>
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

                      {canManage && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(f.storedName)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
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
