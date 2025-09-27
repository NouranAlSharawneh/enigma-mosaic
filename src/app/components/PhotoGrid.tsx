"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotos } from "../../contexts/PhotoContext";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function PhotoGrid() {
  const { photos } = usePhotos();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || photos.length === 0) {
    return null;
  }

  const photoCount = photos.length;

  // Calculate optimal grid layout based on photo count
  let columns;
  if (photoCount === 1) {
    columns = 1;
  } else if (photoCount === 2) {
    columns = 2;
  } else if (photoCount <= 4) {
    columns = 2;
  } else if (photoCount <= 9) {
    columns = 3;
  } else if (photoCount <= 16) {
    columns = 4;
  } else {
    columns = Math.min(5, Math.ceil(Math.sqrt(photoCount)));
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="grid w-full h-full gap-1 opacity-70 overflow-hidden rounded-[80px]"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        <AnimatePresence>
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              className="relative w-full h-full overflow-hidden shadow-lg border border-white/40 rounded-sm bg-gray-200"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <Image
                src={photo.dataUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={index < 4}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
