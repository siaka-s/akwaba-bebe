'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On cache le Header/Footer complet sur login/signup
  const hideLayoutFull = pathname === '/login' || pathname === '/signup';
  
  // On détecte si on est sur une page Admin
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!hideLayoutFull && <Header />}
      
      {children}
      
      {/* On cache le footer sur Login/Signup ET sur toutes les pages Admin */}
      {!hideLayoutFull && !isAdminPage && <Footer />}
    </>
  );
}