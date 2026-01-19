"use client";

import { Table } from "@tanstack/react-table";
import Link from "next/link";
import { ChevronDown, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    canManage: boolean;
}

export function DataTableToolbar<TData>({
    table,
    canManage,
}: DataTableToolbarProps<TData>) {
    const isFiltered =
        table.getState().columnFilters.length > 0 ||
        table.getState().sorting.length > 0;

    return (
        <div className="flex items-center gap-4 w-full">
            {/* Page size */}
            <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground">Select</span>
                <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(v) => table.setPageSize(Number(v))}
                >
                    <SelectTrigger className="h-8 w-17.5">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 25, 50, 100].map((n) => (
                            <SelectItem key={n} value={`${n}`}>
                                {n}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
            </div>

            {/* Filter */}
            <Input
                placeholder="Filter title..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(e) =>
                    table.getColumn("title")?.setFilterValue(e.target.value)
                }
                className="h-8 w-62.5"
            />

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
                {/* Reset */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        table.reset();
                    }}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                </Button>

                {/* Columns */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((c) => c.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(v) =>
                                        column.toggleVisibility(!!v)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Create */}
                {canManage && (
                    <Link href="/properties/new">
                        <Button size="sm">Create Property</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
