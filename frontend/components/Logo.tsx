import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean; // Si le logo contient déjà le texte, on peut mettre false
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  
  // On définit la taille de l'image en pixels selon la taille demandée
  const imageSize = {
    sm: 30, // Petit
    md: 40, // Moyen
    lg: 60  // Grand
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      
      {/* L'IMAGE DU CLIENT */}
      <div className="relative overflow-hidden transition-transform duration-200 group-hover:scale-105">
        <Image 
          src="/logo.png"  // <--- Assure-toi que le nom correspond à ton fichier dans 'public'
          alt="Logo Akwaba Bébé"
          width={imageSize[size]} 
          height={imageSize[size]}
          className="object-contain" // Garde les proportions du logo
          priority // Charge l'image en priorité car c'est le logo
        />
      </div>
      
      {/* LE TEXTE (Optionnel : si le logo image n'a pas de texte) */}
      {showText && (
        <span className={`font-bold text-primary-800 ${textSizeClasses[size]} group-hover:text-primary-600 transition-colors duration-200`}>
          Akwaba Bébé
        </span>
      )}
    </Link>
  );
}