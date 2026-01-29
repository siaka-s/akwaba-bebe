'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, ChevronDown, Check, Search } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // --- NOUVEAUX ÉTATS POUR LA RECHERCHE CATÉGORIE ---
  const [categorySearch, setCategorySearch] = useState(''); // Ce que l'utilisateur tape
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // Afficher/Cacher la liste
  const dropdownRef = useRef<HTMLDivElement>(null); // Pour détecter le clic dehors (optionnel mais propre)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    category_id: ''
  });

  // Charger les catégories
  useEffect(() => {
    fetch('http://localhost:8080/categories')
      .then(res => res.json())
      .then(data => setCategories(data || []));
  }, []);

  // Fermer le dropdown si on clique ailleurs sur la page
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Gestion des champs classiques
  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // --- LOGIQUE SÉLECTION CATÉGORIE ---
  const handleSelectCategory = (cat: any) => {
    setFormData({ ...formData, category_id: cat.id.toString() }); // On enregistre l'ID caché
    setCategorySearch(cat.name); // On affiche le Nom dans le champ
    setShowCategoryDropdown(false); // On ferme la liste
  };

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification : L'utilisateur a-t-il sélectionné une vraie catégorie ?
    if (!formData.category_id) {
        alert("Veuillez sélectionner une catégorie valide dans la liste.");
        return;
    }

    setLoading(true);

    const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url,
        category_id: parseInt(formData.category_id)
    };

    try {
        const res = await fetch('http://localhost:8080/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            router.push('/admin/products');
        } else {
            alert("Erreur lors de la création du produit.");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur serveur.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      
      <Link href="/admin/products" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour liste
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Nouveau Produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Nom */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
            <input 
                required 
                type="text" 
                name="name" 
                placeholder="Ex: Lait Guigoz 1er âge"
                value={formData.name} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prix */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prix (FCFA)</label>
                <div className="relative">
                    <input 
                        required 
                        type="number" 
                        name="price" 
                        placeholder="0"
                        value={formData.price} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                    <span className="absolute right-4 top-3 text-gray-400 text-sm font-bold">FCFA</span>
                </div>
            </div>
            
            {/* Stock */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantité en stock</label>
                <input 
                    required 
                    type="number" 
                    name="stock_quantity" 
                    placeholder="10"
                    value={formData.stock_quantity} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                />
            </div>
        </div>

        {/* --- SÉLECTEUR DE CATÉGORIE INTELLIGENT (Combobox) --- */}
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
            
            {/* Champ de recherche / sélection */}
            <div className="relative">
                <input 
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={categorySearch}
                    onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setShowCategoryDropdown(true); // Ouvre la liste quand on tape
                        setFormData({...formData, category_id: ''}); // Réinitialise l'ID si on modifie le texte (sécurité)
                    }}
                    onFocus={() => setShowCategoryDropdown(true)} // Ouvre la liste au clic
                    className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                        !formData.category_id && categorySearch ? 'border-orange-300' : 'border-gray-300'
                    }`}
                />
                <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                    {showCategoryDropdown ? <Search className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </div>
            </div>

            {/* Liste déroulante filtrée */}
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
                                    {/* Petite coche si c'est celui sélectionné */}
                                    {formData.category_id === cat.id.toString() && <Check className="h-4 w-4 text-primary-600"/>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Aucune catégorie trouvée pour "{categorySearch}".
                            <br/>
                            <Link href="/admin/categories" className="text-primary-600 font-bold hover:underline">
                                Créer une catégorie ?
                            </Link>
                        </div>
                    )}
                </div>
            )}
            
            {/* Champ caché pour la validation HTML native (optionnel) */}
            <input type="hidden" name="category_id" value={formData.category_id} required />
        </div>

        {/* Image */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL de l'image</label>
            <div className="flex gap-4 items-start">
                <input 
                    required 
                    type="url" 
                    name="image_url" 
                    placeholder="https://..."
                    value={formData.image_url} 
                    onChange={handleChange} 
                    className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                />
                <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover"/>
                    ) : (
                        <ImageIcon className="text-gray-400 h-6 w-6"/>
                    )}
                </div>
            </div>
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description complète</label>
            <textarea 
                required 
                name="description" 
                rows={4} 
                placeholder="Détails du produit, composition..."
                value={formData.description} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
            />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
                type="submit" 
                disabled={loading}
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-200"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5"/>}
                Enregistrer le produit
            </button>
        </div>

      </form>
    </div>
  );
}