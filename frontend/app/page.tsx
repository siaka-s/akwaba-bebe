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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroImages, setHeroImages] = useState<Product[]>([]);   // BLOC 3 : allaitement
  const [heroImages2, setHeroImages2] = useState<Product[]>([]); // BLOC 1 : box
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/products`).then((r) => r.json()),
      fetch(`${API_URL}/categories`).then((r) => r.json()),
    ])
      .then(([data, cats]: [Product[], { id: number; name: string }[]]) => {
        if (!data) return setFeaturedProducts([]);

        const shuffle = (arr: Product[]) => [...arr].sort(() => Math.random() - 0.5);

        // Trouver les catégories cibles
        const boxCat = cats?.find((c) => c.name.toLowerCase().includes('box'));
        const allaitCat = cats?.find((c) => c.name.toLowerCase().includes('allait'));

        // BLOC 1 gauche : priorité "box"
        const boxPool = boxCat ? data.filter((p) => p.category_id === boxCat.id) : [];
        const left = boxPool.length >= 2 ? shuffle(boxPool).slice(0, 2) : shuffle(data).slice(0, 2);
        setHeroImages2(left);

        // BLOC 3 droit : priorité "allaitement", jamais les mêmes que BLOC 1
        const leftIds = new Set(left.map((p) => p.id));
        const allaitPool = allaitCat ? data.filter((p) => p.category_id === allaitCat.id && !leftIds.has(p.id)) : [];
        const right = allaitPool.length >= 2 ? shuffle(allaitPool).slice(0, 2) : shuffle(data).filter((p) => !leftIds.has(p.id)).slice(0, 2);
        setHeroImages(right);

        // Grille : exclure les 4 images hero
        const allHeroIds = new Set([...left, ...right].map((p) => p.id));
        setFeaturedProducts(shuffle(data).filter((p) => !allHeroIds.has(p.id)).slice(0, 24));
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
      {showHero && (
        <section className="relative bg-primary-50 pt-3 pb-3 px-4 animate-in fade-in duration-700 overflow-hidden">
          {/* Blobs décoratifs floutés animés */}
          <div className="absolute -top-10 left-[15%] w-72 h-72 bg-primary-300/30 rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:3s]" />
          <div className="absolute -bottom-10 right-[15%] w-64 h-64 bg-secondary-300/20 rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:4s] [animation-delay:1s]" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse [animation-duration:5s] [animation-delay:2s]" />

          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 relative z-10">

            {/* BLOC 1 : IMAGES HERO (box) */}
            {heroImages2.length >= 2 && (
              <div className="hidden md:flex flex-1 gap-4 justify-center items-center mt-6 md:mt-0">
                <Link href={`/produits/${heroImages2[0].id}`} className="group/img relative w-40 md:w-52 aspect-3/4 mb-8 transform rotate-2 hover:rotate-0 transition-all duration-500 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages2[0].image_url}
                    alt={heroImages2[0].name}
                    className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, heroImages2[0])}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-primary-600 text-primary-600 hover:text-white p-1.5 rounded-full shadow-md transition-all duration-200 active:scale-90 z-10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-primary-900/55 via-primary-700/10 to-transparent flex items-end p-3">
                    <div className="w-full">
                      <span className="text-white text-xs font-bold leading-snug line-clamp-1 block">
                        <span className="text-secondary-300">{heroImages2[0].name.split(' ')[0]}</span>{' '}
                        {heroImages2[0].name.split(' ').slice(1).join(' ')}
                      </span>
                      <p className="text-white/90 text-[10px] leading-relaxed line-clamp-4 mt-1.5 pb-1 max-h-0 overflow-hidden group-hover/img:max-h-24 transition-all duration-300">
                        {heroImages2[0].description}
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href={`/produits/${heroImages2[1].id}`} className="group/img relative w-40 md:w-52 aspect-3/4 mt-8 transform -rotate-2 hover:rotate-0 transition-all duration-500 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages2[1].image_url}
                    alt={heroImages2[1].name}
                    className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, heroImages2[1])}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-primary-600 text-primary-600 hover:text-white p-1.5 rounded-full shadow-md transition-all duration-200 active:scale-90 z-10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-primary-900/55 via-primary-700/10 to-transparent flex items-end p-3">
                    <div className="w-full">
                      <span className="text-white text-xs font-bold leading-snug line-clamp-1 block">
                        <span className="text-secondary-300">{heroImages2[1].name.split(' ')[0]}</span>{' '}
                        {heroImages2[1].name.split(' ').slice(1).join(' ')}
                      </span>
                      <p className="text-white/90 text-[10px] leading-relaxed line-clamp-4 mt-1.5 pb-1 max-h-0 overflow-hidden group-hover/img:max-h-24 transition-all duration-300">
                        {heroImages2[1].description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* BLOC 2 : DÉTAILS & ACTIONS */}
            <div className="flex-[0.5] flex flex-col items-center text-center space-y-10">
              <div className="inline-flex flex-nowrap justify-center gap-3 text-xs font-bold text-secondary-500 uppercase tracking-wide bg-white/60 px-4 py-2 rounded-full border border-primary-100 whitespace-nowrap">
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

              <div>
                <Link
                  href="/produits"
                  className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 hover:-translate-y-1"
                >
                  Voir le catalogue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* BLOC 3 : IMAGES HERO (allaitement) */}
            {heroImages.length >= 2 && (
              <div className="hidden md:flex flex-1 gap-4 justify-center items-center mt-6 md:mt-0">
                <Link href={`/produits/${heroImages[0].id}`} className="group/img relative w-40 md:w-52 aspect-3/4 mt-8 transform -rotate-2 hover:rotate-0 transition-all duration-500 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages[0].image_url}
                    alt={heroImages[0].name}
                    className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, heroImages[0])}
                    className="absolute top-3 left-3 bg-white/90 hover:bg-primary-600 text-primary-600 hover:text-white p-1.5 rounded-full shadow-md transition-all duration-200 active:scale-90 z-10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-primary-900/55 via-primary-700/10 to-transparent flex items-end p-3">
                    <div className="w-full">
                      <span className="text-white text-xs font-bold leading-snug line-clamp-1 block">
                        <span className="text-secondary-300">{heroImages[0].name.split(' ')[0]}</span>{' '}
                        {heroImages[0].name.split(' ').slice(1).join(' ')}
                      </span>
                      <p className="text-white/90 text-[10px] leading-relaxed line-clamp-4 mt-1.5 pb-1 max-h-0 overflow-hidden group-hover/img:max-h-24 transition-all duration-300">
                        {heroImages[0].description}
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href={`/produits/${heroImages[1].id}`} className="group/img relative w-40 md:w-52 aspect-3/4 mb-8 transform rotate-2 hover:rotate-0 transition-all duration-500 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages[1].image_url}
                    alt={heroImages[1].name}
                    className="rounded-2xl shadow-xl object-cover w-full h-full border-4 border-white"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, heroImages[1])}
                    className="absolute top-3 left-3 bg-white/90 hover:bg-primary-600 text-primary-600 hover:text-white p-1.5 rounded-full shadow-md transition-all duration-200 active:scale-90 z-10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-primary-900/55 via-primary-700/10 to-transparent flex items-end p-3">
                    <div className="w-full">
                      <span className="text-white text-xs font-bold leading-snug line-clamp-1 block">
                        <span className="text-secondary-300">{heroImages[1].name.split(' ')[0]}</span>{' '}
                        {heroImages[1].name.split(' ').slice(1).join(' ')}
                      </span>
                      <p className="text-white/90 text-[10px] leading-relaxed line-clamp-4 mt-1.5 pb-1 max-h-0 overflow-hidden group-hover/img:max-h-24 transition-all duration-300">
                        {heroImages[1].description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
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
