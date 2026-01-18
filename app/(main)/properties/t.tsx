// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { getSession } from "@/lib/client/auth-client";
// import { useProperties } from "@/hooks/services/useProperties";
// import { useFavorites, useToggleFavorite } from "@/hooks/services/useFavourite";
// import AccessDeniedPage from "@/components/access-denied";
// import { Button } from "@/components/ui/button";
// import { Heart, HeartMinusIcon, HeartPlusIcon } from "lucide-react";

// export default function PropertiesTablePage() {
//   const router = useRouter();
//   const [canView, setCanView] = useState<boolean | null>(null);
//   const [canManage, setCanManage] = useState<boolean>(false);

//   // ✅ Check RBAC permissions
//   useEffect(() => {
//     const checkPermissions = async () => {
//       try {
//         const { data: session } = await getSession();

//         if (!session?.user) {
//           router.replace("/login");
//           return;
//         }

//         const role = session.user.role as Role;

//         if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
//           setCanView(false);
//           return;
//         }

//         setCanView(true);
//         setCanManage(hasPermission(role, Permission.MANAGE_PROPERTIES));
//       } catch (err) {
//         console.error(err);
//         router.replace("/login");
//       }
//     };

//     checkPermissions();
//   }, [router]);

//   // Fetch properties & favorites
//   const { data: properties, isLoading, error } = useProperties();
//   const { data: favorites } = useFavorites();
//   const toggleFav = useToggleFavorite();

//   if (canView === null) {
//     return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
//   }
//   if (canView === false) return <AccessDeniedPage />;

//   if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading properties...</div>;
//   if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load properties</div>;

//   return (
//     <div className="max-w-6xl mx-auto py-12 px-4">
//       {/* Create New Property Button */}
//       {canManage && (
//         <div className="mb-6 text-right">
//           <Link href="/properties/new">
//             <Button>Create New Property</Button>
//           </Link>
//         </div>
//       )}

//       {(!properties || properties.length === 0) && (
//         <div className="text-center py-20">
//           <p className="text-muted-foreground mb-4">No properties found.</p>
//           {canManage && (
//             <Link href="/properties/new">
//               <Button>Create Your First Property</Button>
//             </Link>
//           )}
//         </div>
//       )}

//       {properties && properties.length > 0 && (
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Title</TableHead>
//               <TableHead>Location</TableHead>
//               <TableHead>Price</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Favorite</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {properties.map((property: any) => {
//               const isFav = favorites?.includes(property._id);

//               // Status badge colors
//               const statusClass = property.status === "available"
//                 ? "bg-green-100 text-green-800"
//                 : property.status === "pending"
//                   ? "bg-yellow-100 text-yellow-800"
//                   : "bg-gray-100 text-gray-800";

//               return (
//                 <TableRow key={property._id} className="hover:bg-muted">
//                   <TableCell>{property.title}</TableCell>
//                   <TableCell>{property.location}</TableCell>
//                   <TableCell>${Number(property.price).toLocaleString()}</TableCell>
//                   <TableCell>
//                     <span className={`px-2 py-1 rounded text-sm font-medium ${statusClass}`}>
//                       {property.status}
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     <button
//                       onClick={() => toggleFav.mutate({ propertyId: property._id, isFav: !!isFav })}
//                       className="p-1 rounded hover:bg-gray-100 transition"
//                     >
//                       <Heart
//                         size={20}
//                         className={isFav ? "text-red-500" : "text-gray-400"}
//                         fill={isFav ? "currentColor" : "none"} // filled if favorite, empty if not
//                         strokeWidth={2}
//                       />
//                     </button>
//                   </TableCell>
//                   <TableCell>
//                     <Link href={`/properties/${property._id}`} className="text-primary hover:underline">
//                       View
//                     </Link>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Heart, MoreHorizontal, Pencil } from "lucide-react";

import { hasPermission, Permission, Role } from "@/lib/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/client/auth-client";
import { useProperties } from "@/hooks/services/useProperties";
import { useFavorites, useToggleFavorite } from "@/hooks/services/useFavourite";
import AccessDeniedPage from "@/components/access-denied";
import DeletePropertyDialog from "./_components/delete-property";

type Property = {
  _id: string;
  title: string;
  location: string;
  price: number;
  status: string;
};

export default function PropertiesTablePage() {
  const router = useRouter();
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canManage, setCanManage] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Check RBAC permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: session } = await getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const role = session.user.role as Role;

        if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
          setCanView(false);
          return;
        }

        setCanView(true);
        setCanManage(hasPermission(role, Permission.MANAGE_PROPERTIES));
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };

    checkPermissions();
  }, [router]);

  // Fetch properties & favorites
  const { data: properties = [], isLoading, error } = useProperties();
  const { data: favorites } = useFavorites();
  const toggleFav = useToggleFavorite();

  // Define columns
  const columns: ColumnDef<Property>[] = [
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
            onClick={() => toggleFav.mutate({ propertyId: property._id, isFav: !!isFav })}
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
                  <DropdownMenuItem asChild>
                    <DeletePropertyDialog
                      propertyId={property._id}
                      onDelete={(id) => console.log("Delete:", id)}
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

  const table = useReactTable({
    data: properties,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (canView === null) {
    return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
  }
  if (canView === false) return <AccessDeniedPage />;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading properties...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load properties</div>;

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Properties</h1>
        {canManage && (
          <Link href="/properties/new">
            <Button>Create New Property</Button>
          </Link>
        )}
      </div>

      {/* Filters and Column Visibility */}
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selected Rows Info */}
      <div className="flex-1 text-sm text-muted-foreground mb-2">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}