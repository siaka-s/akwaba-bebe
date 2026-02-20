'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // Ajouté
import { API_URL } from '@/config';

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '' }); // Retiré description si non utilisé en BDD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Catégorie créée avec succès !');
        setTimeout(() => router.push('/admin/categories'), 1500);
      } else {
        toast.error(data.message || "Erreur lors de la création");
      }
    } catch (err) {
      toast.error('Connexion au serveur échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-center" />
      <div className="max-w-xl mx-auto">
        <Link href="/admin/categories" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux catégories
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-secondary-100 p-2 rounded-full">
              <Tag className="h-6 w-6 text-secondary-600"/>
            </div>
            <h1 className="text-2xl font-bold text-primary-900">Nouvelle Catégorie</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la catégorie</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Ex: Hygiène, Lait, Jouets..."
              />
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5 mr-2" /> Créer la catégorie</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}