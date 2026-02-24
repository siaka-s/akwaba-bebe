'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Tag, LogOut, BookOpen, ShoppingBag, BarChart3, MessageSquare } from 'lucide-react';
import { API_URL } from '@/config';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_URL}/contact`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((m: { is_read: boolean }) => !m.is_read).length);
        }
      } catch {
        // silencieux
      }
    };
    fetchUnread();
  }, [pathname]);

  // Liste des liens du menu
  const menuItems = [
    { name: 'Tableau de bord', href: '/admin', icon: BarChart3 },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Produits', href: '/admin/products', icon: Package },
    { name: 'Catégories', href: '/admin/categories', icon: Tag },
    { name: 'Astuces', href: '/admin/articles', icon: BookOpen },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* --- SIDEBAR (Menu Gauche) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">

        {/* Titre du Menu */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors">
                <LayoutDashboard className="h-6 w-6 text-primary-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-primary-900 leading-tight">Back-Office</h2>
                <p className="text-xs text-gray-400">Akwaba Bébé</p>
            </div>
          </Link>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-5'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Messages' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bas de page Sidebar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL (Page de droite) --- */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>

    </div>
  );
}
