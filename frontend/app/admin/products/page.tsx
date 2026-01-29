'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger Produits + Catégories
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
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction de suppression
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const res = await fetch(`http://localhost:8080/products/delete/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur serveur.");
    }
  };

  // Filtrage pour la recherche
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper pour trouver le nom de la catégorie
  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Non classé';
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Chargement du catalogue...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* En-tête (Titre seulement) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Vos Produits</h1>
        <p className="text-gray-500 text-sm mt-1">{products.length} articles en ligne</p>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher un produit par nom..." 
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tableau des Produits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4 w-20">Image</th>
              <th className="p-4">Nom</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                
                {/* Image */}
                <td className="p-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                </td>

                {/* Nom */}
                <td className="p-4 font-bold text-gray-800">
                    {product.name}
                </td>

                {/* Catégorie */}
                <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {getCategoryName(product.category_id)}
                    </span>
                </td>

                {/* Prix */}
                <td className="p-4 font-medium text-primary-600">
                    {product.price.toLocaleString()} F
                </td>

                {/* Stock */}
                <td className="p-4">
                    {product.stock_quantity > 0 ? (
                        <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                            {product.stock_quantity} en stock
                        </span>
                    ) : (
                        <span className="text-red-500 text-sm font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3"/> Rupture
                        </span>
                    )}
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                        href={`/admin/products/edit/${product.id}`} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" 
                        title="Modifier"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Link>
                    <button 
                        onClick={() => handleDelete(product.id)} 
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        title="Supprimer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mb-2"/>
                <p>Aucun produit trouvé.</p>
            </div>
        )}
      </div>

      {/* --- BOUTON EN BAS À DROITE (justify-end) --- */}
      <div className="flex justify-end">
        <Link 
          href="/admin/products/add" 
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" /> Nouveau Produit
        </Link>
      </div>

    </div>
  );
}