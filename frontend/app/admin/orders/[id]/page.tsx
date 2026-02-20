'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { ArrowLeft, User, Phone, MapPin, Truck, Calendar, ShoppingBag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/config';

interface OrderDetail {
  id: number;
  status: string;
  created_at: string;
  info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    delivery_method: string;
    shipping_city: string;
    shipping_commune: string;
    shipping_address: string;
    order_note: string;
    total: number;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter(); // <--- AJOUT
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [updating, setUpdating] = useState(false); // Pour l'effet de chargement

  const fetchOrder = () => {
    if (params.id) {
        fetch(`${API_URL}/orders/${params.id}`)
          .then(res => res.json())
          .then(data => setOrder(data))
          .catch(err => console.error(err));
      }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  // --- NOUVELLE FONCTION ---
  const handleUpdateStatus = async (newStatus: string) => {
    if(!confirm(`Voulez-vous passer la commande en statut : ${newStatus} ?`)) return;
    
    setUpdating(true);
    const token = localStorage.getItem('token'); // Nécessaire car protégé par IsAdmin

    try {
        const res = await fetch(`${API_URL}/orders/update/${params.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            fetchOrder(); // On rafraichit les données pour voir le changement
        } else {
            alert("Erreur lors de la mise à jour");
        }
    } catch (error) {
        console.error(error);
    } finally {
        setUpdating(false);
    }
  };

  if (!order) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Commande #{order.id}
            {/* Badge de statut dynamique */}
            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                order.status === 'livré' ? 'bg-green-100 text-green-700' : 
                order.status === 'annulé' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
            }`}>
              {order.status}
            </span>
          </h1>
          <p className="text-gray-500 flex items-center gap-2 text-sm mt-1">
            <Calendar className="h-4 w-4"/>
            {new Date(order.created_at).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (Infos identiques à avant) */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600"/> Client
            </h3>
            <div className="space-y-3 text-sm">
              <p className="font-bold text-lg">{order.info.first_name} {order.info.last_name}</p>
              <p className="text-gray-500">{order.info.email}</p>
              <div className="flex items-center gap-2 text-gray-800 font-medium bg-gray-50 p-2 rounded-lg">
                <Phone className="h-4 w-4"/> {order.info.phone}
              </div>
            </div>
          </div>
          {/* ... (Reste des infos livraison) ... */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary-600"/> Livraison
            </h3>
            <div className="space-y-3 text-sm">
              <p className="font-medium text-gray-700">
                Mode : {order.info.delivery_method === 'shipping' ? 'Expédition' : 'Retrait Magasin'}
              </p>
              {order.info.delivery_method === 'shipping' && (
                <div className="mt-2 border-t pt-2">
                  <p className="font-bold">{order.info.shipping_city}, {order.info.shipping_commune}</p>
                  <p className="text-gray-600 mt-1 flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400"/>
                    {order.info.shipping_address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : BOUTONS D'ACTION EN BAS */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* ... (Liste articles identique à avant) ... */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary-600"/> Articles ({order.items.length})
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-50 h-10 w-10 rounded-lg flex items-center justify-center font-bold text-primary-700">
                      x{item.quantity}
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-600">
                    {(item.price * item.quantity).toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>

            {/* SECTION FINANCIÈRE ET ACTIONS */}
            <div className="bg-gray-50 p-6">
                <div className="flex justify-between items-center mb-2 text-gray-600">
                    <span>Sous-total</span>
                    <span>{order.info.total.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-gray-600">
                    <span>Livraison</span>
                    <span>{order.info.delivery_method === 'shipping' ? '1 500 F' : 'Gratuit'}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
                    <span className="font-bold text-lg text-gray-900">Total à payer</span>
                    <span className="font-bold text-2xl text-primary-600">
                        {(order.info.total + (order.info.delivery_method === 'shipping' ? 1500 : 0)).toLocaleString()} F
                    </span>
                </div>
                
                {/* --- LES BOUTONS ACTIFS --- */}
                <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
                    {order.status !== 'annulé' && (
                        <button 
                            onClick={() => handleUpdateStatus('annulé')}
                            disabled={updating}
                            className="px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2"
                        >
                            {updating ? <Loader2 className="animate-spin h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                            Annuler
                        </button>
                    )}
                    
                    {order.status !== 'livré' && (
                        <button 
                            onClick={() => handleUpdateStatus('livré')}
                            disabled={updating}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow hover:bg-green-700 flex items-center gap-2"
                        >
                           {updating ? <Loader2 className="animate-spin h-4 w-4"/> : <CheckCircle className="h-4 w-4"/>}
                           Marquer comme Livré
                        </button>
                    )}

                    {order.status === 'livré' && (
                        <div className="text-green-600 font-bold flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                            <CheckCircle className="h-5 w-5"/> Commande terminée
                        </div>
                    )}
                </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}