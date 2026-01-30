'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Filter, ShoppingCart, Search, PackageX } from 'lucide-react';

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

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Logique de filtrage (Catégorie + Recherche Texte)
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de la page */}
        <div className="mb-8">
            <p className="text-gray-500 text-sm mt-2">Découvrez nos meilleurs produits pour maman et bébé.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- SIDEBAR FILTRES (Gauche) --- */}
          <aside className="w-full md:w-64 shrink-0">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              
              {/* Titre Filtres */}
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary-500"/> Catégories
                  </h3>
                  {selectedCategory && (
                      <button onClick={() => setSelectedCategory(null)} className="text-xs text-red-500 hover:underline">
                          Effacer
                      </button>
                  )}
              </div>

              {/* Liste des catégories */}
              <ul className="space-y-1">
                <li>
                    <button 
                        onClick={() => setSelectedCategory(null)} 
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === null 
                            ? 'bg-primary-50 text-primary-700 font-bold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Tous les produits
                    </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                      <button 
                        onClick={() => setSelectedCategory(cat.id)} 
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === cat.id 
                            ? 'bg-primary-50 text-primary-700 font-bold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* --- CONTENU PRINCIPAL (Droite) --- */}
          <div className="flex-1">
            
            {/* Barre de Recherche Produit */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Rechercher un produit (ex: Lait, Couches...)" 
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grille Produits */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <Link 
                        key={product.id} 
                        href={`/produits/${product.id}`} 
                        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
                    >
                    {/* Image */}
                    <div className="relative h-48 bg-white flex items-center justify-center p-4 overflow-hidden border-b border-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Infos (Style Accueil) */}
                    <div className="p-4 flex-1 flex flex-col">
                        {/* Titre Medium */}
                        <h2 className="font-medium text-gray-900 mb-1 text-base leading-tight line-clamp-1 group-hover:text-primary-600">
                            {product.name}
                        </h2>
                        
                        {/* Description 2 lignes */}
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed h-8">
                            {product.description || "Aucune description disponible."}
                        </p>

                        {/* Lien Voir plus */}
                        <span className="text-xs text-primary-600 font-medium underline decoration-primary-200 underline-offset-2 mb-4 inline-block w-fit">
                            Voir plus
                        </span>

                        {/* Prix et Bouton (Alignés en bas) */}
                        <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} F</span>
                            <div className="bg-primary-50 p-2 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <ShoppingCart className="h-4 w-4"/>
                            </div>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            ) : (
                /* État Vide */
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 text-center">
                    <PackageX className="h-16 w-16 text-gray-300 mb-4"/>
                    <h3 className="text-lg font-bold text-gray-900">Aucun produit trouvé</h3>
                    <p className="text-gray-500 text-sm mt-1">Essayez de changer de catégorie ou de modifier votre recherche.</p>
                    <button 
                        onClick={() => {setSearchTerm(''); setSelectedCategory(null);}}
                        className="mt-4 text-primary-600 font-bold hover:underline"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}