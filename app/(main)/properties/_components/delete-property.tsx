"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface DeletePropertyDialogProps {
  propertyId: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function DeletePropertyDialog({
  propertyId,
  onDelete,
  isDeleting = false,
}: DeletePropertyDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete(propertyId);
    setIsOpen(false);
    router.replace("/properties");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
          disabled={isDeleting}
        >
          <Trash2 size={20} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Property</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this property? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
