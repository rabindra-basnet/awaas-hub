// import React from 'react'
// import Image from 'next/image'
// import { MapPin, CheckCircle, ArrowRight } from 'lucide-react'

// interface Property {
//     id: number
//     title: string
//     location: string
//     price: string
//     type: string
//     beds: number
//     baths: number
//     image: string
//     verified: boolean
// }

// interface FeaturedPropertiesProps {
//     properties: Property[]
// }

// const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
//     properties
// }) => {
//     return (
//         <section id="properties" className="py-20 px-4 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-7xl">
//                 {/* Header */}
//                 <div className="mb-12 flex items-center justify-between">
//                     <div>
//                         <h2 className="mb-2 text-4xl font-bold text-foreground">
//                             Featured Properties
//                         </h2>
//                         <p className="text-muted-foreground">
//                             Handpicked properties just for you
//                         </p>
//                     </div>

//                     <button className="group hidden sm:flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition">
//                         View All
//                         <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
//                     </button>
//                 </div>

//                 {/* Grid */}
//                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//                     {properties.map(property => (
//                         <div
//                             key={property.id}
//                             className="
//                 group overflow-hidden rounded-2xl
//                 border border-border bg-card
//                 shadow-sm transition-all duration-300
//                 hover:-translate-y-2 hover:shadow-xl
//               "
//                         >
//                             {/* Image */}
//                             <div className="relative h-64 overflow-hidden">
//                                 <Image
//                                     src={property.image}
//                                     alt={property.title}
//                                     fill
//                                     className="object-cover transition-transform duration-500 group-hover:scale-110"
//                                 />

//                                 <div className="absolute left-4 top-4 flex gap-2">
//                                     <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
//                                         {property.type}
//                                     </span>

//                                     {property.verified && (
//                                         <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
//                                             <CheckCircle className="h-4 w-4" />
//                                             Verified
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Content */}
//                             <div className="p-6">
//                                 <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
//                                     {property.title}
//                                 </h3>

//                                 <div className="mb-4 flex items-center text-muted-foreground">
//                                     <MapPin className="mr-1 h-4 w-4" />
//                                     <span className="text-sm">{property.location}</span>
//                                 </div>

//                                 <div className="flex items-center justify-between border-t border-border pt-4">
//                                     <div className="flex gap-4 text-sm text-muted-foreground">
//                                         {property.beds > 0 && <span>{property.beds} Beds</span>}
//                                         <span>{property.baths} Baths</span>
//                                     </div>

//                                     <div className="text-xl font-bold text-primary">
//                                         {property.price}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default FeaturedProperties

// import React from 'react'
// import Image from 'next/image'
// import { MapPin, CheckCircle, ArrowRight } from 'lucide-react'

// interface Property {
//     id: number
//     title: string
//     location: string
//     price: string
//     type: string
//     beds: number
//     baths: number
//     image: string
//     verified: boolean
// }

// interface FeaturedPropertiesProps {
//     properties: Property[]
// }

// const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
//     properties
// }) => {
//     return (
//         <section id="properties" className="py-20 px-4 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-7xl">
//                 {/* Header */}
//                 <div className="mb-12 flex items-center justify-between">
//                     <div>
//                         <h2 className="mb-2 text-4xl font-bold text-foreground">
//                             Featured Properties
//                         </h2>
//                         <p className="text-muted-foreground">
//                             Handpicked properties just for you
//                         </p>
//                     </div>

//                     <button className="group hidden sm:flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition">
//                         View All
//                         <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
//                     </button>
//                 </div>

//                 {/* Grid */}
//                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//                     {properties.map(property => (
//                         <div
//                             key={property.id}
//                             className="
//                 group overflow-hidden rounded-2xl
//                 border border-border bg-card
//                 shadow-sm transition-all duration-300
//                 hover:-translate-y-2 hover:shadow-xl
//               "
//                         >
//                             {/* Image */}
//                             <div className="relative h-64 overflow-hidden">
//                                 <Image
//                                     src={property.image}
//                                     alt={property.title}
//                                     fill
//                                     className="object-cover transition-transform duration-500 group-hover:scale-110"
//                                 />

//                                 <div className="absolute left-4 top-4 flex gap-2">
//                                     <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
//                                         {property.type}
//                                     </span>

//                                     {property.verified && (
//                                         <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
//                                             <CheckCircle className="h-4 w-4" />
//                                             Verified
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Content */}
//                             <div className="p-6">
//                                 <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
//                                     {property.title}
//                                 </h3>

//                                 <div className="mb-4 flex items-center text-muted-foreground">
//                                     <MapPin className="mr-1 h-4 w-4" />
//                                     <span className="text-sm">{property.location}</span>
//                                 </div>

//                                 <div className="flex items-center justify-between border-t border-border pt-4">
//                                     <div className="flex gap-4 text-sm text-muted-foreground">
//                                         {property.beds > 0 && <span>{property.beds} Beds</span>}
//                                         <span>{property.baths} Baths</span>
//                                     </div>

//                                     <div className="text-xl font-bold text-primary">
//                                         {property.price}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default FeaturedProperties

// FeaturedProperties - dark mode fixed
"use client";

import React from "react";
import Image from "next/image";
import { MapPin, CheckCircle, ArrowRight } from "lucide-react";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  image: string;
  verified: boolean;
}

interface FeaturedPropertiesProps {
  properties: Property[];
}
export default function FeaturedProperties({
  properties,
}: FeaturedPropertiesProps) {
  return (
    <section className="w-full py-16 px-4 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-[oklch(0.18_0.02_220)] dark:via-background dark:to-[oklch(0.19_0.015_280)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-4xl font-bold text-foreground">
              Featured Properties
            </h2>
            <p className="text-muted-foreground">
              Handpicked properties just for you
            </p>
          </div>

          <button className="group hidden sm:flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition">
            View All
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="
                group overflow-hidden rounded-2xl
                border border-border bg-card
                shadow-sm transition-all duration-300
                hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-primary/10
              "
            >
              <div className="relative h-64 overflow-hidden bg-muted">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute left-4 top-4 flex gap-2">
                  <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                    {property.type}
                  </span>

                  {property.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {property.title}
                </h3>

                <div className="mb-4 flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {property.beds > 0 && <span>{property.beds} Beds</span>}
                    <span>{property.baths} Baths</span>
                  </div>

                  <div className="text-xl font-bold text-primary">
                    {property.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
