"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Filter, ShoppingCart, Search, PackageX, X, ChevronDown, SlidersHorizontal } from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "default", label: "Par défaut" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "A → Z" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
        ]);
        setProducts((await resProd.json()) || []);
        setCategories((await resCat.json()) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 });
    toast.success("Ajouté au panier ! 🛒");
  };

  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchSubcategory = selectedSubcategory ? p.subcategory_id === selectedSubcategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSubcategory && matchSearch;
  });

  const filteredProducts = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "name_asc") return a.name.localeCompare(b.name);
    return 0;
  });

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedSubcategory ? 1 : 0) + (searchTerm ? 1 : 0);
  const categoryCount = (catId: number) => products.filter(p => p.category_id === catId).length;

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-primary-500 h-10 w-10" />
      </div>
    );

  return (
    <div className="bg-white lg:h-[calc(100vh-73px)] lg:flex lg:flex-col">
      <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:flex lg:flex-col lg:flex-1 lg:overflow-hidden">

        {/* ── RECHERCHE + TRI ── */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="flex-1 bg-gray-50 p-1 rounded-2xl flex items-center gap-3 border border-gray-100">
            <Search className="h-5 w-5 text-gray-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="flex-1 bg-transparent outline-none text-gray-700 p-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="mr-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tri */}
          <div className="relative hidden sm:block shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-600 hover:border-primary-300 transition-all whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt.value ? "text-primary-600 font-bold bg-primary-50" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:flex-1 lg:overflow-hidden pb-8">

          {/* BOUTON FILTRE MOBILE */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-primary-600 text-white p-4 rounded-xl font-bold shadow-lg mb-6 relative"
          >
            <Filter className="h-5 w-5" /> Filtrer par catégorie
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary-400 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* ── SIDEBAR ── */}
          <aside
            className={`fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-64 shrink-0 ${isMobileMenuOpen ? "block" : "hidden lg:block"}`}
          >
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 lg:p-0 lg:bg-transparent lg:relative lg:w-full lg:block">
              <div className="flex items-center justify-between lg:hidden mb-6">
                <h3 className="font-bold text-xl">Filtres</h3>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-white lg:p-6 lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm sticky top-6">
                <h3 className="font-black text-xs uppercase tracking-widest text-primary-900 mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary-500" /> Catégories
                </h3>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => { setSelectedCategory(null); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedCategory === null ? "bg-primary-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      <span>Tous les produits</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === null ? "bg-white/20" : "bg-gray-100 text-gray-400"}`}>{products.length}</span>
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedCategory === cat.id ? "bg-primary-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                      >
                        <span className="truncate pr-1">{cat.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${selectedCategory === cat.id ? "bg-white/20" : "bg-gray-100 text-gray-400"}`}>{categoryCount(cat.id)}</span>
                      </button>
                      {selectedCategory === cat.id && subcategories.length > 0 && (
                        <ul className="mt-1 ml-3 space-y-1 border-l-2 border-primary-100 pl-3">
                          {subcategories.map(sc => (
                            <li key={sc.id}>
                              <button
                                onClick={() => { setSelectedSubcategory(selectedSubcategory === sc.id ? null : sc.id); setIsMobileMenuOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${selectedSubcategory === sc.id ? "text-primary-700 font-bold bg-primary-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
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

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setSearchTerm(""); }}
                    className="mt-4 w-full text-xs text-gray-400 hover:text-primary-600 flex items-center justify-center gap-1 py-2 border border-dashed border-gray-200 rounded-xl transition-colors"
                  >
                    <X className="h-3 w-3" /> Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* ── GRILLE PRODUITS ── */}
          <div className="flex-1 lg:overflow-y-auto lg:pr-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
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
                      <div className="px-3 pt-3 pb-2 relative z-10 bg-white flex flex-col gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug tracking-tight truncate pr-2 group-hover:text-primary-600">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-1 pr-2">
                          {product.description || "Un indispensable pour bébé."}
                        </p>
                        <span className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
                          En savoir plus
                        </span>
                      </div>
                    </Link>
                    <div className="px-3 pb-3 mt-auto flex items-center justify-between pt-1 border-t border-gray-50 bg-white">
                      <span className="font-bold text-gray-900 text-sm">
                        {product.price.toLocaleString()} F
                      </span>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-primary-600 p-1.5 rounded-full text-white hover:bg-primary-700 transition-all shadow-sm active:scale-90"
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
                <h3 className="text-xl font-bold text-gray-900">Aucun produit</h3>
                <p className="text-gray-500 text-sm mt-1">Désolé, aucune correspondance trouvée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
