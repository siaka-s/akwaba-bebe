'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  category_id: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Pour compter les produits
  const [loading, setLoading] = useState(true);

  // États pour l'ajout
  const [newCatName, setNewCatName] = useState('');
  
  // États pour l'édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // 1. Charger Catégories ET Produits (pour le compteur)
  const fetchData = async () => {
    try {
      const [resCat, resProd] = await Promise.all([
        fetch(`${API_URL}/categories`, { cache: 'no-store' }),
        fetch(`${API_URL}/products`, { cache: 'no-store' })
      ]);

      const cats = await resCat.json();
      const prods = await resProd.json();

      setCategories(cats || []);
      setProducts(prods || []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper pour compter les produits d'une catégorie
  const getProductCount = (catId: number) => {
    return products.filter(p => p.category_id === catId).length;
  };

  // --- AJOUTER UNE CATÉGORIE ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
        toast.error("Le nom ne peut pas être vide");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Session expirée");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- INDISPENSABLE
            },
            body: JSON.stringify({ name: newCatName }),
        });

        if (res.ok) {
            toast.success("Catégorie ajoutée !");
            setNewCatName('');
            fetchData(); // Recharger la liste
        } else {
            toast.error("Erreur lors de la création");
        }
    } catch (error) {
        toast.error("Erreur serveur");
    }
  };

  // --- SUPPRIMER (Avec Toast de confirmation) ---
  const handleDeleteClick = (id: number, count: number) => {
    if (count > 0) {
        toast.error(`Impossible : Cette catégorie contient ${count} produits.`);
        return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-bold text-gray-800">Supprimer cette catégorie ?</p>
        <div className="flex gap-2 justify-end">
            <button 
                onClick={() => toast.dismiss(t.id)}
                className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
                Non
            </button>
            <button 
                onClick={() => {
                    toast.dismiss(t.id);
                    executeDelete(id);
                }}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Oui
            </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const executeDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/categories/delete/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            toast.success("Catégorie supprimée");
            fetchData();
        } else {
            toast.error("Erreur suppression");
        }
    } catch (e) {
        toast.error("Erreur serveur");
    }
  };

  // --- MODIFIER ---
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/categories/update/${editingId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name: editName }),
        });

        if (res.ok) {
            toast.success("Catégorie modifiée");
            setEditingId(null);
            fetchData();
        } else {
            toast.error("Erreur modification");
        }
    } catch (e) {
        toast.error("Erreur serveur");
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-primary-900 mb-2">Gestion des Catégories</h1>
      <p className="text-gray-500 mb-8">Créez des catégories pour organiser vos produits.</p>

      {/* Formulaire Ajout */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Ajouter une nouvelle catégorie</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nom de la catégorie (ex: Hygiène, Vêtements...)"
            className="flex-1 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <button type="submit" className="bg-primary-600 text-white px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 shadow-md">
            <Plus className="h-5 w-5"/> Ajouter
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4 w-16 text-center">#</th>
              <th className="p-4">Nom de la catégorie</th>
              <th className="p-4 text-center">Produits associés</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, index) => {
              const productCount = getProductCount(cat.id);
              
              return (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  {/* Numéro simple (Index + 1) */}
                  <td className="p-4 text-center text-gray-400 font-medium">
                    {index + 1}
                  </td>
                  
                  {/* Nom (Mode Lecture ou Édition) */}
                  <td className="p-4 font-bold text-gray-800 text-lg">
                    {editingId === cat.id ? (
                        <input 
                          value={editName} 
                          autoFocus
                          onChange={(e) => setEditName(e.target.value)} 
                          className="border border-primary-300 p-2 rounded-lg w-full outline-none ring-2 ring-primary-100"
                        />
                    ) : (
                        cat.name
                    )}
                  </td>

                  {/* Nombre de produits */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        productCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        <Package className="h-3 w-3 mr-1"/>
                        {productCount} produit{productCount > 1 ? 's' : ''}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === cat.id ? (
                        <>
                            <button onClick={saveEdit} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"><Save className="h-4 w-4"/></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-4 w-4"/></button>
                        </>
                      ) : (
                        <>
                            <button onClick={() => startEdit(cat)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 className="h-4 w-4"/></button>
                            <button 
                                onClick={() => handleDeleteClick(cat.id, productCount)} 
                                className={`p-2 rounded-lg transition-colors ${
                                    productCount > 0 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' // Désactivé si produits liés
                                    : 'bg-red-50 text-red-500 hover:bg-red-100'
                                }`}
                                title={productCount > 0 ? "Impossible de supprimer : contient des produits" : "Supprimer"}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {categories.length === 0 && (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 text-orange-300 mb-2"/>
                <p>Aucune catégorie pour le moment.</p>
            </div>
        )}
      </div>
    </div>
  );
}