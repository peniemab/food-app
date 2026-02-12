// components/Logo.tsx
import React from 'react';
import { UtensilsCrossed } from 'lucide-react'; // Plus "Food" que Sparkles
import Image from 'next/image'; // On importe le composant Image de Next.js

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  const hasImageLogo = true; 

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasImageLogo ? (
        /* EMPLACEMENT POUR TON LOGO IMAGE */
        <div className="relative h-15 w-20">
          <Image 
            src="/logo-jacquies.jpg" 
            alt="Logo Jacquie's Kitchen" 
            fill 
            className="object-contain"
          />
        </div>
      ) : (
        <UtensilsCrossed className="w-10 h-10 text-red-600" />
      )}

      {showText && (
        <span className="font-black text-gray-900 dark:text-white text-xl tracking-tighter uppercase italic">
          JACQUIE'S <span className="text-red-600">KITCHEN</span>
        </span>
      )}
    </div>
  );
}