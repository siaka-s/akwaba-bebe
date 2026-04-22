'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Tag, LogOut, BookOpen, ShoppingBag, BarChart3, MessageSquare, Menu, X, Percent } from 'lucide-react';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiFetch';

const menuItems = [
  { name: 'Tableau de bord', href: '/admin', icon: BarChart3 },
  { name: 'Commandes', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Produits', href: '/admin/products', icon: Package },
  { name: 'Catégories', href: '/admin/categories', icon: Tag },
  { name: 'Astuces', href: '/admin/articles', icon: BookOpen },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Promotions', href: '/admin/promotions', icon: Percent },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await apiFetch(`${API_URL}/contact`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setUnreadCount(data.filter((m: { is_read: boolean }) => !m.is_read).length);
      } catch { /* silencieux */ }
    };
    fetchUnread();
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="w-60 bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full z-20">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900 leading-none">Back-Office</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Akwaba Bébé</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full" />}
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Messages' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all mb-0.5">
            <Package className="h-4.5 w-4.5 text-gray-400" />
            Voir la boutique
          </Link>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── HEADER MOBILE ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-extrabold text-gray-900">Back-Office</p>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* ── DRAWER MOBILE ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-extrabold text-gray-900">Menu</p>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {menuItems.map((item) => {
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className="flex-1">{item.name}</span>
                    {item.name === 'Messages' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-3 border-t border-gray-100">
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"
              >
                <LogOut className="h-5 w-5" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENU ── */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 min-h-screen">
        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
