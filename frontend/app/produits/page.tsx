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
    <div className="min-h-screen bg-gray-50">

      {/* ── BARRE SUPÉRIEURE ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tri */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-primary-300 transition-all"
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

          {/* Filtre mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold relative"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary-400 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Compteur résultats */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-2.5 flex items-center gap-3">
          <span className="text-xs text-gray-400">
            <span className="font-bold text-gray-700">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? "s" : ""}
            {searchTerm && <> pour <span className="italic">&quot;{searchTerm}&quot;</span></>}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setSearchTerm(""); }}
              className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

        {/* ── SIDEBAR DESKTOP ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-32">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" /> Catégories
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${selectedCategory === null ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span>Tous</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {products.length}
                  </span>
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${selectedCategory === cat.id ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span className="truncate pr-1">{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {categoryCount(cat.id)}
                    </span>
                  </button>
                  {selectedCategory === cat.id && subcategories.length > 0 && (
                    <ul className="mt-1 ml-3 pl-3 border-l-2 border-primary-100 space-y-0.5">
                      {subcategories.map(sc => (
                        <li key={sc.id}>
                          <button
                            onClick={() => setSelectedSubcategory(selectedSubcategory === sc.id ? null : sc.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${selectedSubcategory === sc.id ? "text-primary-700 font-bold bg-primary-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}
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
        </aside>

        {/* ── GRILLE PRODUITS ── */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Link href={`/produits/${product.id}`} className="block">
                    <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "4/3" }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.stock_quantity !== undefined && product.stock_quantity <= 3 && product.stock_quantity > 0 && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Plus que {product.stock_quantity}
                        </span>
                      )}
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full">Épuisé</span>
                        </div>
                      )}
                    </div>
                    <div className="px-3 pt-2.5 pb-1">
                      <h3 className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5em]">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-1 mt-0.5 hidden md:block">
                        {product.description || "Un indispensable pour bébé."}
                      </p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 mt-auto flex items-center justify-between gap-2 pt-1.5 border-t border-gray-50">
                    <div>
                      <span className="text-sm font-extrabold text-gray-900">{product.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 ml-1">F CFA</span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock_quantity === 0}
                      className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-90 shrink-0"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      <span className="hidden sm:inline">Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageX className="h-14 w-14 text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">Aucun produit trouvé</h3>
              <p className="text-gray-400 text-sm mt-1 mb-4">Essayez d&apos;autres mots-clés ou catégories.</p>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setSearchTerm(""); }}
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FILTRE MOBILE — PANEL ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-500" /> Catégories
              </h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 bg-gray-100 rounded-full">
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Tri mobile */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Trier par</p>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${sortBy === opt.value ? "bg-primary-600 text-white" : "bg-gray-50 text-gray-600"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Catégorie</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setSelectedCategory(null); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${selectedCategory === null ? "bg-primary-600 text-white" : "bg-gray-50 text-gray-600"}`}
              >
                Tous ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-left ${selectedCategory === cat.id ? "bg-primary-600 text-white" : "bg-gray-50 text-gray-600"}`}
                >
                  {cat.name} <span className="opacity-60 text-xs">({categoryCount(cat.id)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
