"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Heart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeletePropertyDialog from "../delete-property";


export type Property = {
    _id: string;
    title: string;
    location: string;
    price: number;
    status: string;
};

interface ColumnsConfig {
    canManage: boolean;
    favorites: string[];
    onToggleFavorite: (propertyId: string, isFav: boolean) => void;
    onDelete: (id: string) => void;
}

export const createColumns = ({
    canManage,
    favorites,
    onToggleFavorite,
    onDelete,
}: ColumnsConfig): ColumnDef<Property>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => <div>{row.getValue("location")}</div>,
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"));
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price);
                return <div className="font-medium">{formatted}</div>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const statusClass =
                    status === "available"
                        ? "bg-green-100 text-green-800"
                        : status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800";

                return (
                    <span className={`px-2 py-1 rounded text-sm font-medium ${statusClass}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            id: "favorite",
            header: "Favorite",
            cell: ({ row }) => {
                const property = row.original;
                const isFav = favorites?.includes(property._id);

                return (
                    <button
                        onClick={() => onToggleFavorite(property._id, !!isFav)}
                        className="p-1 rounded hover:bg-gray-100 transition"
                    >
                        <Heart
                            size={20}
                            className={isFav ? "text-red-500" : "text-gray-400"}
                            fill={isFav ? "currentColor" : "none"}
                            strokeWidth={2}
                        />
                    </button>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
                const property = row.original;

                return (
                    <div className="flex items-center gap-2">
                        <Link href={`/properties/${property._id}`}>
                            <Button variant="ghost" size="sm">
                                View
                            </Button>
                        </Link>
                        {canManage && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => navigator.clipboard.writeText(property._id)}
                                    >
                                        Copy property ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/properties/${property._id}/edit`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="p-0"
                                    >
                                        <DeletePropertyDialog
                                            propertyId={property._id}
                                            onDelete={onDelete}
                                        />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                );
            },
        },
    ];