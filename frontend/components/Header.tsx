'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // On récupère le nombre d'articles en temps réel
  const { cartCount } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Vérification côté client uniquement pour éviter les erreurs d'hydratation
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('user_role');
      const name = localStorage.getItem('user_name');

      if (token) {
        setIsLoggedIn(true);
        if (role === 'admin') setIsAdmin(true);
        if (name) setUserName(name);
      }
    }
  }, [pathname]); // On ré-écoute pathname pour mettre à jour si on change de page

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');
    router.push('/login');
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-primary-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          <Logo size="md" />
          
          {/* Navigation standard */}
          {!isAdminPage && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/produits" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Produits</Link>
              <Link href="/notre-histoire" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Notre histoire</Link>
              <Link href="/astuces" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Astuces</Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Contact</Link>
            </nav>
          )}

          {/* Badge Admin */}
          {isAdminPage && (
             <div className="hidden md:block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-200">
               Espace Administration
             </div>
          )}
          
          <div className="flex items-center space-x-3">
            
            {/* --- LE BOUTON PANIER CONNECTÉ --- */}
            {!isAdminPage && (
              <Link href="/cart" className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative group">
                <ShoppingCart className="h-6 w-6" />
                
                {/* Badge rouge : s'affiche si cartCount > 0 */}
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-secondary-500 text-white text-xs font-bold rounded-full flex items-center justify-center border border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            
            <div className="hidden md:flex items-center space-x-3 border-l pl-3 ml-2 border-gray-200">
              {isLoggedIn ? (
                <>
                  {isAdmin && !isAdminPage && (
                    <Link href="/admin" className="flex items-center text-secondary-600 font-bold mr-2 hover:text-secondary-700">
                      <LayoutDashboard className="h-5 w-5 mr-1" />
                      Admin
                    </Link>
                  )}
                  {isAdminPage && (
                    <Link href="/" className="text-sm text-gray-500 hover:text-primary-600 mr-2 underline">
                      Voir le site
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-primary-900 font-medium">
                     <div className="bg-primary-50 p-1 rounded-full">
                        <User className="h-4 w-4 text-primary-600" />
                     </div>
                     <span>{userName}</span>
                  </div>
                  <button onClick={handleLogout} className="ml-2 text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors" title="Se déconnecter">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 bg-white text-primary-600 border border-primary-600 px-5 py-2 rounded-full text-sm font-bold hover:bg-primary-50 transition-all shadow-sm"
                  >
                    <User className="h-5 w-5" />
                    <span>Connexion</span>
                  </Link>
                </>
              )}
            </div>
            <button className="md:hidden p-2 text-gray-600"><Menu className="h-6 w-6" /></button>
          </div>
        </div>
      </div>
    </header>
  );
}