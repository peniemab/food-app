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
          src="/j-kitchen-logo.jpg" 
          alt="Logo Jacquie's Kitchen" 
          fill
          sizes="48px"
          priority 
          className="object-contain"
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