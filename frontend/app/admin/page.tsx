'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Edit, Loader2, AlertTriangle, Tag } from 'lucide-react'; // J'ai ajouté l'icône Tag

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  // On initialise avec [] pour éviter le crash "map of null"
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Vérification de sécurité Côté Client
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'admin') {
      router.push('/login');
      return;
    }
    
    setIsAdmin(true);
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8080/products', {
        cache: 'no-store'
      });
      const data = await res.json();
      
      // Sécurité : Si l'API renvoie null, on met un tableau vide
      setProducts(data || []); 
      
    } catch (error) {
      console.error(error);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        alert('Produit supprimé !');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur serveur');
    }
  };

  if (!isAdmin || loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary-500"/></div>;
  }

  // Sécurité d'affichage
  const productList = Array.isArray(products) ? products : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- EN-TÊTE DU DASHBOARD --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Gestion des Produits</h1>
            <p className="text-gray-500">Gérez votre catalogue Akwaba Bébé</p>
          </div>
          
          {/* ZONE DES BOUTONS D'ACTION */}
          <div className="flex gap-3">
            <Link 
              href="/admin/add" 
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              Ajouter un produit
            </Link>
          </div>
        </div>

        {/* --- TABLEAU DES PRODUITS --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Produit</th>
                <th className="p-4 font-semibold text-gray-600">Prix</th>
                <th className="p-4 font-semibold text-gray-600">Stock</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productList.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    {/* Image Placeholder si pas d'image */}
                    <div className="h-10 w-10 rounded-md bg-gray-200 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={product.image_url} 
                            alt="" 
                            className="h-full w-full object-cover"
                            onError={(e) => {e.currentTarget.style.display='none'}} // Cache si erreur
                        />
                    </div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                  </td>
                  <td className="p-4 text-primary-600 font-bold">{product.price.toLocaleString()} FCFA</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock_quantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock_quantity} en stock
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors" title="Modifier (Bientôt)">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {productList.length === 0 && (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
              <AlertTriangle className="h-10 w-10 text-yellow-400 mb-2"/>
              <p>Aucun produit trouvé.</p>
              <p className="text-sm mt-1">Commencez par ajouter une catégorie, puis un produit !</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}