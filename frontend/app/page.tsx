"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Star,
  Gift,
  Baby,
  Heart,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

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
    fetch("http://localhost:8080/products")
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
      quantity: 1,
    });
    toast.success("Ajouté au panier ! 🛒");
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* --- 1. HERO SECTION --- */}
      {showHero && (
        <section className="relative bg-primary-50 pt-8 pb-2 px-4 animate-in fade-in duration-700">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4 sm:px-6 relative z-10">
            {/* BLOC 1 : TITRE */}
            <div className="flex-1 flex justify-center text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-900 leading-tight">
                <span className="text-secondary-500 text-center">
                  Votre expert maternité
                </span>
              </h1>
            </div>

            {/* BLOC 2 : DÉTAILS & ACTIONS */}
            <div className="flex-1 flex flex-col items-center text-center space-y-6">
              <div className="inline-flex flex-wrap justify-center gap-3 text-xs font-bold text-secondary-500 uppercase tracking-wide bg-white/60 px-4 py-2 rounded-full border border-primary-100">
                <span className="flex items-center gap-1">
                  <Gift className="h-3 w-3" /> Cadeaux
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Baby className="h-3 w-3" /> Maternité
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Soins
                </span>
              </div>

              <p className="text-gray-600 text-lg max-w-sm leading-relaxed">
                Nous accompagnons vos premiers moments de bonheur en toute
                sérénité
              </p>

              <div>
                <Link
                  href="/produits"
                  className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 hover:-translate-y-1"
                >
                  Voir le catalogue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* BLOC 3 : IMAGES HERO */}
            <div className="flex-1 flex gap-4 justify-center md:justify-end items-center mt-6 md:mt-0">
              <div className="relative w-32 md:w-44 aspect-3/4 mt-8 transform -rotate-2 hover:rotate-0 transition-all duration-500">
                <img
                  src="https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/1770909267101251000.jpeg"
                  alt="Maman et bébé joyeux"
                  className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                />
              </div>

              <div className="relative w-32 md:w-44 aspect-3/] mb-8 transform rotate-2 hover:rotate-0 transition-all duration-500">
                <img
                  src="https://akwaba-bebe-images.s3.eu-west-3.amazonaws.com/products/1770909858258004000.jpeg"
                  alt="Bébé souriant"
                  className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                />
              </div>
            </div>
          </div>

          {/* --- BORDURE BASSE ANIMÉE EN VERT --- */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary-600/40 to-transparent animate-pulse" />
        </section>
      )}

      {/* --- 3. BLOC PRODUITS --- */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/produits"
              className="hidden md:flex items-center text-primary-500 font-bold hover:underline text-xs uppercase tracking-wide"
            >
              Voir tout nos produits
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 border-none"
                >
                  <Link href={`/produits/${product.id}`} className="grow">
                    <div className="relative h-44 md:h-48 bg-white flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="px-3 pt-1 pb-2 relative z-10 bg-white">
                      <h3 className="font-bold text-gray-900 mb-4 text-sm leading-tight line-clamp-1 group-hover:text-primary-600">
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-gray-400 mb-1 leading-tight text-justify line-clamp-2">
                        {product.description || "Un indispensable pour bébé."}
                      </p>

                      <div className="mb-0">
                        <span className="text-[10px] font-bold text-primary-600 hover:text-primary-800 cursor-pointer">
                          En savoir plus
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-3 pb-3 mt-auto flex items-center justify-between pt-1 border-t border-gray-50 bg-white">
                    <span className="font-bold text-gray-900 text-sm">
                      {product.price.toLocaleString()} F
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-gray-50 p-1.5 rounded-full text-gray-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
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
