"use client";

import { useEffect, useState } from "react";
import { API_URL } from '../../config'; 
import {
  CreditCard,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  Loader2,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from '@/lib/apiFetch';

// TYPES ALIGNÉS SUR TON BACKEND (Handler Go)
interface Order {
  id: number;
  total: number; // Changé de total_price à total
  status: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiFetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur Dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Chiffre d'affaires (Somme des 'total' pour les commandes dont le statut contient "livr")
  const revenue = orders
    .filter((o) => o.status?.toLowerCase().includes("livr"))
    .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  // Commandes à traiter (Tout ce qui n'est pas Livré ou Annulé)
  const pendingOrdersCount = orders.filter((o) => {
    const s = o.status?.toLowerCase() || "";
    return !s.includes("livr") && !s.includes("annul");
  }).length;

  // Volume total de livraisons
  const deliveredOrdersCount = orders.filter((o) =>
    o.status?.toLowerCase().includes("livr"),
  ).length;

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );

  return (
    <div className="max-w-screen-2xl mx-auto pb-10">
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
            Tableau de <span className="text-secondary-500">Bord</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg italic tracking-tight">
            Analyse basée sur vos {orders.length} commandes réelles.
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 text-sm font-medium">
            <AlertCircle className="h-4 w-4" /> Erreur de synchronisation avec
            le serveur Go
          </div>
        )}
      </div>

      {/* --- CARTES STATISTIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 transition-all hover:shadow-md">
          <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Revenus (Livrées)
            </p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">
              {revenue.toLocaleString()}{" "}
              <span className="text-sm font-bold">F</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 transition-all hover:shadow-md">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Livrées
            </p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">
              {deliveredOrdersCount}
            </h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden transition-all hover:shadow-md">
          <div className="p-4 bg-orange-50 text-secondary-500 rounded-2xl">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              À traiter
            </p>
            <h3 className="text-3xl font-black text-secondary-500 mt-1">
              {pendingOrdersCount}
            </h3>
          </div>
          {pendingOrdersCount > 0 && (
            <div className="absolute top-0 right-0 bg-secondary-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter animate-pulse">
              Action requise
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary-600" /> État des ventes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-3xl">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                Panier Moyen
              </span>
              <span className="text-2xl font-black text-gray-900">
                {deliveredOrdersCount > 0
                  ? Math.round(revenue / deliveredOrdersCount).toLocaleString()
                  : 0}{" "}
                F
              </span>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                Total Commandes
              </span>
              <span className="text-2xl font-black text-gray-900">
                {orders.length}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <h3 className="text-2xl font-black mb-4 relative z-10 italic uppercase tracking-tighter leading-tight">
              Accès <br />
              Boutique
            </h3>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary-500 hover:text-white transition-all relative z-10"
            >
              Voir le site <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary-500" /> Raccourcis
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 group"
              >
                <span className="text-sm font-bold text-gray-700">
                  Gérer les commandes
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
