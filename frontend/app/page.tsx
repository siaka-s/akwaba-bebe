'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShoppingCart, Truck, ShieldCheck, Star, 
  Gift, Baby, Heart, ChevronUp, ChevronDown 
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État pour gérer la visibilité du Hero (Affiché par défaut)
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/products')
      .then((res) => res.json())
      .then((data) => {
        setFeaturedProducts(data ? data.slice(0, 8) : []);
      })
      .catch((err) => console.error("Erreur fetch produits:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- 1. HERO SECTION (Rétractable) --- */}
      {showHero && (
        <section className="bg-primary-50 pt-8 pb-4 px-4 border-b border-primary-100 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12">
            
            {/* Texte (Gauche) */}
            <div className="flex-1 space-y-3">
              <div className="inline-flex flex-wrap gap-2 text-xs font-bold text-secondary-600 uppercase tracking-wide mb-1">
                  <span className="flex items-center gap-1"><Gift className="h-3 w-3"/> Cadeaux de naissance</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1"><Baby className="h-3 w-3"/> Allaitement</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3"/> Post-partum</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-primary-900 leading-tight">
                <span className="text-secondary-500">L'expert maternité</span>
              </h1>
              
              <p className="text-gray-600 text-base md:text-lg max-w-lg leading-snug">
                Nous sélectionnons avec soin tout le nécessaire pour accompagner vos premiers moments de bonheur en toute sérénité.
              </p>
              
              <div className="flex gap-3 pt-2">
                <Link href="/produits" className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 text-sm">
                  Voir le catalogue <ArrowRight className="h-4 w-4"/>
                </Link>
              </div>
            </div>

            {/* Image (Droite) */}
            <div className="flex-1 w-full md:w-auto flex justify-center md:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1000&auto=format&fit=crop" 
                alt="Maman et bébé heureux" 
                className="rounded-2xl shadow-lg object-cover h-40 w-full md:h-56 md:w-auto rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-white"
              />
            </div>
          </div>
        </section>
      )}

      {/* --- 2. BARRE DE RASSURANCE (Contient le bouton) --- */}
      <div className="bg-white border-b border-gray-100 py-2 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 max-w-6xl flex justify-between items-center">
            
            {/* Les icônes de rassurance */}
            <div className="flex flex-1 flex-wrap gap-4 md:gap-8 text-xs text-gray-500 font-medium uppercase tracking-wide">
                <div className="flex items-center gap-1"><Truck className="h-3 w-3 text-primary-600"/> <span className="hidden sm:inline">Livraison Rapide</span></div>
                <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-primary-600"/> <span className="hidden sm:inline">Authentique</span></div>
                <div className="flex items-center gap-1"><Star className="h-3 w-3 text-primary-600"/> <span className="hidden sm:inline">Service Client 7j/7</span></div>
            </div>

            {/* LE BOUTON MASQUER/AFFICHER */}
            <button 
                onClick={() => setShowHero(!showHero)}
                className="text-xs font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors hover:bg-white hover:shadow-sm ml-4"
            >
                {showHero ? (
                    <>Masquer <ChevronUp className="h-3 w-3" /></>
                ) : (
                    <>Afficher <ChevronDown className="h-3 w-3" /></>
                )}
            </button>
        </div>
      </div>

      {/* --- 3. BLOC E-COMMERCE --- */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
            
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Les Plus Vendus <span className="text-2xl">🧸</span>
                    </h2>
                </div>
                <Link href="/produits" className="hidden md:flex items-center text-primary-600 font-bold hover:underline text-sm">
                    Tout voir <ArrowRight className="h-4 w-4 ml-1"/>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {featuredProducts.map((product) => (
                        <Link 
                            key={product.id} 
                            href={`/produits/${product.id}`}
                            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
                        >
                            {/* Image du produit */}
                            <div className="relative h-36 md:h-44 bg-white flex items-center justify-center p-2 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Informations Produit */}
                            <div className="p-3 flex-1 flex flex-col border-t border-gray-50">
                                {/* Titre */}
                                <h3 className="font-medium text-gray-900 mb-1 text-sm leading-tight line-clamp-1 group-hover:text-primary-600">
                                    {product.name}
                                </h3>
                                
                                {/* Description */}
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed h-8">
                                    {product.description || "Description courte du produit pour donner envie d'en savoir plus..."}
                                </p>

                                {/* Lien "Voir plus" */}
                                <span className="text-xs text-primary-600 font-medium underline decoration-primary-200 underline-offset-2 mb-3 inline-block">
                                    Voir plus
                                </span>

                                {/* Prix et Panier */}
                                <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
                                    <span className="font-bold text-gray-900 text-base">{product.price.toLocaleString()} F</span>
                                    
                                    <div className="bg-primary-50 p-1.5 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        <ShoppingCart className="h-4 w-4"/>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            {/* Bouton mobile */}
            <div className="mt-6 text-center md:hidden">
                <Link href="/produits" className="inline-block bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold w-full text-sm">
                    Voir tout le catalogue
                </Link>
            </div>

        </div>
      </section>

    </div>
  );
}
