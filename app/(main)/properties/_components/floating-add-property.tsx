// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { Plus } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function FloatingAddProperty() {
//   const router = useRouter();

//   return (
//     <motion.div
//       drag
//       dragMomentum={false}
//       // Increased bottom initial position (y: -150)
//       initial={{ x: -20, y: -150 }} 
//       whileHover={{ scale: 1.1 }}
//       whileTap={{ scale: 0.9 }}
//       onClick={() => router.push("/properties/new")}
//       className="fixed bottom-10 right-10 z-[100] cursor-pointer group"
//     >
//       <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
//         Add Property
//       </div>

//       <div className="w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center border-4 border-background transition-transform">
//         <Plus size={28} className="text-primary-foreground stroke-[3px]" />
//       </div>
      
//       <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 -z-10" />
//     </motion.div>
//   );
// }




"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FloatingAddProperty() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    // Only navigate if it wasn't a drag operation
    if (!isDragging) {
      router.push("/properties/new");
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      // Initial position raised up
      initial={{ x: -20, y: -250 }} 
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Delay resetting isDragging so the click handler knows a drag just happened
        setTimeout(() => setIsDragging(false), 100);
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, cursor: "grabbing" }}
      onClick={handleClick}
      className="fixed bottom-10 right-10 z-[100] cursor-pointer group"
    >
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Add Property
      </div>

      <div className="w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center border-4 border-background transition-all">
        <Plus size={28} className="text-primary-foreground stroke-[3px]" />
      </div>
      
      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 -z-10" />
    </motion.div>
  );
}