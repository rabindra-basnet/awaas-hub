// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Property } from "@/types/index";
// import {
//   MapPin,
//   Ruler,
//   Building2,
//   Share2,
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   CheckCircle2,
//   Lock,
//   Crown,
//   Navigation,
//   Layers,
//   Map as MapIcon,
//   Banknote,
//   Calendar,
//   Info,
//   Hospital,
//   Plane,
//   ShoppingCart,
//   School,
//   Dumbbell,
//   Bus,
//   Utensils,
//   Wallet,
// } from "lucide-react";

// // Shadcn UI Imports
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface PropertyDetailsCardProps {
//   property: Property;
//   isFavorite?: boolean;
//   // Removed hardcoded props to handle logic internally as requested
// }

// export default function PropertyDetailsCard({
//   property,
// }: PropertyDetailsCardProps) {
//   const router = useRouter();
//   const { title, _id, images = [] } = property;
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // --- FAVORITE LOGIC START ---
//   const [isFavorite, setIsFavorite] = useState(false);

//   // Check if property is favorited on load
//   useEffect(() => {
//     const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
//     setIsFavorite(favorites.includes(_id));
//   }, [_id]);

//   const onToggleFavorite = () => {
//     const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
//     let updatedFavorites;

//     if (favorites.includes(_id)) {
//       // Unlove: Remove from list
//       updatedFavorites = favorites.filter((id: string) => id !== _id);
//       setIsFavorite(false);
//     } else {
//       // Love: Add to list
//       updatedFavorites = [...favorites, _id];
//       setIsFavorite(true);
//     }

//     localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
//     // Trigger a storage event so other pages/components can update if needed
//     window.dispatchEvent(new Event("storage"));
//   };
//   // --- FAVORITE LOGIC END ---

//   const propertyImages =
//     images.length >= 5
//       ? images.slice(0, 5)
//       : [
//           "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
//           "https://images.unsplash.com/photo-1600607687940-4e5a994e5773",
//           "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e",
//           "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
//         ].slice(0, 5);

//   const nextImage = () =>
//     setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
//   const prevImage = () =>
//     setCurrentIndex((prev) =>
//       prev === 0 ? propertyImages.length - 1 : prev - 1,
//     );
//   const isLocked = currentIndex >= 3;

//   const handleBookNow = () => {
//     router.push(`/appointments/new?propertyId=${_id}`);
//   };

//   const overviewData = [
//     { label: "Property Type", value: "Land", icon: <Building2 size={16} /> },
//     { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={16} /> },
//     { label: "Property Face", value: "South", icon: <Navigation size={16} /> },
//     { label: "Property Area", value: "5 Aana", icon: <Ruler size={16} /> },
//     { label: "Road Type", value: "Blacktopped", icon: <Layers size={16} /> },
//     { label: "Road Access", value: "13 Feet", icon: <MapPin size={16} /> },
//     { label: "Negotiable", value: "Yes", icon: <Wallet size={16} /> },
//     {
//       label: "Date Posted",
//       value: "2025 Nov 18",
//       icon: <Calendar size={16} />,
//     },
//     {
//       label: "Municipality",
//       value: "Suryabinayak",
//       icon: <Building2 size={16} />,
//     },
//     { label: "Ward No.", value: "05", icon: <Info size={16} /> },
//     { label: "Ring Road", value: "4km", icon: <Layers size={16} /> },
//   ];

//   const facilitiesData = [
//     { label: "Hospital", value: "3km", icon: <Hospital size={16} /> },
//     { label: "Airport", value: "14km", icon: <Plane size={16} /> },
//     { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={16} /> },
//     { label: "School", value: "500m", icon: <School size={16} /> },
//     { label: "Gym", value: "300m", icon: <Dumbbell size={16} /> },
//     { label: "Public transport", value: "1.7km", icon: <Bus size={16} /> },
//     { label: "Atm", value: "200m", icon: <Wallet size={16} /> },
//     { label: "Restaurant", value: "1km", icon: <Utensils size={16} /> },
//   ];

//   return (
//     <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">
//       {/* MAIN PROPERTY CARD */}
//       <Card className="overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] lg:h-162.5 flex flex-col lg:flex-row">
//         {/* LEFT SIDE: Gallery */}
//         <div className="relative w-full lg:w-[60%] bg-muted/20 flex flex-col border-r">
//           <div className="relative flex-1 overflow-hidden group">
//             <Image
//               src={propertyImages[currentIndex]}
//               alt={title || "Property Image"}
//               fill
//               priority
//               className={cn(
//                 "object-cover transition-all duration-700",
//                 isLocked ? "blur-xl scale-110" : "group-hover:scale-105",
//               )}
//             />

//             {isLocked && (
//               <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-md">
//                 <div className="bg-card/90 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border">
//                   <Crown size={32} className="text-amber-500 mb-4" />
//                   <h3 className="text-xl font-bold mb-2">Premium Gallery</h3>
//                   <Button size="lg" className="rounded-xl font-bold">
//                     Get Premium
//                   </Button>
//                 </div>
//               </div>
//             )}

//             <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-full bg-background/50 backdrop-blur-md"
//                 onClick={prevImage}
//               >
//                 <ChevronLeft size={24} />
//               </Button>
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-full bg-background/50 backdrop-blur-md"
//                 onClick={nextImage}
//               >
//                 <ChevronRight size={24} />
//               </Button>
//             </div>

//             {/* LOVE ICON ACTION */}
//             <div className="absolute top-6 left-6 flex gap-3 z-30">
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-2xl shadow-xl hover:scale-105"
//                 onClick={onToggleFavorite}
//               >
//                 <Heart
//                   size={20}
//                   className={cn(
//                     "transition-colors",
//                     isFavorite
//                       ? "text-destructive fill-current"
//                       : "text-muted-foreground",
//                   )}
//                 />
//               </Button>
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-2xl shadow-xl hover:scale-105"
//               >
//                 <Share2 size={20} className="text-muted-foreground" />
//               </Button>
//             </div>
//           </div>

//           <div className="p-4 flex justify-center gap-3 bg-card/50 border-t">
//             {propertyImages.map((img, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setCurrentIndex(idx)}
//                 className={cn(
//                   "relative w-16 h-12 lg:w-20 lg:h-16 rounded-xl overflow-hidden border-2 transition-all",
//                   currentIndex === idx
//                     ? "border-primary scale-105"
//                     : "border-transparent opacity-60 hover:opacity-100",
//                 )}
//               >
//                 <Image
//                   src={img}
//                   alt={`Thumbnail ${idx}`}
//                   fill
//                   className={cn("object-cover", idx >= 3 && "blur-[2px]")}
//                 />
//                 {idx >= 3 && (
//                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
//                     <Lock size={12} className="text-amber-400" />
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT SIDE: Information */}
//         <div className="w-full lg:w-[40%] bg-card p-6 lg:p-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//           <div className="flex flex-col h-full space-y-6">
//             <div className="flex items-center gap-2">
//               <Badge className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tighter">
//                 Exclusive Sale
//               </Badge>
//               <Badge
//                 variant="outline"
//                 className="flex items-center gap-1 bg-accent text-primary rounded-lg px-2 py-1 text-[10px] font-bold"
//               >
//                 <CheckCircle2 size={12} /> Verified
//               </Badge>
//               {/* ADDED PROPERTY ID BADGE HERE */}
//               <Badge
//                 variant="secondary"
//                 className="bg-muted text-muted-foreground rounded-lg px-2 py-1 text-[10px] font-black border-none"
//               >
//                 ID: {_id.slice(-5).toUpperCase()}
//               </Badge>
//             </div>

//             <section className="p-6 bg-muted/40 rounded-[1.5rem] border border-border space-y-3">
//               <h1 className="text-2xl font-bold leading-tight">
//                 {title || "Land for Sale at Suryabinayak"}
//               </h1>
//               <div className="flex items-center gap-2 text-sm font-semibold">
//                 <MapPin size={16} className="text-destructive" /> Bhaktapur,
//                 Suryabinayak
//               </div>
//               <div className="flex flex-col">
//                 <div className="flex items-center gap-2 text-xl font-bold text-primary">
//                   <Banknote size={20} /> 2 Crore 90 Lakh
//                 </div>
//                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest ml-7">
//                   Negotiable
//                 </span>
//               </div>
//             </section>

//             <section className="space-y-2 px-2">
//               <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
//                 Description
//               </h3>
//               <p className="text-[13px] leading-relaxed text-muted-foreground font-medium italic">
//                 Lalpurja Nepal brings you the wonderful land from Suryabinayak,
//                 Bhaktapur...
//               </p>
//             </section>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
//                 <MapIcon size={18} className="text-primary" />
//                 <span className="text-xs font-bold">Land</span>
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
//                 <Ruler size={18} className="text-primary" />
//                 <span className="text-xs font-bold">5 Aana</span>
//               </div>
//             </div>

//             <div
//               onClick={() => setCurrentIndex(4)}
//               className="p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all group"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
//                     <Crown size={20} />
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-xs">Premium Map</h4>
//                     <p className="text-[10px] text-primary/70 font-bold uppercase">
//                       Unlock Precise Data
//                     </p>
//                   </div>
//                 </div>
//                 <Lock size={14} className="text-primary/40" />
//               </div>
//             </div>

//             <div className="flex gap-3 pt-4">
//               <Button
//                 size="lg"
//                 className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20"
//                 onClick={handleBookNow}
//               >
//                 Book Now
//               </Button>
//               <Button
//                 variant="outline"
//                 size="lg"
//                 className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest border-2"
//               >
//                 Contact
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* OVERVIEW & FACILITIES GRID (Untouched as requested) */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//         <DataCard
//           title="Property Overview"
//           data={overviewData}
//           accentColor="bg-primary"
//         />
//         <DataCard
//           title="Nearby Facilities"
//           data={facilitiesData}
//           accentColor="bg-green-500"
//         />
//       </div>
//     </div>
//   );
// }

// function DataCard({
//   title,
//   data,
//   accentColor,
// }: {
//   title: string;
//   data: any[];
//   accentColor: string;
// }) {
//   return (
//     <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
//       <CardHeader className="px-8 py-6 border-b bg-muted/30">
//         <CardTitle className="text-lg font-bold flex items-center gap-3">
//           <div className={cn("w-1.5 h-6 rounded-full", accentColor)} /> {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
//         {data.map((item, i) => (
//           <div key={i} className="flex justify-between items-center group">
//             <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
//               <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10">
//                 {item.icon}
//               </div>
//               <span className="text-[13px] font-semibold">{item.label}:</span>
//             </div>
//             <span className="text-[13px] font-bold text-foreground">
//               {item.value}
//             </span>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

// // "use client";

// // import React, { useState } from "react";
// // import Image from "next/image"; // Added Next.js Image
// // import { useRouter } from "next/navigation";
// // import { Property } from "@/types/index";
// // import {
// //   MapPin, Ruler, Building2, Share2, Heart,
// //   ChevronLeft, ChevronRight, CheckCircle2,
// //   Lock, Crown, Navigation, Layers, Map as MapIcon,
// //   Banknote, Calendar, Info, Hospital, Plane,
// //   ShoppingCart, School, Dumbbell, Bus, Utensils, Wallet
// // } from "lucide-react";

// // // Shadcn UI Imports
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { cn } from "@/lib/utils";

// // interface PropertyDetailsCardProps {
// //   property: Property;
// //   isFavorite?: boolean;
// //   onToggleFavorite?: () => void;
// //   onShare?: () => void;
// // }

// // export default function PropertyDetailsCard({
// //   property,
// //   isFavorite = false,
// //   onToggleFavorite,
// //   onShare,
// // }: PropertyDetailsCardProps) {
// //   const router = useRouter();
// //   const { title, _id, images = [] } = property;
// //   const [currentIndex, setCurrentIndex] = useState(0);

// //   const propertyImages = images.length >= 5 ? images.slice(0, 5) : [
// //     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
// //     "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
// //     "https://images.unsplash.com/photo-1600607687940-4e5a994e5773",
// //     "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e",
// //     "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
// //   ].slice(0, 5);

// //   const nextImage = () => setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
// //   const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
// //   const isLocked = currentIndex >= 3;

// //   const handleBookNow = () => {
// //     router.push(`/appointments/new?propertyId=${_id}`);
// //   };

// //   const overviewData = [
// //     { label: "Property Type", value: "Land", icon: <Building2 size={16}/> },
// //     { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={16}/> },
// //     { label: "Property Face", value: "South", icon: <Navigation size={16}/> },
// //     { label: "Property Area", value: "5 Aana", icon: <Ruler size={16}/> },
// //     { label: "Road Type", value: "Blacktopped", icon: <Layers size={16}/> },
// //     { label: "Road Access", value: "13 Feet", icon: <MapPin size={16}/> },
// //     { label: "Negotiable", value: "Yes", icon: <Wallet size={16}/> },
// //     { label: "Date Posted", value: "2025 Nov 18", icon: <Calendar size={16}/> },
// //     { label: "Municipality", value: "Suryabinayak", icon: <Building2 size={16}/> },
// //     { label: "Ward No.", value: "05", icon: <Info size={16}/> },
// //     { label: "Ring Road", value: "4km", icon: <Layers size={16}/> },
// //   ];

// //   const facilitiesData = [
// //     { label: "Hospital", value: "3km", icon: <Hospital size={16}/> },
// //     { label: "Airport", value: "14km", icon: <Plane size={16}/> },
// //     { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={16}/> },
// //     { label: "School", value: "500m", icon: <School size={16}/> },
// //     { label: "Gym", value: "300m", icon: <Dumbbell size={16}/> },
// //     { label: "Public transport", value: "1.7km", icon: <Bus size={16}/> },
// //     { label: "Atm", value: "200m", icon: <Wallet size={16}/> },
// //     { label: "Restaurant", value: "1km", icon: <Utensils size={16}/> },
// //   ];

// //   return (
// //     <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">

// //       {/* MAIN PROPERTY CARD */}
// //       <Card className="overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] lg:h-162.5 flex flex-col lg:flex-row">

// //         {/* LEFT SIDE: Gallery */}
// //         <div className="relative w-full lg:w-[60%] bg-muted/20 flex flex-col border-r">
// //           <div className="relative flex-1 overflow-hidden group">
// //             <Image
// //               src={propertyImages[currentIndex]}
// //               alt={title || "Property Image"}
// //               fill
// //               priority
// //               className={cn(
// //                 "object-cover transition-all duration-700",
// //                 isLocked ? "blur-xl scale-110" : "group-hover:scale-105"
// //               )}
// //             />

// //             {isLocked && (
// //               <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-md">
// //                 <div className="bg-card/90 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border">
// //                   <Crown size={32} className="text-amber-500 mb-4" />
// //                   <h3 className="text-xl font-bold mb-2">Premium Gallery</h3>
// //                   <Button size="lg" className="rounded-xl font-bold">Get Premium</Button>
// //                 </div>
// //               </div>
// //             )}

// //             {/* Navigation Overlay */}
// //             <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
// //               <Button variant="secondary" size="icon" className="rounded-full bg-background/50 backdrop-blur-md" onClick={prevImage}>
// //                 <ChevronLeft size={24} />
// //               </Button>
// //               <Button variant="secondary" size="icon" className="rounded-full bg-background/50 backdrop-blur-md" onClick={nextImage}>
// //                 <ChevronRight size={24} />
// //               </Button>
// //             </div>

// //             {/* Top Actions */}
// //             <div className="absolute top-6 left-6 flex gap-3 z-30">
// //               <Button variant="secondary" size="icon" className="rounded-2xl shadow-xl hover:scale-105" onClick={onToggleFavorite}>
// //                 <Heart size={20} className={isFavorite ? "text-destructive fill-current" : "text-muted-foreground"} />
// //               </Button>
// //               <Button variant="secondary" size="icon" className="rounded-2xl shadow-xl hover:scale-105" onClick={onShare}>
// //                 <Share2 size={20} className="text-muted-foreground" />
// //               </Button>
// //             </div>
// //           </div>

// //           {/* Thumbnails */}
// //           <div className="p-4 flex justify-center gap-3 bg-card/50 border-t">
// //             {propertyImages.map((img, idx) => (
// //               <button
// //                 key={idx}
// //                 onClick={() => setCurrentIndex(idx)}
// //                 className={cn(
// //                   "relative w-16 h-12 lg:w-20 lg:h-16 rounded-xl overflow-hidden border-2 transition-all",
// //                   currentIndex === idx ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
// //                 )}
// //               >
// //                 <Image
// //                   src={img}
// //                   alt={`Thumbnail ${idx}`}
// //                   fill
// //                   className={cn("object-cover", idx >= 3 && "blur-[2px]")}
// //                 />
// //                 {idx >= 3 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10"><Lock size={12} className="text-amber-400" /></div>}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* RIGHT SIDE: Information (Scrollbar Removed) */}
// //         <div className="w-full lg:w-[40%] bg-card p-6 lg:p-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
// //           <div className="flex flex-col h-full space-y-6">
// //             <div className="flex items-center gap-2">
// //               <Badge className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tighter">Exclusive Sale</Badge>
// //               <Badge variant="outline" className="flex items-center gap-1 bg-accent text-primary rounded-lg px-2 py-1 text-[10px] font-bold">
// //                 <CheckCircle2 size={12} /> Verified
// //               </Badge>
// //             </div>

// //             <section className="p-6 bg-muted/40 rounded-[1.5rem] border border-border space-y-3">
// //               <h1 className="text-2xl font-bold leading-tight">{title || "Land for Sale at Suryabinayak"}</h1>
// //               <div className="flex items-center gap-2 text-sm font-semibold">
// //                 <MapPin size={16} className="text-destructive" /> Bhaktapur, Suryabinayak
// //               </div>
// //               <div className="flex flex-col">
// //                 <div className="flex items-center gap-2 text-xl font-bold text-primary">
// //                   <Banknote size={20} /> 2 Crore 90 Lakh
// //                 </div>
// //                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest ml-7">Negotiable</span>
// //               </div>
// //             </section>

// //             <section className="space-y-2 px-2">
// //               <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description</h3>
// //               <p className="text-[13px] leading-relaxed text-muted-foreground font-medium italic">
// //                 Lalpurja Nepal brings you the wonderful land from Suryabinayak, Bhaktapur...
// //               </p>
// //             </section>

// //             <div className="grid grid-cols-2 gap-3">
// //               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
// //                 <MapIcon size={18} className="text-primary" />
// //                 <span className="text-xs font-bold">Land</span>
// //               </div>
// //               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
// //                 <Ruler size={18} className="text-primary" />
// //                 <span className="text-xs font-bold">5 Aana</span>
// //               </div>
// //             </div>

// //             <div onClick={() => setCurrentIndex(4)} className="p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all group">
// //               <div className="flex items-center justify-between">
// //                 <div className="flex items-center gap-3">
// //                   <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform"><Crown size={20} /></div>
// //                   <div>
// //                     <h4 className="font-bold text-xs">Premium Map</h4>
// //                     <p className="text-[10px] text-primary/70 font-bold uppercase">Unlock Precise Data</p>
// //                   </div>
// //                 </div>
// //                 <Lock size={14} className="text-primary/40" />
// //               </div>
// //             </div>

// //             <div className="flex gap-3 pt-4">
// //               <Button size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20" onClick={handleBookNow}>
// //                 Book Now
// //               </Button>
// //               <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest border-2">
// //                 Contact
// //               </Button>
// //             </div>
// //           </div>
// //         </div>
// //       </Card>

// //       {/* OVERVIEW & FACILITIES GRID */}
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
// //         <DataCard title="Property Overview" data={overviewData} accentColor="bg-primary" />
// //         <DataCard title="Nearby Facilities" data={facilitiesData} accentColor="bg-green-500" />
// //       </div>
// //     </div>
// //   );
// // }

// // function DataCard({ title, data, accentColor }: { title: string, data: any[], accentColor: string }) {
// //   return (
// //     <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
// //       <CardHeader className="px-8 py-6 border-b bg-muted/30">
// //         <CardTitle className="text-lg font-bold flex items-center gap-3">
// //           <div className={cn("w-1.5 h-6 rounded-full", accentColor)} /> {title}
// //         </CardTitle>
// //       </CardHeader>
// //       <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
// //         {data.map((item, i) => (
// //           <div key={i} className="flex justify-between items-center group">
// //             <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
// //               <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10">{item.icon}</div>
// //               <span className="text-[13px] font-semibold">{item.label}:</span>
// //             </div>
// //             <span className="text-[13px] font-bold text-foreground">{item.value}</span>
// //           </div>
// //         ))}
// //       </CardContent>
// //     </Card>
// //   );
// // }

// // import React, { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { Property } from "@/types/index";
// // import {
// //   MapPin, Ruler, Building2, Share2, Heart,
// //   ChevronLeft, ChevronRight, CheckCircle2,
// //   Lock, Crown, Eye, Navigation, Landmark,
// //   Hospital, Plane, ShoppingCart, School, GraduationCap,
// //   Dumbbell, Bus, Shield, Utensils, Hotel, Wallet, Layers, Map as MapIcon,
// //   Banknote, Calendar, Info
// // } from "lucide-react";

// // interface PropertyDetailsCardProps {
// //   property: Property;
// //   isFavorite?: boolean;
// //   onToggleFavorite?: () => void;
// //   onShare?: () => void;
// // }

// // export default function PropertyDetailsCard({
// //   property,
// //   isFavorite = false,
// //   onToggleFavorite,
// //   onShare,
// // }: PropertyDetailsCardProps) {
// //   const router = useRouter();
// //   const { title, _id, images = [] } = property;
// //   const [currentIndex, setCurrentIndex] = useState(0);

// //   const propertyImages = images.length >= 5 ? images.slice(0, 5) : [
// //     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
// //     "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
// //     "https://images.unsplash.com/photo-1600607687940-4e5a994e5773",
// //     "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e",
// //     "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
// //   ].slice(0, 5);

// //   const nextImage = () => setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
// //   const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
// //   const isLocked = currentIndex >= 3;

// //   const handleBookNow = () => {
// //     router.push(`/appointments/new?propertyId=${_id}`);
// //   };

// //   // ... (overviewData and facilitiesData remain the same)
// //   const overviewData = [
// //     { label: "Property Type", value: "Land", icon: <Building2 size={18}/> },
// //     { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={18}/> },
// //     { label: "Property Face", value: "South", icon: <Navigation size={18}/> },
// //     { label: "Property Area", value: "5 Aana", icon: <Ruler size={18}/> },
// //     { label: "Road Type", value: "Blacktopped", icon: <Layers size={18}/> },
// //     { label: "Road Access", value: "13 Feet", icon: <MapPin size={18}/> },
// //     { label: "Negotiable", value: "Yes", icon: <Wallet size={18}/> },
// //     { label: "Date Posted", value: "2025 November 18", icon: <Calendar size={18}/> },
// //     { label: "City & Area", value: "Bhaktapur, Suryabinayak", icon: <MapPin size={18}/> },
// //     { label: "Views", value: "1399", icon: <Eye size={18}/> },
// //     { label: "Municipality", value: "Suryabinayak", icon: <Building2 size={18}/> },
// //     { label: "Ward No.", value: "05", icon: <Info size={18}/> },
// //     { label: "Ring Road", value: "4km", icon: <Layers size={18}/> },
// //   ];

// //   const facilitiesData = [
// //     { label: "Landmark", value: "Suryabinayak | Thapa Banquet", icon: <Landmark size={18}/> },
// //     { label: "Hospital", value: "3km", icon: <Hospital size={18}/> },
// //     { label: "Airport", value: "14km", icon: <Plane size={18}/> },
// //     { label: "Pharmacy", value: "500m", icon: <Shield size={18}/> },
// //     { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={18}/> },
// //     { label: "School", value: "500m", icon: <School size={18}/> },
// //     { label: "College", value: "3km", icon: <GraduationCap size={18}/> },
// //     { label: "Gym", value: "300m", icon: <Dumbbell size={18}/> },
// //     { label: "Public transport", value: "1.7km", icon: <Bus size={18}/> },
// //     { label: "Police station", value: "1.7km", icon: <Shield size={18}/> },
// //     { label: "Pashupatinath", value: "7km", icon: <Landmark size={18}/> },
// //     { label: "Boudhanath", value: "9km", icon: <Landmark size={18}/> },
// //     { label: "Atm", value: "200m", icon: <Wallet size={18}/> },
// //     { label: "Hotel", value: "500m", icon: <Hotel size={18}/> },
// //     { label: "Restaurant", value: "1km", icon: <Utensils size={18}/> },
// //     { label: "Banquet", value: "800m", icon: <Hotel size={18}/> },
// //     { label: "Ward office", value: "400m", icon: <Building2 size={18}/> },
// //   ];

// //   return (
// //     <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700 bg-background text-foreground">

// //       {/* MAIN CARD */}
// //       <div className="bg-card rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col lg:flex-row border border-border lg:h-162.5">

// //         {/* LEFT SIDE: Image Gallery */}
// //         <div className="relative w-full lg:w-[60%] bg-muted/30 flex flex-col border-r border-border h-100 lg:h-full">
// //           <div className="relative flex-1 overflow-hidden group">
// //             <img
// //               src={propertyImages[currentIndex]}
// //               className={`w-full h-full object-cover transition-all duration-700 ${isLocked ? 'blur-xl scale-110' : 'group-hover:scale-105'}`}
// //             />
// //             {isLocked && (
// //               <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-md">
// //                 <div className="bg-card/90 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border">
// //                   <Crown size={32} className="text-amber-500 mb-4" />
// //                   <h3 className="text-xl font-bold text-foreground mb-2">Premium Gallery</h3>
// //                   <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">Get Premium</button>
// //                 </div>
// //               </div>
// //             )}
// //             <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
// //               <button onClick={prevImage} className="p-3 bg-background/20 backdrop-blur-xl text-foreground rounded-full hover:bg-card transition-all"><ChevronLeft size={28} /></button>
// //               <button onClick={nextImage} className="p-3 bg-background/20 backdrop-blur-xl text-foreground rounded-full hover:bg-card transition-all"><ChevronRight size={28} /></button>
// //             </div>
// //             <div className="absolute top-8 left-8 flex gap-4 z-30">
// //               <button onClick={onToggleFavorite} className="p-4 bg-card/90 rounded-2xl shadow-xl transition active:scale-95 border border-border">
// //                 <Heart size={22} className={isFavorite ? "text-destructive fill-current" : "text-muted-foreground"} />
// //               </button>
// //               <button onClick={onShare} className="p-4 bg-card/90 rounded-2xl shadow-xl transition active:scale-95 border border-border">
// //                 <Share2 size={22} className="text-muted-foreground" />
// //               </button>
// //             </div>
// //           </div>
// //           {/* Thumbnails */}
// //           <div className="p-4 flex justify-center gap-3 bg-card border-t border-border">
// //             {propertyImages.map((img, idx) => (
// //               <button
// //                 key={idx}
// //                 onClick={() => setCurrentIndex(idx)}
// //                 className={`relative w-16 h-12 lg:w-20 lg:h-16 rounded-xl overflow-hidden border-2 transition-all ${currentIndex === idx ? "border-primary scale-105 shadow-md" : "border-transparent opacity-60"}`}
// //               >
// //                 <img src={img} className={`w-full h-full object-cover ${idx >= 3 ? 'blur-sm' : ''}`} />
// //                 {idx >= 3 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Lock size={12} className="text-amber-400" /></div>}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* RIGHT SIDE: Quick Info */}
// //         <div className="w-full lg:w-[40%] flex flex-col bg-card p-6 lg:p-8">
// //           <div className="mb-4 flex items-center gap-3">
// //             <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Exclusive Sale</span>
// //             <div className="flex items-center gap-1.5 bg-accent px-2 py-1 rounded-lg border border-border">
// //               <CheckCircle2 size={12} className="text-primary" />
// //               <span className="text-primary text-[9px] font-bold uppercase tracking-wider">Verified</span>
// //             </div>
// //           </div>

// //           <div className="mb-4 p-6 bg-muted/40 rounded-[1.5rem] border border-border">
// //             <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">Land for Sale at Suryabinayak</h1>
// //             <div className="flex items-center gap-2 text-foreground text-[13px] font-bold mb-3">
// //               <MapPin size={14} className="text-destructive" /> 100000 location
// //             </div>
// //             <div className="flex flex-col gap-0.5">
// //               <div className="flex items-center gap-2 text-foreground text-[13px] font-bold">
// //                 <Banknote size={14} className="text-primary" /> 2 crore 90 lak
// //               </div>
// //               <div className="text-[10px] font-normal text-primary uppercase tracking-widest ml-5">Negotiable</div>
// //             </div>
// //           </div>

// //           <div className="mb-4 p-6 bg-muted/40 rounded-[1.5rem] border border-border">
// //             <h3 className="text-foreground text-[11px] font-bold uppercase tracking-widest mb-2">Description</h3>
// //             <p className="text-muted-foreground text-[12px] leading-relaxed font-medium">
// //               Lalpurja Nepal brings you the wonderful land from Suryabinayak, Bhaktapur. The total land area of this property is 5 Aana with South facing and 13 feet road access touches this property.
// //             </p>
// //           </div>

// //           <div className="grid grid-cols-2 gap-3 mb-4">
// //             <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
// //               <MapIcon size={16} className="text-primary" />
// //               <span className="font-bold text-[12px] text-foreground">Type: Land</span>
// //             </div>
// //             <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
// //               <Ruler size={16} className="text-primary" />
// //               <span className="font-bold text-[12px] text-foreground">Aana : 5</span>
// //             </div>
// //           </div>

// //           <div onClick={() => setCurrentIndex(4)} className="mb-6 p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors group">
// //             <div className="flex items-center justify-between">
// //               <div className="flex items-center gap-3">
// //                 <div className="p-2 bg-primary/10 rounded-xl text-primary"><Crown size={20} /></div>
// //                 <div>
// //                   <h4 className="font-bold text-[13px] text-foreground">Premium Map</h4>
// //                   <p className="text-[10px] text-primary font-semibold">Unlock Precise Data</p>
// //                 </div>
// //               </div>
// //               <Lock size={14} className="text-primary/40" />
// //             </div>
// //           </div>

// //           <div className="mt-auto flex gap-3 pt-4 border-t border-border">
// //             <button onClick={handleBookNow} className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all">
// //               Book Now
// //             </button>
// //             <button className="flex-1 border-2 border-border text-foreground py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-muted transition-all">
// //               Contact
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* OVERVIEW & FACILITIES */}
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
// //         <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
// //           <div className="px-10 py-8 border-b border-border bg-muted/30">
// //             <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
// //               <div className="w-1.5 h-6 bg-primary rounded-full" /> Property Overview
// //             </h2>
// //           </div>
// //           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
// //             {overviewData.map((item, i) => (
// //               <div key={i} className="flex justify-between items-center group">
// //                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
// //                   {item.icon}
// //                   <span className="text-[13px] font-medium">{item.label}:</span>
// //                 </div>
// //                 <span className="text-[13px] font-bold text-foreground text-right">{item.value}</span>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
// //           <div className="px-10 py-8 border-b border-border bg-muted/30">
// //             <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
// //               <div className="w-1.5 h-6 bg-primary rounded-full" /> Nearby Facilities
// //             </h2>
// //           </div>
// //           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
// //             {facilitiesData.map((item, i) => (
// //               <div key={i} className="flex justify-between items-center group">
// //                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
// //                   {item.icon}
// //                   <span className="text-[13px] font-medium">{item.label}:</span>
// //                 </div>
// //                 <span className="text-[13px] font-bold text-foreground text-right">{item.value}</span>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }







// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Property } from "@/types/index";
// import {
//   MapPin,
//   Ruler,
//   Building2,
//   Share2,
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   CheckCircle2,
//   Lock,
//   Crown,
//   Navigation,
//   Layers,
//   Map as MapIcon,
//   Banknote,
//   Calendar,
//   Info,
//   Hospital,
//   Plane,
//   ShoppingCart,
//   School,
//   Dumbbell,
//   Bus,
//   Utensils,
//   Wallet,
//   Video,
//   FileText,
// } from "lucide-react";

// // Shadcn UI Imports
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface PropertyDetailsCardProps {
//   property: Property;
// }

// export default function PropertyDetailsCard({
//   property,
// }: PropertyDetailsCardProps) {
//   const router = useRouter();
//   const { title, _id, images = [] } = property;
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // --- FAVORITE LOGIC ---
//   const [isFavorite, setIsFavorite] = useState(false);

//   useEffect(() => {
//     const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
//     setIsFavorite(favorites.includes(_id));
//   }, [_id]);

//   const onToggleFavorite = () => {
//     const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
//     let updatedFavorites;

//     if (favorites.includes(_id)) {
//       updatedFavorites = favorites.filter((id: string) => id !== _id);
//       setIsFavorite(false);
//     } else {
//       updatedFavorites = [...favorites, _id];
//       setIsFavorite(true);
//     }

//     localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
//     window.dispatchEvent(new Event("storage"));
//   };

//   // Gallery Setup: 7 Images, last 3 are premium (indices 4, 5, 6)
//   const propertyImages =
//     images.length >= 7
//       ? images.slice(0, 7)
//       : [
//           "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
//           "https://images.unsplash.com/photo-1600607687940-4e5a994e5773",
//           "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e",
//           "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
//           "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
//           "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
//         ].slice(0, 7);

//   const nextImage = () =>
//     setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
//   const prevImage = () =>
//     setCurrentIndex((prev) =>
//       prev === 0 ? propertyImages.length - 1 : prev - 1,
//     );
  
//   // Last three images (index 4, 5, 6) are locked
//   const isLocked = currentIndex >= 4;

//   const handleBookNow = () => {
//     router.push(`/appointments/new?propertyId=${_id}`);
//   };

//   const overviewData = [
//     { label: "Property Type", value: "Land", icon: <Building2 size={16} /> },
//     { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={16} /> },
//     { label: "Property Face", value: "South", icon: <Navigation size={16} /> },
//     { label: "Property Area", value: "5 Aana", icon: <Ruler size={16} /> },
//     { label: "Road Type", value: "Blacktopped", icon: <Layers size={16} /> },
//     { label: "Road Access", value: "13 Feet", icon: <MapPin size={16} /> },
//     { label: "Negotiable", value: "Yes", icon: <Wallet size={16} /> },
//     { label: "Date Posted", value: "2025 Nov 18", icon: <Calendar size={16} /> },
//     { label: "Municipality", value: "Suryabinayak", icon: <Building2 size={16} /> },
//     { label: "Ward No.", value: "05", icon: <Info size={16} /> },
//     { label: "Ring Road", value: "4km", icon: <Layers size={16} /> },
//   ];

//   const facilitiesData = [
//     { label: "Hospital", value: "3km", icon: <Hospital size={16} /> },
//     { label: "Airport", value: "14km", icon: <Plane size={16} /> },
//     { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={16} /> },
//     { label: "School", value: "500m", icon: <School size={16} /> },
//     { label: "Gym", value: "300m", icon: <Dumbbell size={16} /> },
//     { label: "Public transport", value: "1.7km", icon: <Bus size={16} /> },
//     { label: "Atm", value: "200m", icon: <Wallet size={16} /> },
//     { label: "Restaurant", value: "1km", icon: <Utensils size={16} /> },
//   ];

//   return (
//     <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">
//       {/* MAIN PROPERTY CARD */}
//       <Card className="overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] lg:h-[700px] flex flex-col lg:flex-row">
        
//         {/* LEFT SIDE: Gallery */}
//         <div className="relative w-full lg:w-[60%] bg-muted/20 flex flex-col border-r p-6">
//           {/* Main Display Image - Curved Rectangle Shape */}
//           <div className="relative flex-1 overflow-hidden rounded-[2rem] group border border-border shadow-inner">
//             <Image
//               src={propertyImages[currentIndex]}
//               alt={title || "Property Image"}
//               fill
//               priority
//               className={cn(
//                 "object-cover transition-all duration-700",
//                 isLocked ? "blur-2xl scale-110" : "group-hover:scale-105",
//               )}
//             />

//             {isLocked && (
//               <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-md">
//                 <div className="bg-card/90 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border">
//                   <Crown size={32} className="text-amber-500 mb-4" />
//                   <h3 className="text-xl font-bold mb-2">Premium Gallery</h3>
//                   <p className="text-xs text-muted-foreground mb-4">Unlock high-resolution images</p>
//                   <Button size="lg" className="rounded-xl font-bold">
//                     Get Premium
//                   </Button>
//                 </div>
//               </div>
//             )}

//             <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-full bg-background/50 backdrop-blur-md"
//                 onClick={prevImage}
//               >
//                 <ChevronLeft size={24} />
//               </Button>
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-full bg-background/50 backdrop-blur-md"
//                 onClick={nextImage}
//               >
//                 <ChevronRight size={24} />
//               </Button>
//             </div>

//             <div className="absolute top-6 left-6 flex gap-3 z-30">
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-2xl shadow-xl hover:scale-105"
//                 onClick={onToggleFavorite}
//               >
//                 <Heart
//                   size={20}
//                   className={cn(
//                     "transition-colors",
//                     isFavorite ? "text-destructive fill-current" : "text-muted-foreground",
//                   )}
//                 />
//               </Button>
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="rounded-2xl shadow-xl hover:scale-105"
//               >
//                 <Share2 size={20} className="text-muted-foreground" />
//               </Button>
//             </div>
//           </div>

//           {/* Thumbnails - Increased to 7 */}
//           <div className="mt-4 flex justify-center gap-2 bg-transparent">
//             {propertyImages.map((img, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setCurrentIndex(idx)}
//                 className={cn(
//                   "relative w-12 h-12 lg:w-16 lg:h-16 rounded-xl overflow-hidden border-2 transition-all",
//                   currentIndex === idx
//                     ? "border-primary scale-105 shadow-lg"
//                     : "border-transparent opacity-60 hover:opacity-100",
//                 )}
//               >
//                 <Image
//                   src={img}
//                   alt={`Thumbnail ${idx}`}
//                   fill
//                   className={cn("object-cover", idx >= 4 && "blur-[3px] grayscale-[0.5]")}
//                 />
//                 {idx >= 4 && (
//                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
//                     <Lock size={12} className="text-amber-400" />
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT SIDE: Information */}
//         <div className="w-full lg:w-[40%] bg-card p-6 lg:p-8 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//           <div className="flex flex-col h-full space-y-6">
//             <div className="flex items-center gap-2">
//               <Badge className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tighter">
//                 Exclusive Sale
//               </Badge>
//               <Badge variant="outline" className="flex items-center gap-1 bg-accent text-primary rounded-lg px-2 py-1 text-[10px] font-bold">
//                 <CheckCircle2 size={12} /> Verified
//               </Badge>
//               <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-lg px-2 py-1 text-[10px] font-black border-none">
//                 ID: {_id.slice(-5).toUpperCase()}
//               </Badge>
//             </div>

//             <section className="p-6 bg-muted/40 rounded-[1.5rem] border border-border space-y-3">
//               <h1 className="text-2xl font-bold leading-tight">
//                 {title || "Land for Sale at Suryabinayak"}
//               </h1>
//               <div className="flex items-center gap-2 text-sm font-semibold">
//                 <MapPin size={16} className="text-destructive" /> Bhaktapur, Suryabinayak
//               </div>
//               <div className="flex flex-col">
//                 <div className="flex items-center gap-2 text-xl font-bold text-primary">
//                   <Banknote size={20} /> 2 Crore 90 Lakh
//                 </div>
//                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest ml-7">Negotiable</span>
//               </div>
//             </section>

//             {/* Boxes section */}
//             <div className="grid grid-cols-2 gap-3">
//               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
//                 <MapIcon size={18} className="text-primary" />
//                 <span className="text-xs font-bold">Land</span>
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
//                 <Ruler size={18} className="text-primary" />
//                 <span className="text-xs font-bold">5 Aana</span>
//               </div>
//             </div>

//             {/* PREMIUM FEATURES SECTION */}
//             <div className="space-y-3">
//               {/* Virtual Tour (Premium) */}
//               <div className="p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all group">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
//                       <Video size={20} />
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-xs">Virtual Tour</h4>
//                       <p className="text-[10px] text-primary/70 font-bold uppercase">Experience 3D walkthrough</p>
//                     </div>
//                   </div>
//                   <Lock size={14} className="text-primary/40" />
//                 </div>
//               </div>

//               {/* Premium Map */}
//               <div className="p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all group">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
//                       <Crown size={20} />
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-xs">Premium Map</h4>
//                       <p className="text-[10px] text-primary/70 font-bold uppercase">Unlock Precise Data</p>
//                     </div>
//                   </div>
//                   <Lock size={14} className="text-primary/40" />
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3 pt-4">
//               <Button size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20" onClick={handleBookNow}>
//                 Book Now
//               </Button>
//               <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest border-2">
//                 Contact
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* OVERVIEW & FACILITIES GRID */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//         <DataCard title="Property Overview" data={overviewData} accentColor="bg-primary" />
//         <DataCard title="Nearby Facilities" data={facilitiesData} accentColor="bg-green-500" />
//       </div>

//       {/* DESCRIPTION SECTION (Moved to the bottom as requested) */}
//       <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
//         <CardHeader className="px-8 py-6 border-b bg-muted/30">
//           <CardTitle className="text-lg font-bold flex items-center gap-3">
//             <div className="w-1.5 h-6 rounded-full bg-amber-500" /> 
//             <FileText size={20} className="text-muted-foreground" />
//             Detailed Description
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-8">
//           <p className="text-[14px] leading-relaxed text-muted-foreground font-medium">
//             Lalpurja Nepal brings you the wonderful land from Suryabinayak, Bhaktapur. 
//             This prime piece of real estate offers a perfect blend of peaceful residential living with 
//             unmatched accessibility to core amenities. The property is ideally suited for those 
//             looking to build a dream home in a rapidly developing municipality with strong 
//             community values and increasing land valuation.
//           </p>
//           <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground font-medium">
//             Featuring 13 feet blacktopped road access and a desirable south-facing orientation, 
//             this property ensures plenty of sunlight throughout the day. Located just 4km from the 
//             Ring Road, it maintains a quiet atmosphere while being minutes away from hospitals, 
//             shopping centers, and schools.
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function DataCard({ title, data, accentColor }: { title: string; data: any[]; accentColor: string }) {
//   return (
//     <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
//       <CardHeader className="px-8 py-6 border-b bg-muted/30">
//         <CardTitle className="text-lg font-bold flex items-center gap-3">
//           <div className={cn("w-1.5 h-6 rounded-full", accentColor)} /> {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
//         {data.map((item, i) => (
//           <div key={i} className="flex justify-between items-center group">
//             <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
//               <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10">
//                 {item.icon}
//               </div>
//               <span className="text-[13px] font-semibold">{item.label}:</span>
//             </div>
//             <span className="text-[13px] font-bold text-foreground">{item.value}</span>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }





"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Property } from "@/types/index";
import {
  MapPin,
  Ruler,
  Building2,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Crown,
  Navigation,
  Layers,
  Map as MapIcon,
  Banknote,
  Calendar,
  Info,
  Hospital,
  Plane,
  ShoppingCart,
  School,
  Dumbbell,
  Bus,
  Utensils,
  Wallet,
  Video,
  FileText,
} from "lucide-react";

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyDetailsCardProps {
  property: Property;
}

export default function PropertyDetailsCard({
  property,
}: PropertyDetailsCardProps) {
  const router = useRouter();
  const { title, _id, images = [] } = property;
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- FAVORITE LOGIC ---
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(_id));
  }, [_id]);

  const onToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let updatedFavorites;

    if (favorites.includes(_id)) {
      updatedFavorites = favorites.filter((id: string) => id !== _id);
      setIsFavorite(false);
    } else {
      updatedFavorites = [...favorites, _id];
      setIsFavorite(true);
    }

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    window.dispatchEvent(new Event("storage"));
  };

  // Gallery Setup: 7 Images total
  const propertyImages =
    images.length >= 7
      ? images.slice(0, 7)
      : [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
          "https://images.unsplash.com/photo-1600607687940-4e5a994e5773",
          "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
          "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
          "https://images.row1.com/photo-1600047509807-ba8f99d2cdde",
        ].slice(0, 7);

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
  const prevImage = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? propertyImages.length - 1 : prev - 1,
    );
  
  // LOGIC: Only the last TWO images are premium (Index 5 and 6)
  const isLocked = currentIndex >= 5;

  const handleBookNow = () => {
    router.push(`/appointments/new?propertyId=${_id}`);
  };

  const overviewData = [
    { label: "Property Type", value: "Land", icon: <Building2 size={16} /> },
    { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={16} /> },
    { label: "Property Face", value: "South", icon: <Navigation size={16} /> },
    { label: "Property Area", value: "5 Aana", icon: <Ruler size={16} /> },
    { label: "Road Type", value: "Blacktopped", icon: <Layers size={16} /> },
    { label: "Road Access", value: "13 Feet", icon: <MapPin size={16} /> },
    { label: "Negotiable", value: "Yes", icon: <Wallet size={16} /> },
    { label: "Date Posted", value: "2025 Nov 18", icon: <Calendar size={16} /> },
    { label: "Municipality", value: "Suryabinayak", icon: <Building2 size={16} /> },
    { label: "Ward No.", value: "05", icon: <Info size={16} /> },
    { label: "Ring Road", value: "4km", icon: <Layers size={16} /> },
  ];

  const facilitiesData = [
    { label: "Hospital", value: "3km", icon: <Hospital size={16} /> },
    { label: "Airport", value: "14km", icon: <Plane size={16} /> },
    { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={16} /> },
    { label: "School", value: "500m", icon: <School size={16} /> },
    { label: "Gym", value: "300m", icon: <Dumbbell size={16} /> },
    { label: "Public transport", value: "1.7km", icon: <Bus size={16} /> },
    { label: "Atm", value: "200m", icon: <Wallet size={16} /> },
    { label: "Restaurant", value: "1km", icon: <Utensils size={16} /> },
  ];

  return (
    <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-6 space-y-8 animate-in fade-in duration-700">
      {/* MAIN PROPERTY CARD */}
      <Card className="overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] lg:h-[620px] max-h-[90vh] flex flex-col lg:flex-row">
        
        {/* LEFT SIDE: Gallery (Width reduced to 50% to make image smaller) */}
        <div className="relative w-full lg:w-[50%] bg-muted/10 flex flex-col border-r p-4 lg:p-8">
          {/* Main Display Image */}
          <div className="relative flex-1 overflow-hidden rounded-[2rem] group border border-border/50 shadow-inner bg-black">
            <Image
              src={propertyImages[currentIndex]}
              alt={title || "Property Image"}
              fill
              priority
              className={cn(
                "object-cover transition-all duration-700",
                isLocked ? "blur-2xl scale-110 opacity-50" : "group-hover:scale-105",
              )}
            />

            {isLocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/10 backdrop-blur-sm">
                <div className="bg-card/95 p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border max-w-[280px]">
                  <Crown size={28} className="text-amber-500 mb-3" />
                  <h3 className="text-lg font-bold mb-1">Premium View</h3>
                  <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider">Subscriber Exclusive</p>
                  <Button size="sm" className="rounded-xl font-bold px-8">
                    Unlock
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md" onClick={prevImage}>
                <ChevronLeft size={18} />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md" onClick={nextImage}>
                <ChevronRight size={18} />
              </Button>
            </div>

            {/* Float Buttons */}
            <div className="absolute top-4 left-4 flex gap-2 z-30">
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-xl" onClick={onToggleFavorite}>
                <Heart size={18} className={cn(isFavorite ? "text-destructive fill-current" : "text-muted-foreground")} />
              </Button>
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-xl">
                <Share2 size={18} className="text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex justify-center gap-2 overflow-x-auto py-2">
            {propertyImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden border-2 transition-all",
                  currentIndex === idx ? "border-primary scale-110 shadow-md" : "border-transparent opacity-60",
                )}
              >
                <Image src={img} alt="thumb" fill className={cn("object-cover", idx >= 5 && "blur-[2px] grayscale")} />
                {idx >= 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock size={10} className="text-amber-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Information */}
        <div className="w-full lg:w-[50%] bg-card p-6 lg:p-10 flex flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col h-full">
            {/* Header Badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary px-2 py-0.5 text-[9px] font-black uppercase">Exclusive Sale</Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-accent text-primary px-2 py-0.5 text-[9px] font-bold">
                <CheckCircle2 size={10} /> Verified
              </Badge>
            </div>

            {/* Title & Price Section */}
            <section className="p-5 bg-muted/30 rounded-[1.5rem] border border-border/50 mb-6">
              <h1 className="text-xl lg:text-2xl font-bold leading-tight mb-2">{title || "Land for Sale at Suryabinayak"}</h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-4">
                <MapPin size={14} className="text-destructive" /> Bhaktapur, Suryabinayak
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary tracking-tight">2 Crore 90 Lakh</span>
                <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Negotiable</span>
              </div>
            </section>

            {/* Main Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                <MapIcon size={16} className="text-primary" />
                <span className="text-xs font-bold">Land</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                <Ruler size={16} className="text-primary" />
                <span className="text-xs font-bold">5 Aana</span>
              </div>
            </div>

            {/* PREMIUM FEATURES */}
            <div className="space-y-3 mb-8">
              <div className="p-3 border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Video size={18} className="text-primary" />
                  <div>
                    <h4 className="font-bold text-[11px]">Virtual Tour</h4>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Locked</p>
                  </div>
                </div>
                <Lock size={12} className="text-primary/40" />
              </div>
              <div className="p-3 border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Crown size={18} className="text-primary" />
                  <div>
                    <h4 className="font-bold text-[11px]">Premium Map</h4>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Locked</p>
                  </div>
                </div>
                <Lock size={12} className="text-primary/40" />
              </div>
            </div>

            {/* ACTION BUTTONS - Spaced properly at the bottom */}
            <div className="mt-auto flex gap-4 pt-4">
              <Button size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[10px] tracking-widest h-12 shadow-lg" onClick={handleBookNow}>
                Book Now
              </Button>
              <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[10px] tracking-widest h-12 border-2">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* OVERVIEW & FACILITIES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DataCard title="Property Overview" data={overviewData} accentColor="bg-primary" />
        <DataCard title="Nearby Facilities" data={facilitiesData} accentColor="bg-green-500" />
      </div>

      {/* DESCRIPTION SECTION */}
      <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
        <CardHeader className="px-8 py-5 border-b bg-muted/30">
          <CardTitle className="text-md font-bold flex items-center gap-3">
            <div className="w-1.5 h-5 rounded-full bg-amber-500" /> 
            <FileText size={18} className="text-muted-foreground" />
            Detailed Description
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
            Lalpurja Nepal brings you the wonderful land from Suryabinayak, Bhaktapur. 
            This prime piece of real estate offers a perfect blend of peaceful residential living with 
            unmatched accessibility to core amenities. 
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground font-medium">
            Featuring 13 feet blacktopped road access and a desirable south-facing orientation, 
            this property ensures plenty of sunlight throughout the day.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DataCard({ title, data, accentColor }: { title: string; data: any[]; accentColor: string }) {
  return (
    <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
      <CardHeader className="px-8 py-5 border-b bg-muted/30">
        <CardTitle className="text-md font-bold flex items-center gap-3">
          <div className={cn("w-1.5 h-5 rounded-full", accentColor)} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-1 rounded-lg bg-muted">{item.icon}</div>
              <span className="text-[12px] font-semibold">{item.label}:</span>
            </div>
            <span className="text-[12px] font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}