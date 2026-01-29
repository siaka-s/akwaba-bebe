'use client';

import { useEffect, useState } from 'react';
import { CreditCard, ShoppingBag, Clock, TrendingUp, ArrowRight, Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    total_orders: 0,
    pending_orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération des stats depuis le backend
    fetch('http://localhost:8080/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data || { revenue: 0, total_orders: 0, pending_orders: 0 });
      })
      .catch(err => console.error("Erreur chargement stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary-500"/></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Tableau de Bord</h1>
        <p className="text-gray-500 mt-1">Aperçu de l'activité de votre boutique Akwaba Bébé.</p>
      </div>

      {/* --- LES 3 CARTES STATISTIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* CARTE 1 : REVENUS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Chiffre d'affaires</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.revenue ? stats.revenue.toLocaleString() : 0} F
            </h3>
          </div>
        </div>

        {/* CARTE 2 : TOTAL COMMANDES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Commandes</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_orders}</h3>
          </div>
        </div>

        {/* CARTE 3 : EN ATTENTE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-xl relative">
            <Clock className="h-8 w-8" />
            {stats.pending_orders > 0 && (
                <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">À traiter</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pending_orders}</h3>
          </div>
        </div>
      </div>

      {/* --- SECTION ACTIONS RAPIDES --- */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Panneau de gauche : État des commandes */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-500"/> État des commandes
            </h3>
            
            {stats.pending_orders > 0 ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                    <p className="text-yellow-800 font-medium">
                        ⚠️ Vous avez <strong>{stats.pending_orders} commande(s)</strong> en attente de traitement.
                    </p>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                    <p className="text-green-800 font-medium">
                        ✅ Tout est calme. Aucune commande en attente.
                    </p>
                </div>
            )}

            <Link 
                href="/admin/orders" 
                className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
                Gérer les commandes <ArrowRight className="h-4 w-4 ml-2"/>
            </Link>
        </div>

        {/* Panneau de droite : Raccourcis */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2 opacity-80">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Statut du système</span>
                </div>
                <h3 className="font-bold text-2xl mb-2">Boutique en ligne</h3>
                <p className="opacity-90">Votre catalogue est actif et visible par les clients.</p>
            </div>
            
            <div className="mt-8">
                <Link 
                    href="/" 
                    target="_blank" 
                    className="inline-block bg-white text-primary-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
                >
                    Voir le site client
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}