'use client';

import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  // On récupère tout ce qu'il y a dans le panier
  const { items, removeFromCart, clearCart, cartTotal } = useCart();

  // CAS 1 : Le panier est vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
          <p className="text-gray-500 mb-8">Il semblerait que vous n'ayez pas encore craqué pour nos produits !</p>
          <Link href="/produits" className="block w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
            Retourner au catalogue
          </Link>
        </div>
      </div>
    );
  }

  // CAS 2 : Il y a des produits
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          Mon Panier
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : La liste des produits */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100">
                
                {/* Image du produit */}
                <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                </div>

                {/* Infos produit */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-primary-600 font-bold">{item.price.toLocaleString()} FCFA</p>
                  
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                      Quantité : {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Bouton Supprimer */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Retirer du panier"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}

            <button 
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline flex items-center gap-1 mt-6 pl-2"
            >
              <Trash2 className="h-4 w-4" /> Vider tout le panier
            </button>
          </div>

          {/* COLONNE DROITE : Le Résumé et Paiement */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Résumé de la commande</h2>
              
              <div className="space-y-3 border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="text-green-600 font-medium">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-gray-900">Total à payer</span>
                <span className="text-2xl font-bold text-primary-600">{cartTotal.toLocaleString()} FCFA</span>
              </div>

              <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2">
                Passer la commande <ArrowRight className="h-5 w-5" />
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">Paiement à la livraison ou Mobile Money</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}