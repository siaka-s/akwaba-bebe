'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Charger les catégories
  const fetchCategories = () => {
    fetch('http://localhost:8080/categories')
      .then(res => res.json())
      .then(data => setCategories(data || []));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // AJOUTER
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    await fetch('http://localhost:8080/categories', {
      method: 'POST',
      body: JSON.stringify({ name: newCatName }),
    });
    setNewCatName('');
    fetchCategories();
  };

  // SUPPRIMER
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette catégorie ? Attention, cela peut échouer si des produits y sont liés.')) return;
    
    const res = await fetch(`http://localhost:8080/categories/delete/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchCategories();
    } else {
      alert("Impossible de supprimer cette catégorie (probablement utilisée par des produits).");
    }
  };

  // COMMENCER L'ÉDITION
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  // SAUVEGARDER L'ÉDITION
  const saveEdit = async () => {
    if (!editingId) return;
    await fetch(`http://localhost:8080/categories/update/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    fetchCategories();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">Gestion des Catégories</h1>

      {/* Formulaire Ajout */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="font-bold text-lg mb-4">Ajouter une catégorie</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nom de la catégorie (ex: Hygiène)"
            className="flex-1 border rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button type="submit" className="bg-primary-600 text-white px-6 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700">
            <Plus className="h-5 w-5"/> Ajouter
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-gray-500">ID</th>
              <th className="p-4 text-gray-500">Nom</th>
              <th className="p-4 text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-400">#{cat.id}</td>
                <td className="p-4 font-bold text-gray-800">
                  {editingId === cat.id ? (
                      <input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="border p-1 rounded w-full"
                      />
                  ) : (
                      cat.name
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {editingId === cat.id ? (
                    <>
                        <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded"><Save className="h-5 w-5"/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded"><X className="h-5 w-5"/></button>
                    </>
                  ) : (
                    <>
                        <button onClick={() => startEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="h-5 w-5"/></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-5 w-5"/></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}