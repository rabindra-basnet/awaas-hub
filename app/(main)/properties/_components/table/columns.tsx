// "use client";

// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, MoreHorizontal, Pencil, Heart } from "lucide-react";
// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import DeletePropertyDialog from "../delete-property";
// import { toast } from "sonner";

// export type Property = {
//   _id: string;
//   title: string;
//   location: string;
//   price: number;
//   status: string;
// };

// interface ColumnsConfig {
//   canManage: boolean;
//   favorites: string[];
//   onToggleFavorite: (propertyId: string, isFav: boolean) => void;
//   onDelete: (id: string) => void;
// }

// export const createColumns = ({
//   canManage,
//   favorites,
//   onToggleFavorite,
//   onDelete,
// }: ColumnsConfig): ColumnDef<Property>[] => [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "title",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Title
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => (
//       <div className="font-medium">{row.getValue("title")}</div>
//     ),
//   },
//   {
//     accessorKey: "location",
//     header: "Location",
//     cell: ({ row }) => <div>{row.getValue("location")}</div>,
//   },
//   {
//     accessorKey: "price",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Price
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => {
//       const price = parseFloat(row.getValue("price"));
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "NPR",
//       }).format(price);
//       return <div className="font-medium">{formatted}</div>;
//     },
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => {
//       const status = row.getValue("status") as string;
//       const statusClass =
//         status === "available"
//           ? "bg-green-100 text-green-800"
//           : status === "pending"
//             ? "bg-yellow-100 text-yellow-800"
//             : "bg-gray-100 text-gray-800";

//       return (
//         <span
//           className={`px-2 py-1 rounded text-sm font-medium ${statusClass}`}
//         >
//           {status}
//         </span>
//       );
//     },
//   },
//   {
//     id: "appointment",
//     header: "Appointment",
//     cell: ({ row }) => {
//       const property = row.original;
//       return (
//         <Link href={`/appointments/new?propertyId=${property._id}`}>
//           <Button size="sm" variant="outline">
//             Book
//           </Button>
//         </Link>
//       );
//     },
//   },
//   // {
//   //   id: "actions",
//   //   header: "Actions",
//   //   enableHiding: false,
//   //   cell: ({ row }) => {
//   //     const property = row.original;

//   //     return (
//   //       <div className="flex items-center gap-2">
//   //         {/* View Button */}
//   //         <Link href={`/properties/${property._id}`}>
//   //           <Button variant="ghost" size="sm">
//   //             View
//   //           </Button>
//   //         </Link>

//   //         {/* Dropdown Actions */}
//   //         {canManage && (
//   //           <DropdownMenu>
//   //             <DropdownMenuTrigger asChild>
//   //               <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//   //                 <span className="sr-only">Open actions menu</span>
//   //                 <MoreHorizontal className="h-4 w-4" />
//   //               </Button>
//   //             </DropdownMenuTrigger>

//   //             <DropdownMenuContent align="end" className="min-w-37.5">
//   //               <DropdownMenuLabel>Actions</DropdownMenuLabel>

//   //               {/* Copy ID */}
//   //               <DropdownMenuItem
//   //                 onClick={() => {
//   //                   navigator.clipboard.writeText(property._id);
//   //                   toast.success("Property ID copied!");
//   //                 }}
//   //               >
//   //                 Copy property ID
//   //               </DropdownMenuItem>

//   //               <DropdownMenuSeparator />

//   //               {/* Edit Link */}
//   //               <DropdownMenuItem asChild>
//   //                 <Link
//   //                   href={`/properties/${property._id}/edit`}
//   //                   className="flex items-center gap-2"
//   //                 >
//   //                   <Pencil className="h-4 w-4" />
//   //                   Edit
//   //                 </Link>
//   //               </DropdownMenuItem>

//   //               {/* Delete Button/Dialog */}
//   //               <DropdownMenuItem className="p-0">
//   //                 <DeletePropertyDialog
//   //                   propertyId={property._id}
//   //                   onDelete={onDelete}
//   //                 />
//   //                 Delete
//   //               </DropdownMenuItem>
//   //             </DropdownMenuContent>
//   //           </DropdownMenu>
//   //         )}
//   //       </div>
//   //     );
//   //   },
//   // }
//   {
//     id: "actions",
//     header: "Actions",
//     enableHiding: false,
//     cell: ({ row }) => {
//       const property = row.original;

//       return (
//         <div className="flex items-center gap-2">
//           {/* View Button */}
//           <Link href={`/properties/${property._id}`}>
//             <Button variant="outline" size="sm">
//               View
//             </Button>
//           </Link>

//           {/* Dropdown Actions */}
//           {canManage && (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" className="h-8 w-8 p-0">
//                   <span className="sr-only">Open actions menu</span>
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end" className="w-48">
//                 <DropdownMenuLabel>Actions</DropdownMenuLabel>

//                 {/* Copy ID */}
//                 <DropdownMenuItem
//                   onClick={() => {
//                     navigator.clipboard.writeText(property._id);
//                     toast.success("Property ID copied!");
//                   }}
//                   className="cursor-pointer"
//                 >
//                   Copy property ID
//                 </DropdownMenuItem>

//                 <DropdownMenuSeparator />

//                 {/* Edit Link */}
//                 <DropdownMenuItem asChild>
//                   <Link
//                     href={`/properties/${property._id}/edit`}
//                     className="flex items-center gap-2 cursor-pointer"
//                   >
//                     <Pencil className="h-4 w-4" />
//                     <span>EDIT</span>
//                   </Link>
//                 </DropdownMenuItem>

//                 {/* Delete Button/Dialog */}
//                 <DropdownMenuItem
//                   onSelect={(e) => e.preventDefault()}
//                   className="focus:bg-red-50 focus:text-red-600"
//                 >
//                   <DeletePropertyDialog
//                     propertyId={property._id}
//                     onDelete={onDelete}
//                   />{" "}
//                   <span>DELETE</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//       );
//     },
//   },
// ];
