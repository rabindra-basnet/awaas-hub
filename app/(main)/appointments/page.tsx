"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProperties } from "@/lib/client/queries/properties.queries";
import Loading from "@/components/loading";
import AppointmentDetailsCard from "./_components/appointment-details-card";
// import AppointmentDetailsCard from "./_components/appointment-details-card";

const ITEMS_PER_PAGE = 12;

// Generating 23 Dummy items to complement the 1 real item from backend
const DUMMY_DATA = Array.from({ length: 23 }).map((_, index) => ({
  _id: `dummy-${index + 1}`,
  title: [
    "Modern Luxury Villa",
    "Comfortable Apartment",
    "Spacious Family Home",
    "Urban Studio",
    "Premium Land Plot",
    "Heritage Colony House",
  ][index % 6],
  location: ["Kathmandu", "Lalitpur", "Bhaktapur"][index % 3],
  price: 15000000 + index * 500000,
  category: ["House", "Apartment", "Land", "Colony"][index % 4],
  status: index % 5 === 0 ? "Sold" : index % 7 === 0 ? "Booked" : "Available",
  images: [
    `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop`,
  ],
}));

export default function AppointmentsPage() {
  const { data: realProperties = [], isLoading } = useProperties();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Combine Real Data with Dummy Data
  const allProperties = useMemo(() => {
    return [...realProperties, ...DUMMY_DATA];
  }, [realProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property: any) => {
      const matchesSearch = property.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLocation =
        locationFilter === "all" ||
        property.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        property.category?.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [allProperties, searchQuery, locationFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const currentData = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-350 mx-auto px-6 py-6 space-y-4 min-h-screen font-sans antialiased">
      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-background p-2 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            placeholder="Search properties..."
            className="pl-9 h-10 border-none bg-muted/40 focus-visible:ring-1 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select
            onValueChange={(v) => {
              setLocationFilter(v);
              setCurrentPage(1);
            }}
          >
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

          <Select
            onValueChange={(v) => {
              setTypeFilter(v);
              setCurrentPage(1);
            }}
          >
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

      {/* GRID: 3 COLUMNS PER ROW, 12 CARDS TOTAL ON PAGE 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.map((property: any) => (
          <AppointmentDetailsCard key={property._id} property={property} />
        ))}
      </div>

      {/* PAGINATION: Will now show Page 1 and Page 2 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6 pb-8">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-lg font-bold"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((prev) => prev - 1);
              window.scrollTo(0, 0);
            }}
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-2 px-4 text-xs font-black bg-muted/50 h-9 rounded-lg border">
            <span className="text-primary">{currentPage}</span>
            <span className="text-muted-foreground">/</span>
            <span>{totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-lg font-bold"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
              window.scrollTo(0, 0);
            }}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
