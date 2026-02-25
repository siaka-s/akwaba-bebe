'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Upload, Trash2, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiFetch';

export default function AddArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });

  // Upload image vers S3 (même logique que products/add)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image est trop lourde (max 10MB)");
      return;
    }

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image_url: data.url }));
        toast.success("Image téléchargée !");
      } else {
        toast.error("Erreur lors de l'upload de l'image");
      }
    } catch {
      toast.error("Erreur connexion serveur");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast.error("Veuillez ajouter une image de couverture.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await apiFetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Article publié avec succès !");
        setTimeout(() => router.push('/admin/articles'), 1000);
      } else {
        const err = await res.json();
        toast.error(err.message || "Erreur lors de la publication");
      }
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 pt-6 px-4">

      <Link href="/admin/articles" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit transition-colors font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Nouvel Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

        {/* Titre */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'article</label>
          <input
            type="text" required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Ex: 5 astuces pour le sommeil de bébé"
          />
        </div>

        {/* Upload image S3 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Image de couverture</label>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors bg-white">
            {formData.image_url ? (
              <div className="relative inline-block group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.image_url}
                  alt="Aperçu"
                  className="h-48 w-full object-cover rounded-lg shadow-sm border border-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                  title="Supprimer l'image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="text-xs text-green-600 font-bold mt-2 flex items-center justify-center gap-1">
                  <Check className="h-3 w-3" /> Image enregistrée
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-3" />
                      <span className="text-gray-500 font-medium">Enregistrement de l'image...</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary-50 p-4 rounded-full mb-3">
                        <Upload className="h-8 w-8 text-primary-600" />
                      </div>
                      <span className="text-gray-700 font-bold text-lg">Cliquez pour ajouter une image</span>
                      <span className="text-sm text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</span>
                    </>
                  )}
                </label>
              </>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Contenu de l'article</label>
          <textarea
            required rows={12}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            placeholder="Écrivez votre article ici..."
          />
        </div>

        {/* Bouton soumettre */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            Publier l'article
          </button>
        </div>

      </form>
    </div>
  );
}
