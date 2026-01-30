'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, ChevronDown, Check, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search logic
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    category_id: ''
  });

  // 1. Charger les données (Produit + Catégories)
  useEffect(() => {
    const initData = async () => {
        try {
            const [resCat, resProd] = await Promise.all([
                fetch('http://localhost:8080/categories'),
                fetch(`http://localhost:8080/products/${productId}`)
            ]);

            const cats = await resCat.json();
            const prod = await resProd.json();

            setCategories(cats || []);

            if (prod) {
                setFormData({
                    name: prod.name,
                    description: prod.description,
                    price: prod.price.toString(),
                    stock_quantity: prod.stock_quantity.toString(),
                    image_url: prod.image_url,
                    category_id: prod.category_id.toString()
                });

                // On pré-remplit le champ de recherche avec le nom de la catégorie actuelle
                const currentCat = cats.find((c: Category) => c.id === prod.category_id);
                if (currentCat) setCategorySearch(currentCat.name);
            }
        } catch (err) {
            console.error(err);
            toast.error("Impossible de charger le produit");
        } finally {
            setFetching(false);
        }
    };

    if (productId) initData();
  }, [productId]);

  // Fermer le dropdown si on clique dehors
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // Sélection d'une catégorie dans la liste
  const handleSelectCategory = (cat: Category) => {
    setFormData({ ...formData, category_id: cat.id.toString() });
    setCategorySearch(cat.name);
    setShowCategoryDropdown(false);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔴 SÉCURITÉ : Vérifier qu'une catégorie est bien sélectionnée
    if (!formData.category_id) {
        toast.error("Veuillez sélectionner une catégorie dans la liste.");
        setLoading(false);
        return;
    }

    const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url,
        category_id: parseInt(formData.category_id) // Mise à jour de la catégorie
    };

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Session expirée");
            router.push('/login');
            return;
        }

        const res = await fetch(`http://localhost:8080/products/${productId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success("Produit modifié avec succès !");
            setTimeout(() => router.push('/admin/products'), 1000);
        } else {
            const err = await res.json();
            throw new Error(err.message || "Erreur lors de la modification");
        }
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  if (fetching) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  return (
    <div className="max-w-3xl mx-auto pb-12 pt-6 px-4">
      <Link href="/admin/products" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour liste
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Modifier le Produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Nom */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prix (FCFA)</label>
                <div className="relative">
                    <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                    <span className="absolute right-4 top-3 text-gray-400 text-sm font-bold">FCFA</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
        </div>

        {/* --- CATÉGORIE (MODIFIÉE) --- */}
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
            <div className="relative">
                <input 
                    type="text"
                    value={categorySearch}
                    onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setShowCategoryDropdown(true);
                        // 🔴 IMPORTANT : Si on tape, on reset l'ID pour forcer une nouvelle sélection
                        setFormData({ ...formData, category_id: '' });
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder="Rechercher une catégorie..."
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                        !formData.category_id && categorySearch ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-300'
                    }`}
                />
                <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                    {showCategoryDropdown ? <Search className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </div>
            </div>

            {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200">
                    {filteredCategories.length > 0 ? (
                        <ul>
                            {filteredCategories.map(cat => (
                                <li 
                                    key={cat.id} 
                                    onClick={() => handleSelectCategory(cat)} 
                                    className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex justify-between items-center group transition-colors"
                                >
                                    <span className="font-medium text-gray-700 group-hover:text-primary-700">{cat.name}</span>
                                    {/* Coche visuelle si c'est la catégorie actuelle */}
                                    {formData.category_id === cat.id.toString() && <Check className="h-4 w-4 text-primary-600"/>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">Aucune catégorie trouvée.</div>
                    )}
                </div>
            )}
        </div>

        {/* Image */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Image</label>
            <div className="flex gap-4 items-start">
                <input required type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.image_url} alt="" className="h-full w-full object-cover"/>
                    ) : (
                        <ImageIcon className="text-gray-400 h-6 w-6"/>
                    )}
                </div>
            </div>
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg">
                {loading ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5"/>}
                Modifier le produit
            </button>
        </div>

      </form>
    </div>
  );
}