'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, ChevronDown, Check, Search, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Interface pour le typage
interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Chargement global (sauvegarde)
  const [uploadingImage, setUploadingImage] = useState(false); // Chargement spécifique upload image

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);

  // --- ÉTATS POUR LA RECHERCHE CATÉGORIE ---
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- ÉTATS POUR LA RECHERCHE SOUS-CATÉGORIE ---
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const subcategoryDropdownRef = useRef<HTMLDivElement>(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    category_id: '',
    subcategory_id: ''
  });

  // Charger les catégories
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => { if (!res.ok) throw new Error("Erreur serveur"); return res.json(); })
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); toast.error("Erreur chargement catégories"); setCategories([]); });
  }, []);

  // Charger les sous-catégories quand la catégorie change
  const fetchSubcategories = async (catId: string) => {
    if (!catId) { setSubcategories([]); return; }
    try {
      const res = await fetch(`${API_URL}/subcategories?category_id=${catId}`);
      const data = res.ok ? await res.json() : [];
      setSubcategories(Array.isArray(data) ? data : []);
    } catch { setSubcategories([]); }
  };

  // Fermer les dropdowns si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (subcategoryDropdownRef.current && !subcategoryDropdownRef.current.contains(event.target)) {
        setShowSubcategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, subcategoryDropdownRef]);

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // --- LOGIQUE SÉLECTION CATÉGORIE ---
  const handleSelectCategory = (cat: Category) => {
    setFormData({ ...formData, category_id: cat.id.toString(), subcategory_id: '' });
    setCategorySearch(cat.name);
    setSubcategorySearch('');
    setShowCategoryDropdown(false);
    fetchSubcategories(cat.id.toString());
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // --- LOGIQUE SÉLECTION SOUS-CATÉGORIE ---
  const handleSelectSubcategory = (sc: SubCategory) => {
    setFormData({ ...formData, subcategory_id: sc.id.toString() });
    setSubcategorySearch(sc.name);
    setShowSubcategoryDropdown(false);
  };

  const filteredSubcategories = subcategories.filter(sc =>
    sc.name.toLowerCase().includes(subcategorySearch.toLowerCase())
  );

  // --- NOUVELLE LOGIQUE : UPLOAD IMAGE VERS S3 ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Petite validation locale
    if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error("L'image est trop lourde (max 10MB)");
        return;
    }

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: uploadData // Pas de Content-Type manuel avec FormData !
        });

        if (res.ok) {
            const data = await res.json();
            // On met à jour le formulaire avec l'URL reçue de S3
            setFormData(prev => ({ ...prev, image_url: data.url }));
            toast.success("Image téléchargée !");
        } else {
            toast.error("Erreur lors de l'upload de l'image");
        }
    } catch (error) {
        console.error("Erreur upload", error);
        toast.error("Erreur connexion serveur");
    } finally {
        setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
      setFormData(prev => ({ ...prev, image_url: '' }));
  };

  // --- SOUMISSION GLOBALE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.category_id) {
        toast.error("Veuillez sélectionner une catégorie.");
        setLoading(false);
        return;
    }

    if (!formData.image_url) {
        toast.error("Veuillez ajouter une image.");
        setLoading(false);
        return;
    }

    const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url,
        category_id: parseInt(formData.category_id),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null
    };

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success("Produit ajouté avec succès ! 🚀");
            setTimeout(() => {
                router.push('/admin/products');
            }, 1000);
        } else {
            const errorData = await res.json();
            throw new Error(errorData.message || "Erreur création.");
        }
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 pt-6 px-4">
      
      <Link href="/admin/products" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 w-fit transition-colors font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour liste
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Nouveau Produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Nom */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
            <Input
                required
                type="text"
                name="name"
                placeholder="Ex: Lait Guigoz 1er âge"
                value={formData.name}
                onChange={handleChange}
            />
        </div>

        {/* Prix & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prix (FCFA)</label>
                <div className="relative">
                    <Input
                        required
                        type="number"
                        name="price"
                        min="0"
                        placeholder="0"
                        value={formData.price}
                        onChange={handleChange}
                        className="pr-14"
                    />
                    <span className="absolute right-4 top-2.5 text-gray-400 text-sm font-bold">FCFA</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantité en stock</label>
                <Input
                    required
                    type="number"
                    name="stock_quantity"
                    min="0"
                    placeholder="10"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                />
            </div>
        </div>

        {/* Catégorie */}
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={categorySearch}
                    onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setShowCategoryDropdown(true);
                        setFormData({...formData, category_id: ''});
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    className={`pr-10 ${!formData.category_id && categorySearch ? 'border-orange-300' : ''}`}
                />
                <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                    {showCategoryDropdown ? <Search className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </div>
            </div>

            {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {filteredCategories.length > 0 ? (
                        <ul>
                            {filteredCategories.map(cat => (
                                <li 
                                    key={cat.id} 
                                    onClick={() => handleSelectCategory(cat)}
                                    className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex justify-between items-center"
                                >
                                    <span>{cat.name}</span>
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

        {/* Sous-catégorie (conditionnelle) */}
        {formData.category_id && (
          <div ref={subcategoryDropdownRef} className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sous-catégorie <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={subcategories.length > 0 ? "Rechercher une sous-catégorie..." : "Aucune sous-catégorie disponible"}
                value={subcategorySearch}
                disabled={subcategories.length === 0}
                onChange={(e) => {
                  setSubcategorySearch(e.target.value);
                  setShowSubcategoryDropdown(true);
                  setFormData({ ...formData, subcategory_id: '' });
                }}
                onFocus={() => setShowSubcategoryDropdown(true)}
                className="pr-10"
              />
              <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                {showSubcategoryDropdown ? <Search className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>

            {showSubcategoryDropdown && subcategories.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                <ul>
                  <li
                    onClick={() => { setFormData({ ...formData, subcategory_id: '' }); setSubcategorySearch(''); setShowSubcategoryDropdown(false); }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-400 italic text-sm"
                  >
                    — Aucune sous-catégorie
                  </li>
                  {filteredSubcategories.map(sc => (
                    <li
                      key={sc.id}
                      onClick={() => handleSelectSubcategory(sc)}
                      className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex justify-between items-center"
                    >
                      <span>{sc.name}</span>
                      {formData.subcategory_id === sc.id.toString() && <Check className="h-4 w-4 text-primary-600" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* --- ZONE D'UPLOAD IMAGE (MODIFIÉE) --- */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Image du produit</label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors bg-white">
                {formData.image_url ? (
                    // 1. Si une image est présente (Preview + Delete)
                    <div className="relative inline-block group">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={formData.image_url} 
                            alt="Aperçu" 
                            className="h-48 w-48 object-contain rounded-lg shadow-sm bg-white p-2 border border-gray-100" 
                        />
                        <button 
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                            title="Supprimer l'image"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </button>
                        <p className="text-xs text-green-600 font-bold mt-2 flex items-center justify-center gap-1">
                            <Check className="h-3 w-3"/> Image enregistré
                        </p>
                    </div>
                ) : (
                    // 2. Si pas d'image (Input Upload)
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

        {/* Description */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <Textarea
                required
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
            />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
                type="submit"
                disabled={loading || uploadingImage}
                size="lg"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5"/>}
                Enregistrer le produit
            </Button>
        </div>

      </form>
    </div>
  );
}