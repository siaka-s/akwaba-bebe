'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, Settings, LogOut, BookOpen } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Liste des liens du menu
  const menuItems = [
    { name: 'Produits', href: '/admin', icon: Package },
    { name: 'Catégories', href: '/admin/categories', icon: Tag },
    { name: 'Astuces', href: '/admin/articles', icon: BookOpen },
    // On pourra ajouter d'autres liens plus tard (Commandes, Clients...)
   
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* --- SIDEBAR (Menu Gauche) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        
        {/* Titre du Menu */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            Back-Office
          </h2>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            // Vérifie si le lien est actif (si l'URL correspond exactement ou commence par...)
            // Pour /admin, on veut que ce soit actif uniquement si c'est exactement /admin (pour ne pas allumer Produits quand on est sur Catégories)
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' || pathname?.startsWith('/admin/add')
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bas de page Sidebar */}
        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 w-full transition-colors">
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL (Page de droite) --- */}
      {/* On ajoute une marge à gauche (ml-64) pour ne pas passer sous la sidebar */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>

    </div>
  );
}