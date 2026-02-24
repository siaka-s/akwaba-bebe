'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Package, AlertTriangle, ChevronRight, ChevronDown, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

interface Product {
  id: number;
  category_id: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Sous-catégories
  const [subcategoriesByCat, setSubcategoriesByCat] = useState<Record<number, SubCategory[]>>({});
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [newSubcatName, setNewSubcatName] = useState<Record<number, string>>({});
  const [editingSubcatId, setEditingSubcatId] = useState<number | null>(null);
  const [editSubcatName, setEditSubcatName] = useState('');

  const fetchData = async () => {
    try {
      const [resCat, resProd] = await Promise.all([
        fetch(`${API_URL}/categories`, { cache: 'no-store' }),
        fetch(`${API_URL}/products`, { cache: 'no-store' })
      ]);

      const cats = resCat.ok ? await resCat.json() : [];
      const prods = resProd.ok ? await resProd.json() : [];

      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (catId: number) => {
    try {
      const res = await fetch(`${API_URL}/subcategories?category_id=${catId}`, { cache: 'no-store' });
      const data = res.ok ? await res.json() : [];
      setSubcategoriesByCat(prev => ({ ...prev, [catId]: Array.isArray(data) ? data : [] }));
    } catch {
      setSubcategoriesByCat(prev => ({ ...prev, [catId]: [] }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (catId: number) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
        if (!subcategoriesByCat[catId]) {
          fetchSubcategories(catId);
        }
      }
      return next;
    });
  };

  const getProductCount = (catId: number) => products.filter(p => p.category_id === catId).length;
  const getSubcatCount = (catId: number) => subcategoriesByCat[catId]?.length ?? '…';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) { toast.error("Le nom ne peut pas être vide"); return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error("Session expirée"); return; }

    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Catégorie ajoutée !");
        setNewCatName('');
        fetchData();
      } else {
        toast.error(data.message || "Erreur lors de la création");
      }
    } catch { toast.error("Erreur serveur"); }
  };

  const handleDeleteClick = (id: number, count: number) => {
    if (count > 0) { toast.error(`Impossible : Cette catégorie contient ${count} produits.`); return; }

    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-bold text-gray-800">Supprimer cette catégorie ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Non</button>
          <button onClick={() => { toast.dismiss(t.id); executeDelete(id); }} className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Oui</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const executeDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/categories/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { toast.success("Catégorie supprimée"); fetchData(); }
      else toast.error(data.message || "Erreur suppression");
    } catch { toast.error("Erreur serveur"); }
  };

  const startEdit = (cat: Category) => { setEditingId(cat.id); setEditName(cat.name); };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/categories/update/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Catégorie modifiée"); setEditingId(null); fetchData(); }
      else toast.error(data.message || "Erreur modification");
    } catch { toast.error("Erreur serveur"); }
  };

  // --- SOUS-CATÉGORIES ---
  const handleAddSubcat = async (catId: number) => {
    const name = (newSubcatName[catId] || '').trim();
    if (!name) { toast.error("Le nom ne peut pas être vide"); return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error("Session expirée"); return; }

    try {
      const res = await fetch(`${API_URL}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, category_id: catId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sous-catégorie ajoutée !");
        setNewSubcatName(prev => ({ ...prev, [catId]: '' }));
        fetchSubcategories(catId);
      } else {
        toast.error(data.message || "Erreur création");
      }
    } catch { toast.error("Erreur serveur"); }
  };

  const startEditSubcat = (sc: SubCategory) => { setEditingSubcatId(sc.id); setEditSubcatName(sc.name); };

  const saveEditSubcat = async (catId: number) => {
    if (!editingSubcatId || !editSubcatName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/subcategories/update/${editingSubcatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editSubcatName }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Sous-catégorie modifiée"); setEditingSubcatId(null); fetchSubcategories(catId); }
      else toast.error(data.message || "Erreur modification");
    } catch { toast.error("Erreur serveur"); }
  };

  const handleDeleteSubcat = (sc: SubCategory) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-bold text-gray-800">Supprimer «{sc.name}» ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Non</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteSubcat(sc); }} className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Oui</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const executeDeleteSubcat = async (sc: SubCategory) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/subcategories/delete/${sc.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { toast.success("Sous-catégorie supprimée"); fetchSubcategories(sc.category_id); }
      else toast.error(data.message || "Erreur suppression");
    } catch { toast.error("Erreur serveur"); }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Gestion des Catégories</h1>
        <p className="text-muted-foreground text-sm mt-1">Créez des catégories et sous-catégories pour organiser vos produits.</p>
      </div>

      {/* Formulaire Ajout catégorie */}
      <div className="rounded-xl border bg-card shadow-sm p-6 mb-8">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Ajouter une nouvelle catégorie</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <Input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nom de la catégorie (ex: Hygiène, Vêtements...)"
            className="flex-1"
          />
          <Button type="submit">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </form>
      </div>

      {/* Liste accordéon */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Nom de la catégorie</TableHead>
              <TableHead className="text-center">Produits</TableHead>
              <TableHead className="text-center">Sous-catégories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat, index) => {
              const productCount = getProductCount(cat.id);
              const isExpanded = expandedCats.has(cat.id);
              const subcats = subcategoriesByCat[cat.id] ?? [];

              return (
                <>
                  {/* Ligne catégorie */}
                  <TableRow key={`cat-${cat.id}`} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="pl-3 pr-0">
                      <button onClick={() => toggleExpand(cat.id)} className="text-muted-foreground hover:text-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>

                    <TableCell className="font-bold text-gray-800" onClick={() => toggleExpand(cat.id)}>
                      {editingId === cat.id ? (
                        <Input
                          value={editName}
                          autoFocus
                          onChange={(e) => setEditName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8"
                        />
                      ) : (
                        cat.name
                      )}
                    </TableCell>

                    <TableCell className="text-center" onClick={() => toggleExpand(cat.id)}>
                      <Badge variant={productCount > 0 ? 'secondary' : 'outline'} className="gap-1">
                        <Package className="h-3 w-3" />
                        {productCount}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center" onClick={() => toggleExpand(cat.id)}>
                      <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">
                        <Tag className="h-3 w-3" />
                        {getSubcatCount(cat.id)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === cat.id ? (
                          <>
                            <Button variant="outline" size="icon" onClick={saveEdit} className="text-green-600 border-green-200 hover:bg-green-50"><Save className="h-4 w-4"/></Button>
                            <Button variant="outline" size="icon" onClick={() => setEditingId(null)}><X className="h-4 w-4"/></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="icon" onClick={() => startEdit(cat)}><Edit2 className="h-4 w-4"/></Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={productCount > 0}
                              onClick={() => handleDeleteClick(cat.id, productCount)}
                            >
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Panneau sous-catégories */}
                  {isExpanded && (
                    <TableRow key={`subcat-panel-${cat.id}`} className="bg-muted/20">
                      <TableCell colSpan={6} className="p-0">
                        <div className="pl-10 pr-6 py-4 border-l-4 border-blue-200 ml-3 my-1 rounded-r">

                          {/* Liste sous-catégories */}
                          {subcats.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              {subcats.map(sc => (
                                <div key={sc.id} className="flex items-center gap-2 group">
                                  <Tag className="h-3 w-3 text-blue-400 shrink-0" />
                                  {editingSubcatId === sc.id ? (
                                    <>
                                      <Input
                                        value={editSubcatName}
                                        autoFocus
                                        onChange={(e) => setEditSubcatName(e.target.value)}
                                        className="h-7 text-sm flex-1 max-w-xs"
                                      />
                                      <Button variant="outline" size="icon" className="h-7 w-7 text-green-600 border-green-200 hover:bg-green-50" onClick={() => saveEditSubcat(cat.id)}><Save className="h-3 w-3"/></Button>
                                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setEditingSubcatId(null)}><X className="h-3 w-3"/></Button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm text-gray-700 flex-1">{sc.name}</span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditSubcat(sc)}><Edit2 className="h-3 w-3"/></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteSubcat(sc)}><Trash2 className="h-3 w-3"/></Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mb-3 italic">Aucune sous-catégorie pour le moment.</p>
                          )}

                          {/* Formulaire ajout sous-catégorie */}
                          <div className="flex gap-2 items-center">
                            <Input
                              value={newSubcatName[cat.id] || ''}
                              onChange={(e) => setNewSubcatName(prev => ({ ...prev, [cat.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubcat(cat.id); } }}
                              placeholder="Nouvelle sous-catégorie..."
                              className="h-8 text-sm max-w-xs"
                            />
                            <Button size="sm" variant="outline" onClick={() => handleAddSubcat(cat.id)} className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Plus className="h-3 w-3 mr-1" /> Ajouter
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>

        {categories.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center text-muted-foreground">
            <AlertTriangle className="h-10 w-10 text-orange-300 mb-2" />
            <p>Aucune catégorie pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
