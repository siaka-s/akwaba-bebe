'use client';

import { useEffect, useState } from 'react';
import { Package, Calendar, Truck, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiFetch';

interface MyOrder {
  id: number;
  total: number;
  status: string;
  created_at: string;
  delivery_method: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await apiFetch(`${API_URL}/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        }
      } catch (error) {
        // Informe l'utilisateur — le console.error seul était silencieux
        console.error("Erreur chargement commandes", error);
        toast.error("Impossible de charger vos commandes. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper pour la couleur du statut
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('livr')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('annul')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-primary-600" />
                Mes Commandes
            </h1>
            <Link href="/produits" className="text-primary-600 font-medium hover:underline">
                Continuer mes achats
            </Link>
        </div>

        {/* Liste des commandes */}
        {orders.length > 0 ? (
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            
                            {/* Info Gauche */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-900">Commande #{order.id}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Truck className="h-4 w-4" />
                                        {order.delivery_method === 'shipping' ? 'Livraison' : 'Retrait boutique'}
                                    </span>
                                </div>
                            </div>

                            {/* Prix & Action Droite */}
                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-xl font-bold text-primary-600">
                                        {order.total.toLocaleString()} FCFA
                                    </p>
                                </div>
                                {/* Le bouton détail (optionnel pour l'instant) */}
                                {/* <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </button> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            /* État Vide */
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-10 w-10 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune commande passée</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Vous n'avez pas encore effectué d'achats chez Akwaba Bébé. Découvrez nos produits pour commencer !
                </p>
                <Link 
                    href="/produits" 
                    className="inline-flex bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                    Découvrir la boutique
                </Link>
            </div>
        )}

      </div>
    </div>
  );
}