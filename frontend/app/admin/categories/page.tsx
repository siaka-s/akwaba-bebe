'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Package, AlertTriangle } from 'lucide-react';
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

  const fetchData = async () => {
    try {
      const [resCat, resProd] = await Promise.all([
        fetch(`${API_URL}/categories`, { cache: 'no-store' }),
        fetch(`${API_URL}/products`, { cache: 'no-store' })
      ]);

      // Sécurité : Si le serveur répond 500 ou vide, on initialise à []
      const cats = resCat.ok ? await resCat.json() : [];
      const prods = resProd.ok ? await resProd.json() : [];

      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur");
      setCategories([]); // Évite que le .map() ne crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductCount = (catId: number) => {
    return products.filter(p => p.category_id === catId).length;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
        toast.error("Le nom ne peut pas être vide");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Session expirée");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: newCatName }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success("Catégorie ajoutée !");
            setNewCatName('');
            fetchData();
        } else {
            // Affiche le message précis du backend (ex: "Le nom est requis")
            toast.error(data.message || "Erreur lors de la création");
        }
    } catch (error) {
        toast.error("Erreur serveur");
    }
  };

  const handleDeleteClick = (id: number, count: number) => {
    if (count > 0) {
        toast.error(`Impossible : Cette catégorie contient ${count} produits.`);
        return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-bold text-gray-800">Supprimer cette catégorie ?</p>
        <div className="flex gap-2 justify-end">
            <button 
                onClick={() => toast.dismiss(t.id)}
                className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
                Non
            </button>
            <button 
                onClick={() => {
                    toast.dismiss(t.id);
                    executeDelete(id);
                }}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Oui
            </button>
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

        if (res.ok) {
            toast.success("Catégorie supprimée");
            fetchData();
        } else {
            toast.error(data.message || "Erreur suppression");
        }
    } catch (e) {
        toast.error("Erreur serveur");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/categories/update/${editingId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name: editName }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success("Catégorie modifiée");
            setEditingId(null);
            fetchData();
        } else {
            toast.error(data.message || "Erreur modification");
        }
    } catch (e) {
        toast.error("Erreur serveur");
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Gestion des Catégories</h1>
        <p className="text-muted-foreground text-sm mt-1">Créez des catégories pour organiser vos produits.</p>
      </div>

      {/* Formulaire Ajout */}
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

      {/* Liste */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Nom de la catégorie</TableHead>
              <TableHead className="text-center">Produits associés</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat, index) => {
              const productCount = getProductCount(cat.id);
              return (
                <TableRow key={cat.id}>
                  <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>

                  <TableCell className="font-bold text-gray-800">
                    {editingId === cat.id ? (
                      <Input
                        value={editName}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      cat.name
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant={productCount > 0 ? 'secondary' : 'outline'} className="gap-1">
                      <Package className="h-3 w-3" />
                      {productCount} produit{productCount > 1 ? 's' : ''}
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