"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

import { CropData } from "../utils/faceDetection";

export interface Photo {
  id: string;
  dataUrl: string;
  originalDataUrl?: string;
  cropData?: CropData;
  timestamp: string;
}

interface PhotoContextType {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
  refreshPhotos: () => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const usePhotos = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotos must be used within a PhotoProvider");
  }
  return context;
};

interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const loadPhotos = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("capturedPhotos");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPhotos(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error("Error parsing stored photos:", error);
          setPhotos([]);
        }
      }
    }
  };

  const savePhotos = (newPhotos: Photo[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("capturedPhotos", JSON.stringify(newPhotos));
    }
  };

  const addPhoto = (photo: Photo) => {
    const newPhotos = [...photos, photo];
    setPhotos(newPhotos);
    savePhotos(newPhotos);
  };

  const removePhoto = (id: string) => {
    const newPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(newPhotos);
    savePhotos(newPhotos);
  };

  const clearPhotos = () => {
    setPhotos([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("capturedPhotos");
    }
  };

  const refreshPhotos = useCallback(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <PhotoContext.Provider
      value={{
        photos,
        addPhoto,
        removePhoto,
        clearPhotos,
        refreshPhotos,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};