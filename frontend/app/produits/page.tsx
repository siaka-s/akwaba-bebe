'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Filter, ShoppingCart, Search, PackageX, X, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Pour le mobile

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('http://localhost:8080/products'),
          fetch('http://localhost:8080/categories')
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

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 });
    toast.success("Ajouté au panier ! 🛒");
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-primary-500 h-10 w-10"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête de la page */}
        <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-secondary-500">Nos Produits</h1>
            <p className="text-gray-500 text-sm md:text-base mt-2">Découvrez le meilleur pour maman et bébé.</p>
        </div>

        {/* Barre de Recherche (Toujours visible et large) */}
        <div className="bg-gray-50 p-3 rounded-2xl mb-8 flex items-center gap-3 border border-gray-100 max-w-2xl">
            <Search className="h-5 w-5 text-gray-400 ml-2" />
            <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                className="flex-1 bg-transparent outline-none text-gray-700 p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* --- BOUTON FILTRE MOBILE (Visible uniquement sur mobile/tablette) --- */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-primary-600 text-white p-4 rounded-xl font-bold shadow-lg"
          >
            <Filter className="h-5 w-5"/> Filtrer par catégorie
          </button>

          {/* --- SIDEBAR FILTRES (Desktop fixe / Mobile Drawer) --- */}
          <aside className={`
            fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-72 shrink-0
            ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}
          `}>
            {/* Overlay mobile */}
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            
            {/* Contenu Sidebar */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 lg:p-0 lg:bg-transparent lg:relative lg:w-full lg:block animate-in slide-in-from-right lg:animate-none">
              <div className="flex items-center justify-between lg:hidden mb-6">
                <h3 className="font-bold text-xl">Filtres</h3>
                <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6"/></button>
              </div>

              <div className="bg-white lg:p-6 lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-primary-900">
                      <Filter className="h-5 w-5 text-primary-500"/> Catégories
                    </h3>
                </div>

                <ul className="space-y-2">
                  <li>
                      <button 
                          onClick={() => { setSelectedCategory(null); setIsMobileMenuOpen(false); }} 
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                              selectedCategory === null 
                              ? 'bg-primary-600 text-white shadow-md' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          Tous les produits
                      </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                        <button 
                          onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }} 
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                              selectedCategory === cat.id 
                              ? 'bg-primary-600 text-white shadow-md' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* --- GRILLE PRODUITS (Droite) --- */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                    <Link 
                        key={product.id} 
                        href={`/produits/${product.id}`} 
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full hover:-translate-y-1"
                    >
                    {/* Image */}
                    <div className="relative h-48 sm:h-64 bg-white flex items-center justify-center p-4">
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Infos */}
                    <div className="p-4 flex-1 flex flex-col">
                        <h2 className="font-bold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1 group-hover:text-primary-600">
                            {product.name}
                        </h2>
                        
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
                            {product.description || "Un indispensable pour bébé."}
                        </p>

                        <div className="mb-4">
                            <span className="text-xs font-bold text-primary-600 flex items-center gap-1">
                                En savoir plus <ChevronRight className="h-3 w-3"/>
                            </span>
                        </div>

                        <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-base sm:text-lg font-extrabold text-gray-900">{product.price.toLocaleString()} F</span>
                            <button 
                              onClick={(e) => handleAddToCart(e, product)}
                              className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                            >
                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5"/>
                            </button>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <PackageX className="h-16 w-16 text-gray-200 mb-4"/>
                    <h3 className="text-xl font-bold text-gray-900">Aucun produit</h3>
                    <p className="text-gray-500 text-sm mt-1">Modifiez vos filtres ou votre recherche.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}