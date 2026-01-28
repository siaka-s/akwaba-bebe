'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Tag, Loader2, AlertTriangle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/categories', { cache: 'no-store' });
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Catégories</h1>
          <p className="text-gray-500">Organisez vos types de produits</p>
        </div>
        <Link 
          href="/admin/categories/add" 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <Plus className="h-5 w-5" />
          Ajouter une catégorie
        </Link>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 w-20">ID</th>
              <th className="p-4 font-semibold text-gray-600">Nom</th>
              <th className="p-4 font-semibold text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{cat.id}</td>
                <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary-400" />
                    {cat.name}
                </td>
                <td className="p-4 text-gray-600">{cat.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <AlertTriangle className="h-10 w-10 text-yellow-400 mb-2"/>
            Aucune catégorie trouvée.
          </div>
        )}
      </div>
    </div>
  );
}