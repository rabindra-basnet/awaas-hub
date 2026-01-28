// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Property } from "@/types/index";
// import { 
//   MapPin, Ruler, Building2, Share2, Heart, 
//   ChevronLeft, ChevronRight, CheckCircle2,
//   Lock, Crown, Eye, Navigation, Landmark,
//   Hospital, Plane, ShoppingCart, School, GraduationCap,
//   Dumbbell, Bus, Shield, Utensils, Hotel, Wallet, Layers, Map as MapIcon,
//   Banknote, Calendar, Info
// } from "lucide-react";

// interface PropertyDetailsCardProps {
//   property: Property;
//   isFavorite?: boolean;
//   onToggleFavorite?: () => void;
//   onShare?: () => void;
// }

// export default function PropertyDetailsCard({
//   property,
//   isFavorite = false,
//   onToggleFavorite,
//   onShare,
// }: PropertyDetailsCardProps) {
//   const router = useRouter();
//   const { title, _id, images = [] } = property;
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const propertyImages = images.length >= 5 ? images.slice(0, 5) : [
//     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", 
//     "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", 
//     "https://images.unsplash.com/photo-1600607687940-4e5a994e5773", 
//     "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e", 
//     "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
//   ].slice(0, 5);

//   const nextImage = () => setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
//   const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
//   const isLocked = currentIndex >= 3;

//   const handleBookNow = () => {
//     router.push(`/appointments/new?propertyId=${_id}`);
//   };

//   // ... (overviewData and facilitiesData remain the same)
//   const overviewData = [
//     { label: "Property Type", value: "Land", icon: <Building2 size={18}/> },
//     { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={18}/> },
//     { label: "Property Face", value: "South", icon: <Navigation size={18}/> },
//     { label: "Property Area", value: "5 Aana", icon: <Ruler size={18}/> },
//     { label: "Road Type", value: "Blacktopped", icon: <Layers size={18}/> },
//     { label: "Road Access", value: "13 Feet", icon: <MapPin size={18}/> },
//     { label: "Negotiable", value: "Yes", icon: <Wallet size={18}/> },
//     { label: "Date Posted", value: "2025 November 18", icon: <Calendar size={18}/> },
//     { label: "City & Area", value: "Bhaktapur, Suryabinayak", icon: <MapPin size={18}/> },
//     { label: "Views", value: "1399", icon: <Eye size={18}/> },
//     { label: "Municipality", value: "Suryabinayak", icon: <Building2 size={18}/> },
//     { label: "Ward No.", value: "05", icon: <Info size={18}/> },
//     { label: "Ring Road", value: "4km", icon: <Layers size={18}/> },
//   ];

//   const facilitiesData = [
//     { label: "Landmark", value: "Suryabinayak | Thapa Banquet", icon: <Landmark size={18}/> },
//     { label: "Hospital", value: "3km", icon: <Hospital size={18}/> },
//     { label: "Airport", value: "14km", icon: <Plane size={18}/> },
//     { label: "Pharmacy", value: "500m", icon: <Shield size={18}/> },
//     { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={18}/> },
//     { label: "School", value: "500m", icon: <School size={18}/> },
//     { label: "College", value: "3km", icon: <GraduationCap size={18}/> },
//     { label: "Gym", value: "300m", icon: <Dumbbell size={18}/> },
//     { label: "Public transport", value: "1.7km", icon: <Bus size={18}/> },
//     { label: "Police station", value: "1.7km", icon: <Shield size={18}/> },
//     { label: "Pashupatinath", value: "7km", icon: <Landmark size={18}/> },
//     { label: "Boudhanath", value: "9km", icon: <Landmark size={18}/> },
//     { label: "Atm", value: "200m", icon: <Wallet size={18}/> },
//     { label: "Hotel", value: "500m", icon: <Hotel size={18}/> },
//     { label: "Restaurant", value: "1km", icon: <Utensils size={18}/> },
//     { label: "Banquet", value: "800m", icon: <Hotel size={18}/> },
//     { label: "Ward office", value: "400m", icon: <Building2 size={18}/> },
//   ];

//   return (
//     <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700 bg-background text-foreground">
      
//       {/* MAIN CARD */}
//       <div className="bg-card rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col lg:flex-row border border-border lg:h-162.5">
        
//         {/* LEFT SIDE: Image Gallery */}
//         <div className="relative w-full lg:w-[60%] bg-muted/30 flex flex-col border-r border-border h-100 lg:h-full">
//           <div className="relative flex-1 overflow-hidden group">
//             <img 
//               src={propertyImages[currentIndex]} 
//               className={`w-full h-full object-cover transition-all duration-700 ${isLocked ? 'blur-xl scale-110' : 'group-hover:scale-105'}`} 
//             />
//             {isLocked && (
//               <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-md">
//                 <div className="bg-card/90 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border">
//                   <Crown size={32} className="text-amber-500 mb-4" />
//                   <h3 className="text-xl font-bold text-foreground mb-2">Premium Gallery</h3>
//                   <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">Get Premium</button>
//                 </div>
//               </div>
//             )}
//             <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button onClick={prevImage} className="p-3 bg-background/20 backdrop-blur-xl text-foreground rounded-full hover:bg-card transition-all"><ChevronLeft size={28} /></button>
//               <button onClick={nextImage} className="p-3 bg-background/20 backdrop-blur-xl text-foreground rounded-full hover:bg-card transition-all"><ChevronRight size={28} /></button>
//             </div>
//             <div className="absolute top-8 left-8 flex gap-4 z-30">
//               <button onClick={onToggleFavorite} className="p-4 bg-card/90 rounded-2xl shadow-xl transition active:scale-95 border border-border">
//                 <Heart size={22} className={isFavorite ? "text-destructive fill-current" : "text-muted-foreground"} />
//               </button>
//               <button onClick={onShare} className="p-4 bg-card/90 rounded-2xl shadow-xl transition active:scale-95 border border-border">
//                 <Share2 size={22} className="text-muted-foreground" />
//               </button>
//             </div>
//           </div>
//           {/* Thumbnails */}
//           <div className="p-4 flex justify-center gap-3 bg-card border-t border-border">
//             {propertyImages.map((img, idx) => (
//               <button 
//                 key={idx} 
//                 onClick={() => setCurrentIndex(idx)} 
//                 className={`relative w-16 h-12 lg:w-20 lg:h-16 rounded-xl overflow-hidden border-2 transition-all ${currentIndex === idx ? "border-primary scale-105 shadow-md" : "border-transparent opacity-60"}`}
//               >
//                 <img src={img} className={`w-full h-full object-cover ${idx >= 3 ? 'blur-sm' : ''}`} />
//                 {idx >= 3 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Lock size={12} className="text-amber-400" /></div>}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* RIGHT SIDE: Quick Info */}
//         <div className="w-full lg:w-[40%] flex flex-col bg-card p-6 lg:p-8">
//           <div className="mb-4 flex items-center gap-3">
//             <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Exclusive Sale</span>
//             <div className="flex items-center gap-1.5 bg-accent px-2 py-1 rounded-lg border border-border">
//               <CheckCircle2 size={12} className="text-primary" />
//               <span className="text-primary text-[9px] font-bold uppercase tracking-wider">Verified</span>
//             </div>
//           </div>

//           <div className="mb-4 p-6 bg-muted/40 rounded-[1.5rem] border border-border">
//             <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">Land for Sale at Suryabinayak</h1>
//             <div className="flex items-center gap-2 text-foreground text-[13px] font-bold mb-3">
//               <MapPin size={14} className="text-destructive" /> 100000 location
//             </div>
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center gap-2 text-foreground text-[13px] font-bold">
//                 <Banknote size={14} className="text-primary" /> 2 crore 90 lak
//               </div>
//               <div className="text-[10px] font-normal text-primary uppercase tracking-widest ml-5">Negotiable</div>
//             </div>
//           </div>

//           <div className="mb-4 p-6 bg-muted/40 rounded-[1.5rem] border border-border">
//             <h3 className="text-foreground text-[11px] font-bold uppercase tracking-widest mb-2">Description</h3>
//             <p className="text-muted-foreground text-[12px] leading-relaxed font-medium">
//               Lalpurja Nepal brings you the wonderful land from Suryabinayak, Bhaktapur. The total land area of this property is 5 Aana with South facing and 13 feet road access touches this property.
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-3 mb-4">
//             <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
//               <MapIcon size={16} className="text-primary" /> 
//               <span className="font-bold text-[12px] text-foreground">Type: Land</span>
//             </div>
//             <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
//               <Ruler size={16} className="text-primary" /> 
//               <span className="font-bold text-[12px] text-foreground">Aana : 5</span>
//             </div>
//           </div>

//           <div onClick={() => setCurrentIndex(4)} className="mb-6 p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors group">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-primary/10 rounded-xl text-primary"><Crown size={20} /></div>
//                 <div>
//                   <h4 className="font-bold text-[13px] text-foreground">Premium Map</h4>
//                   <p className="text-[10px] text-primary font-semibold">Unlock Precise Data</p>
//                 </div>
//               </div>
//               <Lock size={14} className="text-primary/40" />
//             </div>
//           </div>

//           <div className="mt-auto flex gap-3 pt-4 border-t border-border">
//             <button onClick={handleBookNow} className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all">
//               Book Now
//             </button>
//             <button className="flex-1 border-2 border-border text-foreground py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-muted transition-all">
//               Contact
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* OVERVIEW & FACILITIES */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//         <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
//           <div className="px-10 py-8 border-b border-border bg-muted/30">
//             <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
//               <div className="w-1.5 h-6 bg-primary rounded-full" /> Property Overview
//             </h2>
//           </div>
//           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
//             {overviewData.map((item, i) => (
//               <div key={i} className="flex justify-between items-center group">
//                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
//                   {item.icon}
//                   <span className="text-[13px] font-medium">{item.label}:</span>
//                 </div>
//                 <span className="text-[13px] font-bold text-foreground text-right">{item.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
//           <div className="px-10 py-8 border-b border-border bg-muted/30">
//             <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
//               <div className="w-1.5 h-6 bg-primary rounded-full" /> Nearby Facilities
//             </h2>
//           </div>
//           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
//             {facilitiesData.map((item, i) => (
//               <div key={i} className="flex justify-between items-center group">
//                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
//                   {item.icon}
//                   <span className="text-[13px] font-medium">{item.label}:</span>
//                 </div>
//                 <span className="text-[13px] font-bold text-foreground text-right">{item.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import React, { useState } from "react";
import Image from "next/image"; // Added Next.js Image
import { useRouter } from "next/navigation";
import { Property } from "@/types/index";
import { 
  MapPin, Ruler, Building2, Share2, Heart, 
  ChevronLeft, ChevronRight, CheckCircle2,
  Lock, Crown, Navigation, Layers, Map as MapIcon,
  Banknote, Calendar, Info, Hospital, Plane, 
  ShoppingCart, School, Dumbbell, Bus, Utensils, Wallet
} from "lucide-react";

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyDetailsCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

export default function PropertyDetailsCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  onShare,
}: PropertyDetailsCardProps) {
  const router = useRouter();
  const { title, _id, images = [] } = property;
  const [currentIndex, setCurrentIndex] = useState(0);

  const propertyImages = images.length >= 5 ? images.slice(0, 5) : [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", 
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", 
    "https://images.unsplash.com/photo-1600607687940-4e5a994e5773", 
    "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e", 
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
  ].slice(0, 5);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  const isLocked = currentIndex >= 3;

  const handleBookNow = () => {
    router.push(`/appointments/new?propertyId=${_id}`);
  };

  const overviewData = [
    { label: "Property Type", value: "Land", icon: <Building2 size={16}/> },
    { label: "Purpose", value: "Sale", icon: <CheckCircle2 size={16}/> },
    { label: "Property Face", value: "South", icon: <Navigation size={16}/> },
    { label: "Property Area", value: "5 Aana", icon: <Ruler size={16}/> },
    { label: "Road Type", value: "Blacktopped", icon: <Layers size={16}/> },
    { label: "Road Access", value: "13 Feet", icon: <MapPin size={16}/> },
    { label: "Negotiable", value: "Yes", icon: <Wallet size={16}/> },
    { label: "Date Posted", value: "2025 Nov 18", icon: <Calendar size={16}/> },
    { label: "Municipality", value: "Suryabinayak", icon: <Building2 size={16}/> },
    { label: "Ward No.", value: "05", icon: <Info size={16}/> },
    { label: "Ring Road", value: "4km", icon: <Layers size={16}/> },
  ];

  const facilitiesData = [
    { label: "Hospital", value: "3km", icon: <Hospital size={16}/> },
    { label: "Airport", value: "14km", icon: <Plane size={16}/> },
    { label: "Bhatbhateni", value: "5km", icon: <ShoppingCart size={16}/> },
    { label: "School", value: "500m", icon: <School size={16}/> },
    { label: "Gym", value: "300m", icon: <Dumbbell size={16}/> },
    { label: "Public transport", value: "1.7km", icon: <Bus size={16}/> },
    { label: "Atm", value: "200m", icon: <Wallet size={16}/> },
    { label: "Restaurant", value: "1km", icon: <Utensils size={16}/> },
  ];

  return (
    <div className="w-full max-w-[95vw] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* MAIN PROPERTY CARD */}
      <Card className="overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] lg:h-[650px] flex flex-col lg:flex-row">
        
        {/* LEFT SIDE: Gallery */}
        <div className="relative w-full lg:w-[60%] bg-muted/20 flex flex-col border-r">
          <div className="relative flex-1 overflow-hidden group">
            <Image 
              src={propertyImages[currentIndex]} 
              alt={title || "Property Image"}
              fill
              priority
              className={cn(
                "object-cover transition-all duration-700",
                isLocked ? "blur-xl scale-110" : "group-hover:scale-105"
              )} 
            />
            
            {isLocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/20 backdrop-blur-md">
                <div className="bg-card/90 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center border border-border">
                  <Crown size={32} className="text-amber-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Premium Gallery</h3>
                  <Button size="lg" className="rounded-xl font-bold">Get Premium</Button>
                </div>
              </div>
            )}

            {/* Navigation Overlay */}
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="rounded-full bg-background/50 backdrop-blur-md" onClick={prevImage}>
                <ChevronLeft size={24} />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full bg-background/50 backdrop-blur-md" onClick={nextImage}>
                <ChevronRight size={24} />
              </Button>
            </div>

            {/* Top Actions */}
            <div className="absolute top-6 left-6 flex gap-3 z-30">
              <Button variant="secondary" size="icon" className="rounded-2xl shadow-xl hover:scale-105" onClick={onToggleFavorite}>
                <Heart size={20} className={isFavorite ? "text-destructive fill-current" : "text-muted-foreground"} />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-2xl shadow-xl hover:scale-105" onClick={onShare}>
                <Share2 size={20} className="text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="p-4 flex justify-center gap-3 bg-card/50 border-t">
            {propertyImages.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)} 
                className={cn(
                  "relative w-16 h-12 lg:w-20 lg:h-16 rounded-xl overflow-hidden border-2 transition-all",
                  currentIndex === idx ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image 
                  src={img} 
                  alt={`Thumbnail ${idx}`} 
                  fill 
                  className={cn("object-cover", idx >= 3 && "blur-[2px]")} 
                />
                {idx >= 3 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10"><Lock size={12} className="text-amber-400" /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Information (Scrollbar Removed) */}
        <div className="w-full lg:w-[40%] bg-card p-6 lg:p-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tighter">Exclusive Sale</Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-accent text-primary rounded-lg px-2 py-1 text-[10px] font-bold">
                <CheckCircle2 size={12} /> Verified
              </Badge>
            </div>

            <section className="p-6 bg-muted/40 rounded-[1.5rem] border border-border space-y-3">
              <h1 className="text-2xl font-bold leading-tight">{title || "Land for Sale at Suryabinayak"}</h1>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin size={16} className="text-destructive" /> Bhaktapur, Suryabinayak
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                  <Banknote size={20} /> 2 Crore 90 Lakh
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest ml-7">Negotiable</span>
              </div>
            </section>

            <section className="space-y-2 px-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground font-medium italic">
                Lalpurja Nepal brings you the wonderful land from Suryabinayak, Bhaktapur...
              </p>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <MapIcon size={18} className="text-primary" />
                <span className="text-xs font-bold">Land</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <Ruler size={18} className="text-primary" />
                <span className="text-xs font-bold">5 Aana</span>
              </div>
            </div>

            <div onClick={() => setCurrentIndex(4)} className="p-4 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl cursor-pointer hover:bg-primary/10 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform"><Crown size={20} /></div>
                  <div>
                    <h4 className="font-bold text-xs">Premium Map</h4>
                    <p className="text-[10px] text-primary/70 font-bold uppercase">Unlock Precise Data</p>
                  </div>
                </div>
                <Lock size={14} className="text-primary/40" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20" onClick={handleBookNow}>
                Book Now
              </Button>
              <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-bold uppercase text-[11px] tracking-widest border-2">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* OVERVIEW & FACILITIES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <DataCard title="Property Overview" data={overviewData} accentColor="bg-primary" />
        <DataCard title="Nearby Facilities" data={facilitiesData} accentColor="bg-green-500" />
      </div>
    </div>
  );
}

function DataCard({ title, data, accentColor }: { title: string, data: any[], accentColor: string }) {
  return (
    <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden bg-card">
      <CardHeader className="px-8 py-6 border-b bg-muted/30">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className={cn("w-1.5 h-6 rounded-full", accentColor)} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center group">
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10">{item.icon}</div>
              <span className="text-[13px] font-semibold">{item.label}:</span>
            </div>
            <span className="text-[13px] font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}





