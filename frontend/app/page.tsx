"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { API_URL } from "@/config";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
}

export default function Home() {
  const [heroScrollProducts, setHeroScrollProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (!data) return;
        const shuffle = (arr: Product[]) => [...arr].sort(() => Math.random() - 0.5);
        const shuffled = shuffle(data);
        setHeroScrollProducts(shuffled.slice(0, 10));
        setFeaturedProducts(shuffled.slice(10, 34));
      })
      .catch((err) => console.error("Erreur fetch:", err))
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
      quantity: 1,
    });
    toast.success("Ajouté au panier ! 🛒");
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* --- 1. HERO SECTION --- */}
      <section className="relative bg-white overflow-hidden">

        {/* Défilement horizontal — 10 produits */}
        {heroScrollProducts.length > 0 && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-5 w-8 bg-linear-to-r from-white to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-5 w-10 bg-linear-to-l from-white to-transparent z-20 pointer-events-none" />

            <div className="relative z-10 overflow-x-auto flex gap-4 px-5 md:px-10 pb-4 pt-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {heroScrollProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produits/${product.id}`}
                  className="group/img snap-start shrink-0 relative w-36 md:w-48 aspect-3/4 block rounded-2xl overflow-hidden shadow-lg border-4 border-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-primary-600 text-primary-600 hover:text-white p-1.5 rounded-full shadow-md transition-all duration-200 active:scale-90 z-10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-0 bg-linear-to-t from-primary-900/75 via-primary-700/20 to-transparent flex items-end p-3">
                    <div className="w-full">
                      <span className="text-white text-xs font-bold leading-snug line-clamp-1 block">
                        <span className="text-secondary-300">{product.name.split(' ')[0]}</span>{' '}{product.name.split(' ').slice(1).join(' ')}
                      </span>
                      <p className="text-white/80 text-[10px] leading-relaxed mt-0.5 max-h-0 overflow-hidden group-hover/img:max-h-12 transition-all duration-300 line-clamp-2">
                        {product.description || 'Un indispensable pour bébé.'}
                      </p>
                      <p className="text-secondary-300 text-[10px] font-bold mt-0.5 max-h-0 overflow-hidden group-hover/img:max-h-6 transition-all duration-300">
                        {product.price.toLocaleString()} F
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bouton voir le catalogue */}
        <div className="relative z-10 flex justify-center pb-5 pt-1">
          <Link
            href="/produits"
            className="bg-white border border-primary-200 text-primary-600 px-5 py-2 rounded-full font-semibold hover:bg-primary-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs active:scale-95"
          >
            Voir le catalogue <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* --- 3. BLOC PRODUITS --- */}
      <section className="py-8 min-h-screen bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/composer-ma-box"
              className="hidden md:flex items-center text-primary-500 font-bold hover:underline text-xs uppercase tracking-wide"
            >
              Confectionner un panier cadeaux
            </Link>

            <Link
              href="/produits"
              className="hidden md:flex items-center text-primary-500 font-bold hover:underline text-sm uppercase tracking-wide"
            >
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-5">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 border-none"
                >
                  <Link href={`/produits/${product.id}`} className="grow">
                    <div className="relative h-44 md:h-48 bg-white overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="px-3 pt-3 pb-2 relative z-10 bg-white flex flex-col gap-1.5">
                      <h3 className="font-semibold text-gray-900 text-[11px] leading-snug tracking-tight truncate pr-2 group-hover:text-primary-600">
                        {product.name}
                      </h3>

                      <div className="hidden md:block">
                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-1 pr-2">
                          {product.description || "Un indispensable pour bébé."}
                        </p>
                      </div>

                      <div className="hidden md:block">
                        <span className="text-[10px] font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
                          En savoir plus
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-2 pb-2 mt-auto flex items-center justify-between pt-1 border-t border-gray-50 bg-white">
                    <span className="font-bold text-gray-900 text-[11px]">
                      {product.price.toLocaleString()} F
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-gray-50 p-1 rounded-full text-gray-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <ShoppingCart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
