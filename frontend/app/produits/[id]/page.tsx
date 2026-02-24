'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Check, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';
import { useCart } from '../../../context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
}

export default function ProductDetailPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct(null); 
        }
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger le produit");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  // Fonction pour gérer l'ajout au panier avec alerte
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      // Alerte Succès Personnalisée
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Ajouté au panier ! 🛒</span>
          <span className="text-xs text-gray-500">{product.name}</span>
        </div>
      );
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-500">Oups, ce produit n'existe pas.</p>
        <Link href="/produits" className="text-primary-600 hover:underline">Retour au catalogue</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Fil d'ariane / Retour */}
        <Link href="/produits" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-6 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour au catalogue
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="grid grid-cols-1 lg:grid-cols-2">
                
                {/* --- COLONNE IMAGE --- 
                    - bg-white pour la propreté
                    - h-[400px] mobile / h-[600px] desktop pour donner de l'espace
                    - p-8 padding généreux pour que l'image respire
                */}
                <div className="bg-white h-[400px] lg:h-[600px] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-gray-100 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* --- COLONNE INFOS --- */}
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                    
                    {/* Badge Catégorie (Optionnel, statique pour l'instant) */}
                    <span className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-2">Akwaba Bébé</span>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-3xl font-bold text-primary-600">{product.price.toLocaleString()} FCFA</span>
                        {product.stock_quantity > 0 ? (
                            <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                                <Check className="h-3 w-3"/> En stock
                            </span>
                        ) : (
                            <span className="text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full">
                                Rupture de stock
                            </span>
                        )}
                    </div>

                    <div className="prose text-gray-600 mb-8 leading-relaxed">
                        <p>{product.description}</p>
                    </div>
                    
                    {/* BOUTON D'ACTION */}
                    <button 
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${
                          product.stock_quantity > 0 
                          ? 'bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-1' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-6 w-6" /> 
                      {product.stock_quantity > 0 ? 'Ajouter au panier' : 'Indisponible'}
                    </button>

                    {/* BLOCS DE RASSURANCE */}
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                            <Truck className="h-6 w-6 text-primary-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">Livraison Rapide</h4>
                                <p className="text-xs text-gray-500 mt-1">Expédition sous 24h à Abidjan</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-6 w-6 text-primary-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">Paiement Sécurisé</h4>
                                <p className="text-xs text-gray-500 mt-1">Payez à la livraison ou via Mobile Money</p>
                            </div>
                        </div>
                    </div>

                </div>
             </div>
        </div>
      </div>
    </div>
  );
}