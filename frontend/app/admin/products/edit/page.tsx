'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Données
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    category_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
        // 1. Charger les catégories
        const catRes = await fetch('${API_URL}/categories');
        const catData = await catRes.json();
        setCategories(catData || []);

        // 2. Charger le produit
        if (params.id) {
            const prodRes = await fetch(`${API_URL}/products/${params.id}`);
            const prodData = await prodRes.json();
            setProduct(prodData);
            
            // Pré-remplir le formulaire
            setFormData({
                name: prodData.name,
                description: prodData.description,
                price: prodData.price,
                stock_quantity: prodData.stock_quantity,
                image_url: prodData.image_url,
                category_id: prodData.category_id
            });
        }
        setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Conversion des types pour Go (string -> int/float)
    const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: parseInt(formData.category_id)
    };

    const res = await fetch(`${API_URL}/products/update/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("Produit modifié avec succès !");
        router.push('/admin/products');
    } else {
        alert("Erreur lors de la modification");
    }
  };

  if (loading) return <div className="p-10"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/products" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour liste
      </Link>

      <h1 className="text-3xl font-bold text-primary-900 mb-8">Modifier le produit</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full border p-3 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prix (FCFA)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-3 rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full border p-3 rounded-lg" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border p-3 rounded-lg bg-white">
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Image</label>
            <input required name="image_url" value={formData.image_url} onChange={handleChange} className="w-full border p-3 rounded-lg" />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full border p-3 rounded-lg" />
        </div>

        <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 flex justify-center gap-2">
            <Save className="h-5 w-5"/> Enregistrer les modifications
        </button>

      </form>
    </div>
  );
}