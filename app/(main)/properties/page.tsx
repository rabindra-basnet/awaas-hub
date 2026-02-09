// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import { Search, MapPin, Building2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { getSession } from "@/lib/client/auth-client";
// import AccessDeniedPage from "@/components/access-denied";
// import Loading from "@/components/loading";
// import PropertyListCard from "./_components/property-list-card";
// import { useProperties, useDeleteProperty } from "@/lib/client/queries/properties.queries";

// const ITEMS_PER_PAGE = 12;

// export default function PropertiesPage() {
//   const router = useRouter();
//   const { data: properties = [], isLoading, error } = useProperties();
//   const deleteProperty = useDeleteProperty();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [locationFilter, setLocationFilter] = useState("all");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
  
//   const [permissions, setPermissions] = useState<{
//     canView: boolean | null;
//     canManage: boolean;
//   }>({ canView: null, canManage: false });

//   // Permission Logic
//   useEffect(() => {
//     const checkPermissions = async () => {
//       const { data: session } = await getSession();
//       if (!session?.user) {
//         router.replace("/login");
//         return;
//       }
//       const role = session.user.role as Role;
//       setPermissions({ 
//         canView: hasPermission(role, Permission.VIEW_PROPERTIES), 
//         canManage: hasPermission(role, Permission.MANAGE_PROPERTIES) 
//       });
//     };
//     checkPermissions();
//   }, [router]);

//   // Filtering Logic
//   const filteredProperties = useMemo(() => {
//     return properties.filter((property: any) => {
//       const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesLocation = locationFilter === "all" || property.location.toLowerCase().includes(locationFilter.toLowerCase());
//       const matchesType = typeFilter === "all" || property.category?.toLowerCase() === typeFilter.toLowerCase();
//       return matchesSearch && matchesLocation && matchesType;
//     });
//   }, [properties, searchQuery, locationFilter, typeFilter]);

//   const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
//   const currentData = filteredProperties.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   if (permissions.canView === null || isLoading) return <Loading />;
//   if (!permissions.canView) return <AccessDeniedPage />;

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 min-h-screen">
      
//       {/* HEADER SECTION */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-black uppercase tracking-tight">Explore Properties</h1>
//           <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
//             {filteredProperties.length} Properties found
//           </p>
//         </div>
//         {permissions.canManage && (
//           <Link href="/properties/new">
//             <Button className="rounded-xl font-black text-xs uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
//               <Plus size={16} className="mr-2" /> Create Property
//             </Button>
//           </Link>
//         )}
//       </div>

//       {/* FILTER BAR */}
//       <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-2 rounded-2xl border shadow-sm">
//         <div className="relative flex-1 w-full">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
//           <Input 
//             placeholder="Search by title..." 
//             className="pl-11 h-12 border-none bg-muted/40 focus-visible:ring-1 rounded-xl text-sm font-medium"
//             value={searchQuery}
//             onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
//           />
//         </div>

//         <div className="flex gap-2 w-full md:w-auto">
//           <Select onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
//             <SelectTrigger className="w-full md:w-48 h-12 rounded-xl text-xs font-bold bg-muted/40 border-none">
//               <MapPin className="mr-2 h-4 w-4 text-primary" />
//               <SelectValue placeholder="Location" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Locations</SelectItem>
//               {/* You can map these from unique values in your data */}
//               <SelectItem value="Kathmandu">Kathmandu</SelectItem>
//               <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
//               <SelectItem value="Lalitpur">Lalitpur</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
//             <SelectTrigger className="w-full md:w-48 h-12 rounded-xl text-xs font-bold bg-muted/40 border-none">
//               <Building2 className="mr-2 h-4 w-4 text-primary" />
//               <SelectValue placeholder="Type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="House">House</SelectItem>
//               <SelectItem value="Apartment">Apartment</SelectItem>
//               <SelectItem value="Land">Land</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* PROPERTY GRID */}
//       {currentData.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {currentData.map((property: any) => (
//             <PropertyListCard 
//               key={property._id} 
//               property={property} 
//               canManage={permissions.canManage}
//               onDelete={(id) => deleteProperty.mutate(id)}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
//           <Building2 size={48} className="text-muted-foreground/40 mb-4" />
//           <h3 className="text-lg font-bold">No properties found</h3>
//           <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
//         </div>
//       )}

//       {/* PAGINATION */}
//       {totalPages > 1 && (
//         <div className="flex justify-center items-center gap-3 pt-10 pb-12">
//           <Button
//             variant="outline"
//             disabled={currentPage === 1}
//             onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }}
//             className="rounded-xl h-10 px-5 font-bold"
//           >
//             <ChevronLeft size={16} className="mr-1" /> Prev
//           </Button>
          
//           <div className="flex items-center gap-2 px-5 text-xs font-black bg-card h-10 rounded-xl border">
//             <span className="text-primary">{currentPage}</span>
//             <span className="text-muted-foreground">/</span>
//             <span>{totalPages}</span>
//           </div>

//           <Button
//             variant="outline"
//             disabled={currentPage === totalPages}
//             onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }}
//             className="rounded-xl h-10 px-5 font-bold"
//           >
//             Next <ChevronRight size={16} className="ml-1" />
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }









// "use client";

// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { getSession } from "@/lib/client/auth-client";
// import AccessDeniedPage from "@/components/access-denied";
// import { DataTable } from "./_components/table/data-table";
// import { createColumns } from "./_components/table/columns";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import Loading from "@/components/loading";
// import {
//   useDeleteProperty,
//   useProperties,
//   useToggleFavorite,
// } from "@/lib/client/queries/properties.queries";

// function usePermissionCheck() {
//   const router = useRouter();
//   const [permissions, setPermissions] = useState<{
//     canView: boolean | null;
//     canManage: boolean;
//   }>({ canView: null, canManage: false });

//   useEffect(() => {
//     const checkPermissions = async () => {
//       try {
//         const { data: session } = await getSession();

//         if (!session?.user) {
//           router.replace("/login");
//           return;
//         }

//         const role = session.user.role as Role;
//         const canView = hasPermission(role, Permission.VIEW_PROPERTIES);
//         const canManage = hasPermission(role, Permission.MANAGE_PROPERTIES);

//         setPermissions({ canView, canManage });
//       } catch (error) {
//         console.error("Permission check failed:", error);
//         setPermissions({ canView: false, canManage: false });
//       }
//     };

//     checkPermissions();
//   }, [router]);

//   return permissions;
// }
// function PropertiesContent({ canManage }: { canManage: boolean }) {
//   const { data: properties = [], isLoading, error } = useProperties();
//   const toggleFav = useToggleFavorite();
//   const deleteProperty = useDeleteProperty();

//   const favoriteIds = properties
//     .filter((p: any) => p.isFavorite)
//     .map((p: any) => p._id);

//   const columns = createColumns({
//     canManage,
//     favorites: favoriteIds,
//     onToggleFavorite: (id, isFav) =>
//       toggleFav.mutate({ propertyId: id, isFav }),
//     onDelete: (id) => deleteProperty.mutate(id),
//   });

//   if (isLoading) return <Loading />;

//   if (error) {
//     return (
//       <div className="p-6 text-center">
//         <p className="text-red-500 font-medium">Failed to load properties</p>
//         <p className="text-sm text-gray-600 mt-2">
//           Please try refreshing the page
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-7xl mx-auto py-6 px-5">
//       <DataTable columns={columns} data={properties} canManage={canManage} />
//     </div>
//   );
// }

// // Main page component
// export default function PropertiesTablePage() {
//   const { canView, canManage } = usePermissionCheck();

//   // Still checking permissions
//   if (canView === null) {
//     return <Loading />;
//   }

//   // Access denied
//   if (!canView) {
//     return <AccessDeniedPage />;
//   }

//   // Authorized - show content
//   return <PropertiesContent canManage={canManage} />;
// }








// Sudip Codes
// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import { Search, MapPin, Building2, ChevronLeft, ChevronRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { getSession } from "@/lib/client/auth-client";
// import Loading from "@/components/loading";
// import AccessDeniedPage from "@/components/access-denied";

// import PropertyListCard from "./_components/property-list-card";
// import FloatingAddProperty from "./_components/floating-add-property";
// import { useProperties, useDeleteProperty } from "@/lib/client/queries/properties.queries";

// const ITEMS_PER_PAGE = 12;

// // Generating 36 items total to show exactly 3 pages
// const DUMMY_PROPERTIES = Array.from({ length: 35 }).map((_, index) => ({
//   _id: `prop-dummy-${index + 1}`,
//   title: ["Modern Loft", "Garden Villa", "Penthouse Suite", "Suburban Home", "Land Plot"][index % 5],
//   location: ["Kathmandu", "Lalitpur", "Bhaktapur"][index % 3],
//   price: 12000000 + (index * 400000),
//   status: index % 4 === 0 ? "Sold" : index % 6 === 0 ? "Booked" : "Available",
//   images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa"],
// }));

// export default function PropertiesPage() {
//   const router = useRouter();
//   const { data: realProperties = [], isLoading } = useProperties();
//   const deleteProperty = useDeleteProperty();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [locationFilter, setLocationFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
  
//   const [permissions, setPermissions] = useState<{ canView: boolean | null; canManage: boolean }>({ 
//     canView: null, 
//     canManage: false 
//   });

//   useEffect(() => {
//     getSession().then(({ data: session }) => {
//       if (!session?.user) return router.replace("/login");
//       const role = session.user.role as Role;
//       setPermissions({ 
//         canView: hasPermission(role, Permission.VIEW_PROPERTIES), 
//         canManage: hasPermission(role, Permission.MANAGE_PROPERTIES) 
//       });
//     });
//   }, [router]);

//   // Combine real and dummy data
//   const allProperties = useMemo(() => [...realProperties, ...DUMMY_PROPERTIES], [realProperties]);

//   const filteredProperties = useMemo(() => {
//     return allProperties.filter((p: any) => {
//       const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesLocation = locationFilter === "all" || p.location.toLowerCase().includes(locationFilter.toLowerCase());
//       return matchesSearch && matchesLocation;
//     });
//   }, [allProperties, searchQuery, locationFilter]);

//   const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
//   const currentData = filteredProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

//   if (permissions.canView === null || isLoading) return <Loading />;
//   if (!permissions.canView) return <AccessDeniedPage />;

//   return (
//     <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-6 py-6 space-y-6 min-h-screen">
      
//       {/* FLOATING ACTION ICON */}
//       {permissions.canManage && <FloatingAddProperty />}

//       {/* FILTER BAR - Reduced height (h-10) and compact design */}
//       <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-2 rounded-2xl border shadow-sm max-w-5xl mx-auto">
//         <div className="relative flex-1 w-full">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
//           <Input 
//             placeholder="Search properties..." 
//             className="pl-9 h-10 border-none bg-muted/40 focus-visible:ring-1 rounded-lg text-sm"
//             value={searchQuery}
//             onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
//           />
//         </div>

//         <Select onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
//           <SelectTrigger className="w-full md:w-48 h-10 rounded-lg text-xs font-bold bg-muted/20 border-none">
//             <MapPin className="mr-2 h-3.5 w-3.5 text-primary" />
//             <SelectValue placeholder="Location" />
//           </SelectTrigger>
//           <SelectContent className="rounded-xl">
//             <SelectItem value="all">All Locations</SelectItem>
//             <SelectItem value="Kathmandu">Kathmandu</SelectItem>
//             <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
//             <SelectItem value="Lalitpur">Lalitpur</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* GRID - Exactly 3 columns on desktop */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {currentData.map((property: any) => (
//           <PropertyListCard 
//             key={property._id} 
//             property={property} 
//             canManage={permissions.canManage}
//             onDelete={(id: string) => deleteProperty.mutate(id)}
//           />
//         ))}
//       </div>

//       {/* PAGINATION */}
//       {totalPages > 1 && (
//         <div className="flex justify-center items-center gap-3 pt-6 pb-10">
//           <Button 
//             variant="outline" size="sm" 
//             disabled={currentPage === 1} 
//             onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
//             className="h-9 px-4 rounded-lg font-bold"
//           >
//             <ChevronLeft size={16} className="mr-1" /> Previous
//           </Button>
          
//           <div className="flex items-center gap-2 px-4 text-xs font-black bg-muted/50 h-9 rounded-lg border">
//             <span className="text-primary">{currentPage}</span> / {totalPages}
//           </div>

//           <Button 
//             variant="outline" size="sm" 
//             disabled={currentPage === totalPages} 
//             onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
//             className="h-9 px-4 rounded-lg font-bold"
//           >
//             Next <ChevronRight size={16} className="ml-1" />
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }





"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getSession } from "@/lib/client/auth-client";
import Loading from "@/components/loading";
import AccessDeniedPage from "@/components/access-denied";

import PropertyListCard from "./_components/property-list-card";
import FloatingAddProperty from "./_components/floating-add-property";
import { useProperties, useDeleteProperty } from "@/lib/client/queries/properties.queries";

const ITEMS_PER_PAGE = 12;

// Generating 36 items for 3-page pagination demo
const DUMMY_PROPERTIES = Array.from({ length: 36 }).map((_, index) => ({
  _id: `prop-dummy-${index + 1}`,
  title: ["Modern Loft", "Garden Villa", "Penthouse Suite", "Suburban Home", "Land Plot"][index % 5],
  location: ["Kathmandu", "Lalitpur", "Bhaktapur"][index % 3],
  category: ["House", "Apartment", "Land", "Colony"][index % 4],
  price: 12000000 + (index * 400000),
  status: index % 5 === 0 ? "Sold" : index % 8 === 0 ? "Booked" : "Available",
  images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa"],
}));

export default function PropertiesPage() {
  const router = useRouter();
  const { data: realProperties = [], isLoading } = useProperties();
  const deleteProperty = useDeleteProperty();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [permissions, setPermissions] = useState<{ canView: boolean | null; canManage: boolean }>({ 
    canView: null, 
    canManage: false 
  });

  useEffect(() => {
    getSession().then(({ data: session }) => {
      if (!session?.user) return router.replace("/login");
      const role = session.user.role as Role;
      setPermissions({ 
        canView: hasPermission(role, Permission.VIEW_PROPERTIES), 
        canManage: hasPermission(role, Permission.MANAGE_PROPERTIES) 
      });
    });
  }, [router]);

  const allProperties = useMemo(() => [...realProperties, ...DUMMY_PROPERTIES], [realProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p: any) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === "all" || p.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType = typeFilter === "all" || p.category?.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [allProperties, searchQuery, locationFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const currentData = filteredProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (permissions.canView === null || isLoading) return <Loading />;
  if (!permissions.canView) return <AccessDeniedPage />;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-6 py-6 space-y-6 min-h-screen">
      
      {permissions.canManage && <FloatingAddProperty />}

      {/* FILTER BAR - Expanded to fit the 3-column grid width */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-background p-2 rounded-xl border shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search properties..." 
            className="pl-9 h-10 border-none bg-muted/40 focus-visible:ring-1 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-45 h-10 rounded-lg text-xs font-bold">
              <MapPin className="mr-2 h-3.5 w-3.5 text-primary" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Kathmandu">Kathmandu</SelectItem>
              <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
              <SelectItem value="Lalitpur">Lalitpur</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-45 h-10 rounded-lg text-xs font-bold">
              <Building2 className="mr-2 h-3.5 w-3.5 text-primary" />
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="House">House</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
              <SelectItem value="Colony">Colony</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* GRID: 3 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.map((property: any) => (
          <PropertyListCard 
            key={property._id} 
            property={property} 
            canManage={permissions.canManage}
            onDelete={(id: string) => deleteProperty.mutate(id)}
          />
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6 pb-12">
          <Button 
            variant="outline" size="sm" 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }} 
            className="h-9 px-4 rounded-lg font-bold"
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>
          
          <div className="flex items-center gap-2 px-4 text-xs font-black bg-muted/50 h-9 rounded-lg border">
            <span className="text-primary">{currentPage}</span> / {totalPages}
          </div>

          <Button 
            variant="outline" size="sm" 
            disabled={currentPage === totalPages} 
            onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }} 
            className="h-9 px-4 rounded-lg font-bold"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}