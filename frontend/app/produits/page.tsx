'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Filter, ShoppingCart } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    // ... (Le chargement des données reste le même) ...
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

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-8">Notre Catalogue</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR FILTRES */}
          <aside className="w-full md:w-64 shrink-0">
             {/* ... (Le code des filtres reste le même) ... */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary-500"/> Filtres
              </h3>
              <ul className="space-y-2">
                <li><button onClick={() => setSelectedCategory(null)} className="text-gray-600 hover:bg-gray-50 w-full text-left px-3 py-2 rounded-lg">Tous les produits</button></li>
                {categories.map(cat => (
                  <li key={cat.id}><button onClick={() => setSelectedCategory(cat.id)} className="text-gray-600 hover:bg-gray-50 w-full text-left px-3 py-2 rounded-lg">{cat.name}</button></li>
                ))}
              </ul>
            </div>
          </aside>

          {/* GRILLE PRODUITS */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  // 👇👇👇 C'EST ICI LA CORRECTION IMPORTANTE 👇👇👇
                  href={`/produits/${product.id}`} 
                  // 👆👆👆 On utilise "produits" comme le nom de ton dossier
                  className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary-600">{product.name}</h2>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary-600">{product.price.toLocaleString()} FCFA</span>
                        <div className="bg-primary-50 p-2 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <ShoppingCart className="h-5 w-5"/>
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}