'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On cache le Header/Footer complet sur login/signup
  const hideLayoutFull = pathname === '/login' || pathname === '/signup';
  
  // On détecte si on est sur une page Admin pour cacher le Footer
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      
      {!hideLayoutFull && <Header />}
      
      {/* AJOUT : La balise main prend toute la largeur disponible (w-full) 
          et pousse le footer vers le bas (flex-grow) */}
      <main className="w-full pt-[73px]">
        {children}
      </main>
      
      {!hideLayoutFull && !isAdminPage && <Footer />}
      
    </div>
  );
}