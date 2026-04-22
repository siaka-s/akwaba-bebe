'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiFetch';
import { Tag, Package, Percent, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product { id: number; name: string; price: number; image_url: string; category_id: number; promotion_percent: number | null; }
interface Category { id: number; name: string; }

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire promo catégorie
  const [catId, setCatId] = useState<string>('');
  const [catPercent, setCatPercent] = useState<string>('');

  // Formulaire promo produit
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [prodPercent, setProdPercent] = useState<string>('');
  const [searchProd, setSearchProd] = useState('');

  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rp, rc] = await Promise.all([
        fetch(`${API_URL}/products`).then(r => r.json()),
        fetch(`${API_URL}/categories`).then(r => r.json()),
      ]);
      setProducts(Array.isArray(rp) ? rp : []);
      setCategories(Array.isArray(rc) ? rc : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const applyByCat = async () => {
    if (!catId || !catPercent) return toast.error('Sélectionne une catégorie et un pourcentage');
    setSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/products/promotion/apply`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ percent: parseFloat(catPercent), category_id: parseInt(catId) }),
      });
      const data = await res.json();
      toast.success(`${data.affected} produit(s) mis en promotion`);
      fetchData();
      setCatId(''); setCatPercent('');
    } catch { toast.error('Erreur serveur'); } finally { setSaving(false); }
  };

  const applyToProducts = async () => {
    if (!selectedProducts.length || !prodPercent) return toast.error('Sélectionne des produits et un pourcentage');
    setSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/products/promotion/apply`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ percent: parseFloat(prodPercent), product_ids: selectedProducts }),
      });
      const data = await res.json();
      toast.success(`${data.affected} produit(s) mis en promotion`);
      fetchData();
      setSelectedProducts([]); setProdPercent('');
    } catch { toast.error('Erreur serveur'); } finally { setSaving(false); }
  };

  const removeFromProduct = async (productId: number) => {
    try {
      await apiFetch(`${API_URL}/products/promotion/remove`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ product_ids: [productId] }),
      });
      toast.success('Promotion retirée');
      fetchData();
    } catch { toast.error('Erreur'); }
  };

  const removeFromCategory = async (categoryId: number) => {
    try {
      const res = await apiFetch(`${API_URL}/products/promotion/remove`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ category_id: categoryId }),
      });
      const data = await res.json();
      toast.success(`Promotion retirée de ${data.affected} produit(s)`);
      fetchData();
    } catch { toast.error('Erreur'); }
  };

  const promoProducts = products.filter(p => p.promotion_percent !== null && p.promotion_percent !== undefined);
  const filteredProds = products.filter(p =>
    !p.promotion_percent && p.name.toLowerCase().includes(searchProd.toLowerCase())
  );

  const toggleProduct = (id: number) =>
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Promotions</h1>
        <p className="text-sm text-gray-400 mt-0.5">{promoProducts.length} produit(s) actuellement en promotion</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Promo par catégorie ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Tag className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="font-extrabold text-gray-800">Promotion par catégorie</h2>
          </div>
          <p className="text-xs text-gray-400">Applique un % de réduction à tous les produits d&apos;une catégorie.</p>

          <div className="space-y-3">
            <select
              value={catId}
              onChange={e => setCatId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="">Choisir une catégorie...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number" min="1" max="99" placeholder="Ex: 15"
                  value={catPercent} onChange={e => setCatPercent(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={applyByCat} disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Appliquer
              </button>
            </div>
          </div>

          {/* Retirer par catégorie */}
          {categories.some(c => products.some(p => p.category_id === c.id && p.promotion_percent)) && (
            <div className="border-t border-gray-50 pt-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Retirer par catégorie</p>
              {categories.filter(c => products.some(p => p.category_id === c.id && p.promotion_percent)).map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                  <span className="font-medium text-gray-700">{c.name}</span>
                  <button onClick={() => removeFromCategory(c.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Promo produit spécifique ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-orange-500" />
            </div>
            <h2 className="font-extrabold text-gray-800">Promotion produit spécifique</h2>
          </div>
          <p className="text-xs text-gray-400">Sélectionne un ou plusieurs produits et applique un pourcentage.</p>

          <input
            type="text" placeholder="Rechercher un produit..."
            value={searchProd} onChange={e => setSearchProd(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />

          <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-gray-100 p-2">
            {filteredProds.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Aucun produit sans promotion</p>
            )}
            {filteredProds.map(p => (
              <label key={p.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox" checked={selectedProducts.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="accent-primary-600 h-4 w-4 shrink-0"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt="" className="w-8 h-8 object-cover rounded-lg shrink-0" />
                <span className="text-xs font-medium text-gray-700 truncate flex-1">{p.name}</span>
                <span className="text-xs text-gray-400 shrink-0">{p.price.toLocaleString()} F</span>
              </label>
            ))}
          </div>

          {selectedProducts.length > 0 && (
            <p className="text-xs font-semibold text-primary-600">{selectedProducts.length} produit(s) sélectionné(s)</p>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number" min="1" max="99" placeholder="Ex: 20"
                value={prodPercent} onChange={e => setProdPercent(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={applyToProducts} disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Appliquer
            </button>
          </div>
        </div>
      </div>

      {/* ── Promotions actives ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-extrabold text-gray-800">Promotions actives</h2>
          {promoProducts.length > 0 && (
            <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {promoProducts.length} produit(s)
            </span>
          )}
        </div>

        {promoProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="text-sm">Aucune promotion active</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {promoProducts.map(p => {
              const promoPrice = p.price * (1 - (p.promotion_percent! / 100));
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 line-through">{p.price.toLocaleString()} F</span>
                      <span className="text-xs font-bold text-primary-600">{Math.round(promoPrice).toLocaleString()} F</span>
                    </div>
                  </div>
                  <span className="shrink-0 bg-red-50 text-red-600 border border-red-100 text-xs font-extrabold px-2.5 py-1 rounded-full">
                    -{p.promotion_percent}%
                  </span>
                  <button
                    onClick={() => removeFromProduct(p.id)}
                    className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
