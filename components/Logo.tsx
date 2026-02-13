// components/Logo.tsx
import React from 'react';
import { UtensilsCrossed } from 'lucide-react'; 
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Container avec une taille standard Tailwind (h-12 = 48px) */}
      <div className="relative h-12 w-12 flex-shrink-0">
        <Image 
          src="/logo-jacquies.jpg" 
          alt="Logo Jacquie's Kitchen" 
          fill
          sizes="48px"
          priority // Charge le logo immédiatement
          className="object-contain"
          // Si l'image est quand même introuvable, on affiche au moins l'icône
          onError={(e) => {
             console.error("Image introuvable");
          }}
        />
      </div>

      {showText && (
        <span className="font-black text-gray-900 dark:text-white text-xl tracking-tighter uppercase italic leading-none">
          JACQUIE'S <span className="text-red-600">KITCHEN</span>
        </span>
      )}
    </div>
  );
}