'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Charger les données
  const fetchData = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('http://localhost:8080/products', { cache: 'no-store' }),
        fetch('http://localhost:8080/categories', { cache: 'no-store' })
      ]);
      
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      setProducts(dataProd || []);
      setCategories(dataCat || []);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de récupérer les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 1. LA NOUVELLE FONCTION DE SUPPRESSION ---
  // Elle ne supprime pas tout de suite, elle demande confirmation via Toast
  const handleDelete = (id: number) => {
    
    // On crée un toast personnalisé
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[250px]">
        <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Supprimer ce produit ?</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible.</p>
            </div>
        </div>
        
        <div className="flex gap-2 mt-1 justify-end">
            {/* Bouton ANNULER */}
            <button 
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Annuler
            </button>

            {/* Bouton CONFIRMER (Lance la vraie suppression) */}
            <button 
                onClick={() => {
                    toast.dismiss(t.id); // On ferme la question
                    executeDelete(id);   // On lance l'action
                }}
                className="px-3 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
            >
                Oui, supprimer
            </button>
        </div>
      </div>
    ), {
        duration: 5000, // La question reste 5 secondes
        position: 'top-center',
        style: {
            background: '#fff',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6'
        }
    });
  };

  // --- 2. L'ACTION RÉELLE (Appel API) ---
  const executeDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Non autorisé");
        return;
    }

    const toastId = toast.loading("Suppression en cours...");

    try {
      const res = await fetch(`http://localhost:8080/products/delete/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success("Produit supprimé !", { id: toastId });
      } else {
        const err = await res.json();
        toast.error(err.message || "Erreur", { id: toastId });
      }
    } catch (error) {
      toast.error("Erreur serveur", { id: toastId });
    }
  };

  // Filtrage
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Non classé';
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Vos Produits</h1>
        <p className="text-gray-500 text-sm mt-1">{products.length} articles en ligne</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                <td className="p-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-800">{product.name}</td>
                <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {getCategoryName(product.category_id)}
                    </span>
                </td>
                <td className="p-4 font-medium text-primary-600">{product.price.toLocaleString()} F</td>
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
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                        href={`/admin/products/edit/${product.id}`} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" 
                    >
                        <Edit2 className="h-4 w-4" />
                    </Link>
                    {/* LE BOUTON DELETE APPELLE MAINTENANT NOTRE TOAST */}
                    <button 
                        onClick={() => handleDelete(product.id)} 
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
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