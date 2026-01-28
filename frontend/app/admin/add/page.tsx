'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

// On définit le type pour une catégorie
interface Category {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // État pour stocker la liste des catégories disponibles
  const [categories, setCategories] = useState<Category[]>([]);

  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '', // On démarre vide, l'utilisateur devra choisir
    image_url: ''
  });

  // 1. Au chargement, on va chercher les catégories existantes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8080/categories');
        const data = await res.json();
        setCategories(data || []);
        
        // Si des catégories existent, on sélectionne la première par défaut
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      } catch (err) {
        console.error("Erreur chargement catégories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');

    // Conversion des types
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      category_id: parseInt(formData.category_id.toString())
    };

    try {
      const res = await fetch('http://localhost:8080/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Produit créé avec succès !');
        router.push('/admin');
      } else {
        const error = await res.json();
        alert('Erreur: ' + error.message);
      }
    } catch (err) {
      alert('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/admin" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-8">
          <h1 className="text-2xl font-bold text-primary-900 mb-6">Nouveau Produit</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
              <input 
                name="name" required type="text" onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                placeholder="Ex: Lait en poudre Guigoz"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" required rows={3} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                placeholder="Détails du produit..."
              />
            </div>

            {/* --- NOUVEAU : SÉLECTEUR DE CATÉGORIE --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1 bg-white"
              >
                <option value="" disabled>-- Choisir une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Aucune catégorie trouvée. Créez-en une d'abord.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                <input 
                  name="price" required type="number" onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                  placeholder="5000"
                />
              </div>
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input 
                  name="stock_quantity" required type="number" onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien de l'image</label>
              <input 
                name="image_url" required type="url" onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-1"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Enregistrer le produit
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}