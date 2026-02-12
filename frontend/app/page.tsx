'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShoppingCart, Truck, ShieldCheck, Star, 
  Gift, Baby, Heart, ChevronUp, ChevronDown 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

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
  const [showHero, setShowHero] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('http://localhost:8080/products')
      .then((res) => res.json())
      .then((data) => {
        setFeaturedProducts(data ? data.slice(0, 12) : []); 
      })
      .catch((err) => console.error("Erreur fetch produits:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1
    });
    toast.success("Ajouté au panier ! 🛒");
  };

  return (
    <div className="min-h-screen bg-white w-full">
      
      {/* --- 1. HERO SECTION (Sans bordure basse) --- */}
      {showHero && (
        <section className="bg-primary-50 pt-8 pb-8 px-4 animate-in fade-in duration-700">
          
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4 sm:px-6">

            {/* BLOC 1 : TITRE (Centré horizontalement dans sa colonne) */}
            <div className="flex-1 flex justify-center text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-900 leading-tight">
                <span className="text-secondary-500 text-center">Votre expert maternité</span>
              </h1>
            </div>
            
            {/* BLOC 2 : DÉTAILS & ACTIONS (Milieu) */}
            <div className="flex-1 flex flex-col items-center text-center space-y-6">
              
              {/* Tags avec text-secondary-500 */}
              <div className="inline-flex flex-wrap justify-center gap-3 text-xs font-bold text-secondary-500 uppercase tracking-wide bg-white/60 px-4 py-2 rounded-full border border-primary-100">
                  <span className="flex items-center gap-1"><Gift className="h-3 w-3"/> Cadeaux</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1"><Baby className="h-3 w-3"/> Maternité</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3"/> Soins</span>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-lg max-w-sm leading-relaxed">
                Nous sélectionnons avec soin tout le nécessaire pour accompagner vos premiers moments de bonheur en toute sérénité.
              </p>
              
              {/* Bouton Panier/Catalogue */}
              <div>
                <Link href="/produits" className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 hover:-translate-y-1">
                  Voir le catalogue <ArrowRight className="h-4 w-4"/>
                </Link>
              </div>
            </div>
            

            {/* BLOC 3 : IMAGES (Droite) */}
            <div className="flex-1 flex gap-4 justify-center md:justify-end items-center mt-6 md:mt-0">
              
              <div className="relative w-32 md:w-40 aspect-[3/4] mt-8 transform -rotate-2 hover:rotate-0 transition-all duration-500">
                <img 
                  src="https://scontent.fabj4-2.fna.fbcdn.net/v/t39.30808-6/622371531_1357199056422649_3776704752504007024_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGIT6wmZEns6D-qAuY2hUURGGz3EE5mj2wYbPcQTmaPbABGei22Iy34oqYvTMZu9hvZogzDhUSZuLs6QdFMDsx_&_nc_ohc=pRJP8npOb3MQ7kNvwFP-X8D&_nc_oc=AdnAyVgZSsL6b45mOEgFF-hoMn1TZzjRQxlGyczFA9R-TLuQy795VY5Ty775UJXVPSoKeq_DykP82FMKThMzwodZ&_nc_zt=23&_nc_ht=scontent.fabj4-2.fna&_nc_gid=DtwGxzHAZ8j6UFQQMW-jVQ&oh=00_AfsSHO049j0LFF_tQKF70fYj-8eNC9SlRPsuVbkHSovE0w&oe=6993C01D" 
                  alt="Maman épanouie" 
                  className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                />
              </div>

              <div className="relative w-32 md:w-40 aspect-[3/4] mb-8 transform rotate-2 hover:rotate-0 transition-all duration-500">
                 <img 
                  src="https://scontent.fabj4-2.fna.fbcdn.net/v/t39.30808-6/623776084_1356327289843159_4216976332138546345_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHaAX_lcSbPMIoZSYQl8J9VrJHGUHVwFFGskcZQdXAUUVie1b20sqmqNUucWLnGt3JXLTSvAJVgAYjn1uU17EC3&_nc_ohc=KS6z2PrbMf4Q7kNvwG_WYGh&_nc_oc=AdlWdH26mCSdd0u2Yw8UDjX9TFgUz5eaeCN8L3lrZwhJHXKVD9j_2FYUYXhkLH4tihJhtOMQaf5c_jXmgmedE3Cp&_nc_zt=23&_nc_ht=scontent.fabj4-2.fna&_nc_gid=P27IcMX9FkQ-c6I4qjeMAA&oh=00_AfvRlzRNx1cvrvuIUk_YyDs5Ixcy1rGbhEfvhP2sdd6mOw&oe=6993C530" 
                  alt="Bébé joyeux" 
                  className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                />
              </div>

            </div>
          </div>
        </section>
      )}

      {/* --- 2. BARRE DE RASSURANCE (Sans bordure) --- */}
      <div className="bg-white py-3 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex justify-between items-center">
            
            <div className="flex flex-1 flex-wrap gap-4 md:gap-10 text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary-600"/> <span className="hidden sm:inline">Livraison Rapide</span></div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-600"/> <span className="hidden sm:inline">Authentique</span></div>
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary-600"/> <span className="hidden sm:inline">Service Client 7j/7</span></div>
            </div>

            <button 
                onClick={() => setShowHero(!showHero)}
                className="text-xs font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors hover:bg-white ml-4"
            >
                {showHero ? <>Masquer <ChevronUp className="h-3 w-3" /></> : <>Afficher <ChevronDown className="h-3 w-3" /></>}
            </button>
        </div>
      </div>

      {/* --- 3. BLOC PRODUITS --- */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
            
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Nos coups de cœur <span className="text-3xl">🧸</span>
                    </h2>
                </div>
                {/* Couleur secondary-500 ici aussi */}
                <Link href="/produits" className="hidden md:flex items-center text-secondary-500 font-bold hover:underline text-sm uppercase tracking-wide">
                    Tout voir <ArrowRight className="h-4 w-4 ml-1"/>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {featuredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-2 border-none"
                        >
                            <Link href={`/produits/${product.id}`} className="flex-grow">
                                <div className="relative h-52 md:h-64 bg-white flex items-center justify-center p-4 overflow-hidden">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name} 
                                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-5 relative z-10 bg-white">
                                    <h3 className="font-bold text-gray-900 mb-1 text-base leading-snug line-clamp-1 group-hover:text-primary-600">
                                        {product.name}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed h-10">
                                        {product.description || "Un indispensable pour le confort de bébé et maman."}
                                    </p>

                                    <div className="mb-4">
                                        <span className="text-sm font-medium text-primary-600 hover:text-primary-800 underline decoration-primary-200 underline-offset-4">
                                            En savoir plus
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div className="px-5 pb-5 mt-auto flex items-center justify-between pt-2 border-t border-gray-50 bg-white">
                                <span className="font-extrabold text-gray-900 text-lg">{product.price.toLocaleString()} F</span>
                                
                                <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="bg-gray-100 p-2.5 rounded-full text-gray-600 hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-sm active:scale-90"
                                    title="Ajouter au panier"
                                >
                                    <ShoppingCart className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-10 text-center md:hidden">
                <Link href="/produits" className="inline-block bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold w-full text-base">
                    Voir tout le catalogue
                </Link>
            </div>

        </div>
      </section>

    </div>
  );
}