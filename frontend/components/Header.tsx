'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard, Settings, Package, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo'; 
import { useCart } from '@/context/CartContext'; 

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Contexte Panier
  const { cartCount } = useCart();

  // États pour l'authentification et l'UI
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  
  // États des Menus
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Ajout pour le mobile

  useEffect(() => {
    // Vérif localStorage au chargement et changement de page
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('user_role');
      const name = localStorage.getItem('user_name');

      if (token) {
        setIsLoggedIn(true);
        if (role === 'admin') setIsAdmin(true);
        if (name) setUserName(name);
      } else {
        setIsLoggedIn(false); 
      }
    }
    // On ferme les menus quand on change de page
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
      
      {/* 1. CORRECTION LARGEUR : max-w-screen-2xl au lieu de container */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="flex items-center justify-between">
          
          <Logo size="md" />
          
          {/* --- NAVIGATION PRINCIPALE (Desktop) --- */}
          {!isAdminPage && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Accueil</Link>
              <Link href="/produits" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Produits</Link>
              <Link href="/notre-histoire" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Notre histoire</Link>
              <Link href="/astuces" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Astuces</Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Contact</Link>
            </nav>
          )}

          {/* --- BADGE ADMIN --- */}
          {isAdminPage && (
             <div className="hidden md:block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-200">
               Espace Administration
             </div>
          )}
          
          <div className="flex items-center space-x-3">
            
            {/* --- PANIER --- */}
            {!isAdminPage && (
              <Link href="/cart" className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative group">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-secondary-500 text-white text-xs font-bold rounded-full flex items-center justify-center border border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* --- ZONE UTILISATEUR (Desktop) --- */}
            <div className="hidden md:flex items-center space-x-3 border-l pl-3 ml-2 border-gray-200 relative">
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

                  {/* --- MENU DÉROULANT PROFIL --- */}
                  <div className="relative">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 text-primary-900 font-medium hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                    >
                        <div className="bg-primary-50 p-1 rounded-full">
                            <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <span className="max-w-[100px] truncate">{userName}</span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-2">
                                {/* 2. CORRECTION LIEN : /profile au lieu de /profil */}
                                <Link href="/profil" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors">
                                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                                    Mon Profil
                                </Link>
                                <Link href="/orders" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors">
                                    <Package className="h-4 w-4 mr-3 text-gray-400" />
                                    Mes Commandes
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-red-600 transition-colors text-left"
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    )}
                  </div>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 bg-white text-primary-600 border border-primary-600 px-5 py-2 rounded-full text-sm font-bold hover:bg-primary-50 transition-all shadow-sm"
                >
                  <User className="h-5 w-5" />
                  <span>Connexion</span>
                </Link>
              )}
            </div>

            {/* 3. MENU MOBILE : Bouton Fonctionnel */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* --- CONTENU MENU MOBILE --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-5">
            <Link href="/" className="block py-2 text-gray-700 font-medium">Accueil</Link>
            <Link href="/produits" className="block py-2 text-gray-700 font-medium">Produits</Link>
            <Link href="/notre-histoire" className="block py-2 text-gray-700 font-medium">Notre histoire</Link>
            <Link href="/astuces" className="block py-2 text-gray-700 font-medium">Astuces</Link>
            <Link href="/contact" className="block py-2 text-gray-700 font-medium">Contact</Link>
            
            <div className="border-t border-gray-100 my-2 pt-2">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 py-2 text-primary-700 font-bold">
                    <User className="h-4 w-4" />
                    {userName}
                  </div>
                  <Link href="/profil" className="block py-2 text-gray-600 pl-6">Mon Profil</Link>
                  <Link href="/orders" className="block py-2 text-gray-600 pl-6">Mes Commandes</Link>
                  <button onClick={handleLogout} className="w-full text-left py-2 text-red-500 pl-6">Déconnexion</button>
                </>
              ) : (
                <Link href="/login" className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg font-bold">
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}