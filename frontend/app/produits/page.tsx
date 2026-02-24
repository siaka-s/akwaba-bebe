"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Filter,
  ShoppingCart,
  Search,
  PackageX,
  X,
  ArrowRight
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { API_URL } from "@/config";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
  subcategory_id: number | null;
}

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
        ]);
        const dataProd = await resProd.json();
        const dataCat = await resCat.json();
        setProducts(dataProd || []);
        setCategories(dataCat || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Charger les sous-catégories quand la catégorie change
  useEffect(() => {
    if (!selectedCategory) { setSubcategories([]); setSelectedSubcategory(null); return; }
    fetch(`${API_URL}/subcategories?category_id=${selectedCategory}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { setSubcategories(Array.isArray(data) ? data : []); setSelectedSubcategory(null); })
      .catch(() => setSubcategories([]));
  }, [selectedCategory]);

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

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchSubcategory = selectedSubcategory ? p.subcategory_id === selectedSubcategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSubcategory && matchSearch;
  });

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-primary-500 h-10 w-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- RECHERCHE --- */}
        <div className="bg-gray-50 p-1 rounded-2xl mb-8 flex items-center text-center gap-3 border border-gray-100 max-w-">
          <Search className="h-5 w-5 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="flex-1 bg-transparent outline-none text-gray-700 p-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* BOUTON FILTRE MOBILE */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-primary-600 text-white p-4 rounded-xl font-bold shadow-lg mb-6"
          >
            <Filter className="h-5 w-5" /> Filtrer par catégorie
          </button>

          {/* --- SIDEBAR --- */}
          <aside
            className={`
            fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-64 shrink-0
            ${isMobileMenuOpen ? "block" : "hidden lg:block"}
          `}
          >
            <div
              className="absolute inset-0 bg-black/50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 lg:p-0 lg:bg-transparent lg:relative lg:w-full lg:block">
              <div className="flex items-center justify-between lg:hidden mb-6">
                <h3 className="font-bold text-xl">Filtres</h3>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-white lg:p-6 lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm sticky top-24">
                <h3 className="font-black text-xs uppercase tracking-widest text-primary-900 mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary-500" /> Catégories
                </h3>

                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === null
                          ? "bg-primary-600 text-white shadow-md"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Tous les produits
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          selectedCategory === cat.id
                            ? "bg-primary-600 text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                      </button>

                      {/* Sous-catégories en retrait */}
                      {selectedCategory === cat.id && subcategories.length > 0 && (
                        <ul className="mt-1 ml-3 space-y-1 border-l-2 border-primary-100 pl-3">
                          {subcategories.map(sc => (
                            <li key={sc.id}>
                              <button
                                onClick={() => {
                                  setSelectedSubcategory(selectedSubcategory === sc.id ? null : sc.id);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                                  selectedSubcategory === sc.id
                                    ? "text-primary-700 font-bold bg-primary-50"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {sc.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* --- GRILLE PRODUITS (ALIGNÉE SUR L'ACCUEIL) --- */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 border-none"
                  >
                    <Link href={`/produits/${product.id}`} className="grow">
                      {/* Image : Taille réduite (h-44) */}
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

                        {/* Description : Justifiée, 3 lignes max */}
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

                    {/* Footer : Prix & Bouton Panier */}
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
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageX className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">
                  Aucun produit
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Désolé, aucune correspondance trouvée.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}