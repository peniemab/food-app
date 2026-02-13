import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  // On teste si l'image s'affiche, sinon on met l'icône de secours
  const imagePath = "/logo-jacquies.jpg"; 

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0">
        {/* On utilise une balise img standard pour éviter les caprices de Next Image au début */}
        <img 
          src={imagePath} 
          alt="Logo" 
          className="h-12 w-auto object-contain"
          onError={(e) => {
            // Si l'image ne charge pas, on cache l'image et on montre l'icône
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
          }}
        />
        <div className="fallback-icon hidden">
          <UtensilsCrossed className="w-10 h-10 text-red-600" />
        </div>
      </div>

      {showText && (
        <span className="font-black text-gray-900 dark:text-white text-xl tracking-tighter uppercase italic leading-none">
          JACQUIE'S <span className="text-red-600">KITCHEN</span>
        </span>
      )}
    </div>
  );
}