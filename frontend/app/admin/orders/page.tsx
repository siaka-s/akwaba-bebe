'use client';

import { useEffect, useState } from 'react';
import { Eye, Package, Calendar, User, X, CheckCircle, Truck, Store, AlertCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';

// --- TYPES ---
interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total: number;         // <--- CORRECTION: 'total' et pas 'total_amount'
  status: string;
  created_at: string;
  delivery_method: string; // 'shipping' ou 'pickup'
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États Filtres
  const [dateFilter, setDateFilter] = useState('');

  // États Modale
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Charger la liste
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Tri par ID décroissant
      setOrders(Array.isArray(data) ? data.sort((a: Order, b: Order) => b.id - a.id) : []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- LOGIQUE DE FILTRAGE PAR DATE ---
  const filteredOrders = orders.filter(order => {
    if (!dateFilter) return true; // Si pas de date sélectionnée, on montre tout
    // On compare la partie "YYYY-MM-DD" seulement
    const orderDate = new Date(order.created_at).toISOString().split('T')[0];
    return orderDate === dateFilter;
  });

  // 2. Ouvrir les détails
  const handleViewDetails = async (order: Order) => {
    setLoadingDetails(true);
    setSelectedOrder(order);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders/${order.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const fullOrderData = await res.json();
        // On s'assure de garder les infos de base si le détail en manque
        setSelectedOrder({ ...order, ...fullOrderData });
      } else {
        toast.error("Impossible de charger le contenu");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 3. Modifier le statut
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/orders/update/${selectedOrder.id}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            toast.success(`Statut mis à jour : ${newStatus}`);
            
            // Mise à jour de la modale
            setSelectedOrder({ ...selectedOrder, status: newStatus });
            
            // Mise à jour de la liste principale
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
        } else {
            toast.error("Erreur mise à jour");
        }
    } catch (e) {
        toast.error("Erreur serveur");
    }
  };

  // Helper Couleurs Statut
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('livr')) return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3"/> Livré</span>;
    if (s.includes('annul')) return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><X className="h-3 w-3"/> Annulé</span>;
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Package className="h-3 w-3"/> En attente</span>;
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* HEADER + FILTRE DATE */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary-900">Gestion des Commandes</h1>
            <p className="text-gray-500 text-sm mt-1">{filteredOrders.length} commande(s) trouvée(s)</p>
        </div>
        
        {/* Filtre Date */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <Filter className="h-4 w-4 text-gray-400" />
            <input 
                type="date" 
                className="text-sm outline-none text-gray-600 cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
                <button onClick={() => setDateFilter('')} className="text-xs text-red-500 font-bold ml-2">X</button>
            )}
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">#ID</th>
              <th className="p-4">Client</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Livraison</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-gray-500">#{order.id}</td>
                <td className="p-4 font-bold text-gray-800">{order.customer_name}</td>
                <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </td>
                
                {/* PRIX CORRIGÉ */}
                <td className="p-4 font-bold text-primary-600">
                    {Number(order.total || 0).toLocaleString()} F
                </td>

                <td className="p-4 text-sm text-gray-600">
                    {order.delivery_method === 'shipping' ? 
                        <span className="flex items-center gap-1"><Truck className="h-4 w-4"/> Domicile</span> : 
                        <span className="flex items-center gap-1"><Store className="h-4 w-4"/> Magasin</span>
                    }
                </td>

                <td className="p-4">
                    {getStatusBadge(order.status)}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleViewDetails(order)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mb-2"/>
                <p>Aucune commande pour cette date.</p>
            </div>
        )}
      </div>

      {/* MODALE DÉTAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                
                {/* Header Modale */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Commande #{selectedOrder.id}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4"/> 
                            {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                        </p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500">
                        <X className="h-6 w-6"/>
                    </button>
                </div>

                {/* Contenu */}
                <div className="p-6 overflow-y-auto">
                    
                    {/* Bloc Infos */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <User className="h-4 w-4"/> Client
                            </h3>
                            <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.customer_email || 'Email non fourni'}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.customer_phone || 'Tél non fourni'}</p>
                        </div>
                        
                        <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Modifier le statut</h3>
                            <div className="mb-3">
                                {getStatusBadge(selectedOrder.status)}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleUpdateStatus('Livré')}
                                    className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    Marquer Livré
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus('Annulé')}
                                    className="flex-1 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Contenu du panier</h3>
                    
                    {loadingDetails ? (
                        <div className="text-center py-8 text-gray-500">Chargement des articles...</div>
                    ) : (
                        <table className="w-full text-left mb-6">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Produit</th>
                                    <th className="p-3 text-center">Qté</th>
                                    <th className="p-3 text-right">Prix Unit.</th>
                                    <th className="p-3 text-right rounded-r-lg">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {selectedOrder.items?.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{item.product_name}</td>
                                        <td className="p-3 text-center text-gray-600">x{item.quantity}</td>
                                        <td className="p-3 text-right text-gray-600">{Number(item.unit_price).toLocaleString()} F</td>
                                        <td className="p-3 text-right font-bold text-gray-900">
                                            {(item.unit_price * item.quantity).toLocaleString()} F
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div className="flex justify-end mt-4">
                        <div className="text-right">
                            <span className="text-gray-500 text-sm">Montant Total</span>
                            <div className="text-3xl font-bold text-primary-600 flex items-center justify-end gap-1">
                                {Number(selectedOrder.total || 0).toLocaleString()} <span className="text-lg">FCFA</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}