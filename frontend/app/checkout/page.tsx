'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { MapPin, Store, Truck, User, CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    deliveryMethod: 'shipping', // 'shipping' ou 'pickup'
    shippingCity: 'Abidjan',
    shippingCommune: '',
    shippingAddress: '',
    createAccount: false,
    password: '',
    orderNote: ''
  });

  // 1. Initialisation : Vérifier le panier et l'utilisateur
  useEffect(() => {
    // Si panier vide, on dégage
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Pré-remplissage des données si connecté
    const token = localStorage.getItem('token');
    const savedName = localStorage.getItem('user_name'); // Ex: "Kouassi Jean"
    // Note : Pour l'email, il faudrait idéalement le stocker au login ou faire un appel /me
    // Pour l'instant on fait avec ce qu'on a.

    if (token && savedName) {
      setIsLoggedIn(true);

      // On tente de séparer le Nom complet (Approximatif)
      const nameParts = savedName.split(' ');
      const first = nameParts[0]; // Premier mot
      const last = nameParts.slice(1).join(' '); // Le reste

      setFormData(prev => ({
        ...prev,
        firstName: first || '',
        lastName: last || '',
        // createAccount est forcé à false car déjà connecté
        createAccount: false
      }));
    }
  }, [items, router]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        delivery_method: formData.deliveryMethod,
        shipping_city: formData.shippingCity,
        shipping_commune: formData.shippingCommune,
        shipping_address: formData.shippingAddress,
        create_account: formData.createAccount, // Sera false si connecté
        password: formData.password,
        order_note: formData.orderNote,
        items: items,
        total: cartTotal
    };

    try {
      const res = await fetch('http://localhost:8080/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        alert("Commande validée avec succès ! Merci de votre confiance.");
        router.push('/produits');
      } else {
        alert("Une erreur est survenue lors de la commande.");
      }
    } catch (error) {
      console.error(error);
      alert("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-8 text-center">Finaliser votre commande</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : FORMULAIRE */}
          <div className="md:col-span-2 space-y-6">
            
            {/* 1. Informations Personnelles */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-600"/> Informations
                </h2>
                {isLoggedIn && (
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle className="h-3 w-3"/> Connecté en tant que {formData.firstName}
                    </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Pour recevoir la facture" className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (Mobile Money)</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+225 07..." className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
              </div>

              {/* Option Créer Compte (Cachée si déjà connecté) */}
              {!isLoggedIn && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="createAccount" checked={formData.createAccount} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                      <span className="text-gray-700 font-medium">Créer un compte pour suivre ma commande</span>
                    </label>
                    
                    {formData.createAccount && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Choisissez un mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                            <input required={formData.createAccount} name="password" value={formData.password} onChange={handleChange} type="password" className="w-full border rounded-lg pl-10 p-2.5 outline-none focus:ring-1 focus:ring-primary-500" />
                        </div>
                      </div>
                    )}
                  </div>
              )}
            </div>

            {/* 2. Mode de Livraison */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary-600"/> Mode de récupération
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`border p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${formData.deliveryMethod === 'shipping' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="deliveryMethod" value="shipping" checked={formData.deliveryMethod === 'shipping'} onChange={handleChange} className="hidden" />
                  <div className="bg-white p-2 rounded-full shadow-sm"><Truck className="h-6 w-6 text-primary-600"/></div>
                  <div>
                    <span className="block font-bold text-gray-900">Livraison</span>
                    <span className="text-xs text-gray-500">Expédition 24h-48h</span>
                  </div>
                </label>

                <label className={`border p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${formData.deliveryMethod === 'pickup' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="deliveryMethod" value="pickup" checked={formData.deliveryMethod === 'pickup'} onChange={handleChange} className="hidden" />
                  <div className="bg-white p-2 rounded-full shadow-sm"><Store className="h-6 w-6 text-primary-600"/></div>
                  <div>
                    <span className="block font-bold text-gray-900">En Magasin</span>
                    <span className="text-xs text-gray-500">Récupération immédiate</span>
                  </div>
                </label>
              </div>

              {/* Champs d'adresse (Seulement si Livraison) */}
              {formData.deliveryMethod === 'shipping' && (
                <div className="mt-6 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <select name="shippingCity" value={formData.shippingCity} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-white">
                            <option value="Abidjan">Abidjan</option>
                            <option value="Bouaké">Bouaké</option>
                            <option value="Yamoussoukro">Yamoussoukro</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                        <input required name="shippingCommune" value={formData.shippingCommune} onChange={handleChange} type="text" placeholder="Ex: Cocody, Yopougon..." className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse précise (ou nom d'un tiers)</label>
                    <textarea required name="shippingAddress" rows={2} value={formData.shippingAddress} onChange={handleChange} placeholder="Rue, Appartement, ou 'Livrer à M. Konan au carrefour...'" className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500"></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Note de commande */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note de commande (Optionnel)</label>
                <textarea name="orderNote" value={formData.orderNote} onChange={handleChange} rows={2} placeholder="Instructions spéciales pour le livreur, emballage cadeau..." className="w-full border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary-500"></textarea>
            </div>

          </div>

          {/* COLONNE DROITE : RÉSUMÉ */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Votre Commande</h3>
              <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-2">
                {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">{(item.price * item.quantity).toLocaleString()} F</span>
                    </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2 text-gray-600">
                <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{cartTotal.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                    <span>Livraison</span>
                    {formData.deliveryMethod === 'shipping' ? (
                        <span className="text-gray-800 font-medium">1 500 F</span> 
                    ) : (
                        <span className="text-green-600">Gratuite</span>
                    )}
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary-600">
                    {(cartTotal + (formData.deliveryMethod === 'shipping' ? 1500 : 0)).toLocaleString()} F
                </span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin"/> : <CreditCard className="h-5 w-5"/>}
                Confirmer la commande
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">Paiement à la livraison</p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}