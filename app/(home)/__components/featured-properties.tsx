


// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { ArrowRight, CheckCircle, MapPin } from "lucide-react";
// import { useLanguage } from "@/hooks/use-language";

// export interface FeaturedProperty {
//   _id: string;
//   title: string;
//   location: string;
//   price: number;
//   category: string;
//   bedrooms?: number;
//   bathrooms?: number;
//   images?: Array<string | { url?: string }>;
// }

// interface FeaturedPropertiesProps {
//   properties: FeaturedProperty[];
// }

// const FALLBACK_IMAGE =
//   "https://images.unsplash.com/photo-1560518883-ce09059eeffa";

// function getImageUrl(property: FeaturedProperty): string {
//   if (!Array.isArray(property.images) || property.images.length === 0) {
//     return FALLBACK_IMAGE;
//   }
//   const firstImage = property.images[0];
//   if (typeof firstImage === "string" && firstImage.trim()) {
//     return firstImage;
//   }
//   if (
//     typeof firstImage === "object" &&
//     firstImage !== null &&
//     typeof firstImage.url === "string" &&
//     firstImage.url.trim()
//   ) {
//     return firstImage.url;
//   }
//   return FALLBACK_IMAGE;
// }

// export default function FeaturedProperties({
//   properties,
// }: FeaturedPropertiesProps) {
//   const { t } = useLanguage();

//   return (
//     <section id="properties" className="relative h-full py-16 px-6 bg-linear-to-br from-background to-muted/30 dark:from-background dark:to-muted/10 overflow-hidden">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-12 flex items-center justify-between">
//           <div>
//             <h2 className="mb-2 text-4xl font-bold text-foreground">
//               {t("properties.title")}
//             </h2>
//             <p className="text-muted-foreground">{t("properties.subtitle")}</p>
//           </div>

//           <Link
//             href="/properties"
//             className="group hidden items-center gap-2 font-semibold text-primary transition hover:opacity-80 sm:flex"
//           >
//             {t("properties.viewAll")}
//             <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>

//         <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
//           {properties.map((property) => (
//             <Link
//               href={`/properties/${property._id}`}
//               key={property._id}
//               className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
//             >
//               <div className="relative h-64 overflow-hidden bg-muted">
//                 <Image
//                   src={getImageUrl(property)}
//                   alt={property.title}
//                   fill
//                   loading="eager"
//                   className="object-cover transition-transform duration-500 group-hover:scale-110"
//                 />

//                 <div className="absolute left-4 top-4 flex gap-2">
//                   <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
//                     {property.category}
//                   </span>

//                   <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
//                     <CheckCircle className="h-4 w-4" />
//                     {t("properties.verified")}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <h3 className="mb-2 line-clamp-1 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
//                   {property.title}
//                 </h3>

//                 <div className="mb-4 flex items-center text-muted-foreground">
//                   <MapPin className="mr-1 h-4 w-4 shrink-0" />
//                   <span className="line-clamp-1 text-sm">
//                     {property.location}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between border-t border-border pt-4">
//                   <div className="flex gap-4 text-sm text-muted-foreground">
//                     {typeof property.bedrooms === "number" &&
//                     property.bedrooms > 0 ? (
//                       <span>{property.bedrooms} {t("properties.beds")}</span>
//                     ) : null}

//                     <span>{property.bathrooms ?? 0} {t("properties.baths")}</span>
//                   </div>

//                   <div className="text-xl font-bold text-primary">
//                     {t("properties.pricePrefix")} {Number(property.price ?? 0).toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export interface FeaturedProperty {
  _id: string;
  title: string;
  location: string;
  price: number;
  category: string;
  bedrooms?: number;
  bathrooms?: number;
  images?: Array<string | { url?: string }>;
}

interface FeaturedPropertiesProps {
  properties: FeaturedProperty[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa";

function getImageUrl(property: FeaturedProperty): string {
  if (!Array.isArray(property.images) || property.images.length === 0) {
    return FALLBACK_IMAGE;
  }
  const firstImage = property.images[0];

  if (typeof firstImage === "string" && firstImage.trim()) {
    return firstImage;
  }

  if (
    typeof firstImage === "object" &&
    firstImage !== null &&
    typeof firstImage.url === "string" &&
    firstImage.url.trim()
  ) {
    return firstImage.url;
  }

  return FALLBACK_IMAGE;
}

export default function FeaturedProperties({
  properties,
}: FeaturedPropertiesProps) {
  const { t } = useLanguage();

  return (
    <section
      id="properties"
      className="relative py-20 px-6 bg-background"
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl lg:text-4xl font-bold text-foreground">
              {t("properties.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("properties.subtitle")}
            </p>
          </div>

          <Link
            href="/properties"
            className="group hidden sm:flex items-center gap-2 font-semibold text-primary hover:opacity-80 transition"
          >
            {t("properties.viewAll")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              href={`/properties/${property._id}`}
              key={property._id}
              className="
                group relative overflow-hidden rounded-2xl
                border border-border/60
                bg-card/70 dark:bg-card/50
                backdrop-blur-md
                shadow-sm
                hover:-translate-y-2 hover:shadow-2xl
                dark:hover:shadow-primary/10
                transition-all duration-300
              "
            >
              {/* IMAGE */}
              <div className="relative h-64 overflow-hidden bg-muted">
                <Image
                  src={getImageUrl(property)}
                  alt={property.title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* IMAGE OVERLAY GRADIENT (IMPORTANT FIX) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* BADGES */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur">
                    {property.category}
                  </span>

                  <span className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t("properties.verified")}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {property.title}
                </h3>

                <div className="mb-4 flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4 shrink-0" />
                  <span className="line-clamp-1 text-sm">
                    {property.location}
                  </span>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    {typeof property.bedrooms === "number" &&
                    property.bedrooms > 0 ? (
                      <span>{property.bedrooms} {t("properties.beds")}</span>
                    ) : null}

                    <span>
                      {property.bathrooms ?? 0} {t("properties.baths")}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-primary">
                    {t("properties.pricePrefix")}{" "}
                    {Number(property.price ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}