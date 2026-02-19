'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function AddArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Article publié avec succès !');
        router.push('/admin/articles');
      } else {
        alert("Erreur lors de la publication");
      }
    } catch (err) {
      alert('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/admin/articles" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-8">
          <h1 className="text-2xl font-bold text-primary-900 mb-6">Nouvel Article</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'article</label>
              <input 
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                placeholder="Ex: 5 astuces pour le sommeil de bébé"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture (Lien URL)</label>
              <input 
                type="url" required
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                placeholder="https://..."
              />
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
              <textarea 
                required rows={10}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                placeholder="Écrivez votre article ici..."
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5 mr-2" /> Publier l'article</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}