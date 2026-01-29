'use client';

import { useEffect, useState } from 'react';
import { Eye, Truck, Store, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  delivery_method: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/orders')
      .then(res => res.json())
      .then(data => setOrders(data || []))
      .finally(() => setLoading(false));
  }, []);

  // Fonction pour afficher le statut avec une couleur
  const getStatusBadge = (status: string) => {
    if (status === 'livré') return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3"/> Livré</span>;
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="h-3 w-3"/> En attente</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">Gestion des Commandes</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">#ID</th>
              <th className="p-4">Client</th>
              <th className="p-4">Montant</th>
              <th className="p-4">Livraison</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-gray-500">#{order.id}</td>
                <td className="p-4 font-bold text-gray-900">{order.customer_name}</td>
                <td className="p-4 font-medium text-primary-600">{order.total.toLocaleString()} F</td>
                <td className="p-4 text-sm text-gray-600">
                    {order.delivery_method === 'shipping' ? 
                        <span className="flex items-center gap-2"><Truck className="h-4 w-4"/> Livraison</span> : 
                        <span className="flex items-center gap-2"><Store className="h-4 w-4"/> Magasin</span>
                    }
                </td>
                <td className="p-4">{getStatusBadge(order.status)}</td>
                <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4 text-right">
                    {/* On créera cette page de détail juste après */}
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Voir les détails">
                        <Eye className="h-5 w-5" />
                    </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-500">Aucune commande pour le moment.</div>
        )}
      </div>
    </div>
  );
}