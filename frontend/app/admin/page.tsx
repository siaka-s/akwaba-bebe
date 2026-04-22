"use client";

import { useEffect, useState } from "react";
import { API_URL } from '../../config';
import {
  CreditCard, ShoppingBag, Clock, CheckCircle, AlertCircle,
  Loader2, Package, Tag, BookOpen, Plus, ArrowRight, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from '@/lib/apiFetch';

interface Order {
  id: number;
  total: number;
  status: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmé:  'bg-blue-50 text-blue-700 border-blue-200',
  livré:     'bg-green-50 text-green-700 border-green-200',
  annulé:    'bg-red-50 text-red-700 border-red-200',
};

function statusStyle(status: string) {
  const key = Object.keys(STATUS_STYLE).find(k => status?.toLowerCase().includes(k));
  return key ? STATUS_STYLE[key] : 'bg-gray-50 text-gray-600 border-gray-200';
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiFetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const revenue = orders
    .filter(o => o.status?.toLowerCase().includes("livr"))
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const pendingCount = orders.filter(o => {
    const s = o.status?.toLowerCase() || "";
    return !s.includes("livr") && !s.includes("annul");
  }).length;

  const deliveredCount = orders.filter(o => o.status?.toLowerCase().includes("livr")).length;
  const avgBasket = deliveredCount > 0 ? Math.round(revenue / deliveredCount) : 0;
  const recentOrders = [...orders].reverse().slice(0, 5);

  if (loading)
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
      </div>
    );

  return (
    <div className="space-y-6">

      {/* ── EN-TÊTE ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-xl border border-red-100 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" /> Erreur serveur
          </div>
        )}
        <Link href="/" target="_blank" className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-200 px-3 py-2 rounded-xl transition-all">
          <ExternalLink className="h-3.5 w-3.5" /> Voir la boutique
        </Link>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <CreditCard className="h-4.5 w-4.5 text-primary-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Revenus</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">{revenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">F</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-4.5 w-4.5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Livrées</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">{deliveredCount}</p>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 flex flex-col gap-3 relative overflow-hidden ${pendingCount > 0 ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-secondary-400 text-white px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
              Urgent
            </span>
          )}
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
            <Clock className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">À traiter</p>
            <p className={`text-xl font-extrabold mt-0.5 ${pendingCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Panier moyen</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">{avgBasket.toLocaleString()} <span className="text-sm font-normal text-gray-400">F</span></p>
          </div>
        </div>
      </div>

      {/* ── CORPS ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-extrabold text-gray-800">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <ShoppingBag className="h-10 w-10 mb-2" />
              <p className="text-sm">Aucune commande</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                      #{order.id}
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{Number(order.total).toLocaleString()} F</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Raccourcis */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-extrabold text-gray-800">Actions rapides</h2>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { href: '/admin/products/add', icon: Package, label: 'Ajouter un produit', color: 'text-primary-600 bg-primary-50' },
                { href: '/admin/categories', icon: Tag, label: 'Gérer les catégories', color: 'text-purple-600 bg-purple-50' },
                { href: '/admin/articles/add', icon: BookOpen, label: 'Écrire une astuce', color: 'text-blue-600 bg-blue-50' },
                { href: '/admin/orders', icon: ShoppingBag, label: 'Voir les commandes', color: 'text-orange-600 bg-orange-50' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{item.label}</span>
                  <Plus className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>

          {/* Taux de livraison */}
          {orders.length > 0 && (
            <div className="bg-primary-600 rounded-2xl p-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary-200 mb-1">Taux de livraison</p>
              <p className="text-3xl font-extrabold mb-3">
                {Math.round((deliveredCount / orders.length) * 100)}<span className="text-lg font-normal text-primary-300">%</span>
              </p>
              <div className="w-full bg-primary-500 rounded-full h-1.5">
                <div
                  className="bg-secondary-400 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((deliveredCount / orders.length) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-primary-300 mt-2">{deliveredCount} livrée{deliveredCount !== 1 ? 's' : ''} sur {orders.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
