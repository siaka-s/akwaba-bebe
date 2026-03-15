"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Loader2, Truck, ShieldCheck, Gift } from "lucide-react";
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
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const PRICE_MAX = 50000;

  const { addToCart } = useCart();

  const filteredHeroProducts = heroScrollProducts.filter((p) => p.price <= maxPrice);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (!data) return;
        const shuffle = (arr: Product[]) => [...arr].sort(() => Math.random() - 0.5);
        const shuffled = shuffle(data);
        const hero = shuffled.slice(0, 10);
        setHeroScrollProducts(hero);
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

      {/* ── BANDEAU DE CONFIANCE ── */}
      <div className="bg-primary-600 text-white text-[11px] font-medium">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 md:gap-12 flex-wrap">
          <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Livraison à domicile à Abidjan</span>
          <span className="hidden sm:flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Produits certifiés &amp; sélectionnés</span>
          <span className="flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" /> Box cadeaux sur mesure</span>
        </div>
      </div>

      {/* ── HERO — SCROLL PRODUITS ── */}
      <section className="bg-white border-b border-gray-100">

        {/* Scroll */}
        {filteredHeroProducts.length > 0 ? (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-white to-transparent z-20 pointer-events-none" />
            <div className="overflow-x-auto flex gap-3 px-4 md:px-8 py-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filteredHeroProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produits/${product.id}`}
                  className="group/img snap-start shrink-0 relative w-36 md:w-44 aspect-3/4 block rounded-xl overflow-hidden shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-primary-600 text-primary-600 hover:text-white p-1.5 rounded-full shadow transition-all active:scale-90 z-10"
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
        ) : (
          <p className="text-center text-sm text-gray-400 py-10">Aucun produit dans cette gamme de prix.</p>
        )}

        {/* Filtre prix */}
        <div className="px-5 md:px-10 pt-1 pb-4">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <span className="text-[10px] text-gray-400 whitespace-nowrap">0 F</span>
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-primary-600"
              style={{ background: `linear-gradient(to right, #007D5A 0%, #007D5A ${(maxPrice / PRICE_MAX) * 100}%, #e5e7eb ${(maxPrice / PRICE_MAX) * 100}%, #e5e7eb 100%)` }}
            />
            <span className="text-[11px] font-bold text-primary-600 whitespace-nowrap min-w-18 text-right">
              ≤ {maxPrice.toLocaleString()} F
            </span>
          </div>
          {maxPrice >= PRICE_MAX && (
            <p className="text-center text-[10px] text-gray-400 mt-1.5">
              Au-delà de 50 000 F →{' '}
              <Link href="/produits" className="text-primary-600 font-semibold hover:underline">voir le catalogue</Link>
            </p>
          )}
        </div>
      </section>

      {/* ── SECTION PRODUITS ── */}
      <section className="bg-gray-50 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* En-tête section */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500 mb-0.5">Notre sélection</p>
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Produits du moment</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/composer-ma-box"
                className="hidden sm:flex items-center gap-1.5 bg-secondary-400 text-white px-3.5 py-2 rounded-full font-semibold hover:bg-secondary-500 transition-all text-xs active:scale-95"
              >
                <Gift className="h-3 w-3" /> Box cadeau
              </Link>
              <Link
                href="/produits"
                className="flex items-center gap-1 border border-primary-200 text-primary-600 px-3.5 py-2 rounded-full font-semibold hover:bg-primary-600 hover:text-white hover:border-transparent transition-all text-xs active:scale-95"
              >
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Bouton mobile box cadeau */}
          <Link
            href="/composer-ma-box"
            className="sm:hidden flex items-center justify-center gap-2 bg-secondary-400 text-white w-full py-2.5 rounded-xl font-semibold mb-4 text-sm active:scale-95"
          >
            <Gift className="h-4 w-4" /> Confectionner une box cadeau
          </Link>

          {/* Grille produits */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Link href={`/produits/${product.id}`} className="block">
                    <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '4/3' }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="px-3 pt-2.5 pb-1">
                      <h3 className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5em]">
                        {product.name}
                      </h3>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 mt-auto flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-gray-900">
                      {product.price.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">F CFA</span>
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all active:scale-90 shrink-0"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      <span className="hidden sm:inline">Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA bas de page */}
          {!loading && featuredProducts.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-md shadow-primary-200 active:scale-95"
              >
                Voir tous nos produits <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
