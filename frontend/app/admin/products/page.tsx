'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiFetch';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les données
  const fetchData = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch(`${API_URL}/products`, { cache: 'no-store' }),
        fetch(`${API_URL}/categories`, { cache: 'no-store' })
      ]);
      
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      setProducts(dataProd || []);
      setCategories(dataCat || []);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de récupérer les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 1. LA NOUVELLE FONCTION DE SUPPRESSION ---
  // Elle ne supprime pas tout de suite, elle demande confirmation via Toast
  const handleDelete = (id: number) => {
    
    // On crée un toast personnalisé
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-62.5">
        <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Supprimer ce produit ?</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible.</p>
            </div>
        </div>
        
        <div className="flex gap-2 mt-1 justify-end">
            {/* Bouton ANNULER */}
            <button 
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Annuler
            </button>

            {/* Bouton CONFIRMER (Lance la vraie suppression) */}
            <button 
                onClick={() => {
                    toast.dismiss(t.id); // On ferme la question
                    executeDelete(id);   // On lance l'action
                }}
                className="px-3 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
            >
                Oui, supprimer
            </button>
        </div>
      </div>
    ), {
        duration: 5000, // La question reste 5 secondes
        position: 'top-center',
        style: {
            background: '#fff',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6'
        }
    });
  };

  // --- 2. L'ACTION RÉELLE (Appel API) ---
  const executeDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Non autorisé");
        return;
    }

    const toastId = toast.loading("Suppression en cours...");

    try {
      const res = await apiFetch(`${API_URL}/products/delete/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success("Produit supprimé !", { id: toastId });
      } else {
        const err = await res.json();
        toast.error(err.message || "Erreur", { id: toastId });
      }
    } catch (error) {
      toast.error("Erreur serveur", { id: toastId });
    }
  };

  // Filtrage
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Non classé';
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Vos Produits</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} articles en ligne</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">
            <Plus className="h-4 w-4" /> Nouveau Produit
          </Link>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-bold">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{getCategoryName(product.category_id)}</Badge>
                </TableCell>
                <TableCell className="font-medium text-primary-600">
                  {product.price.toLocaleString()} F
                </TableCell>
                <TableCell>
                  {product.stock_quantity > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      {product.stock_quantity} en stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" /> Rupture
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProducts.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center text-muted-foreground">
            <Package className="h-12 w-12 text-muted mb-2" />
            <p>Aucun produit trouvé.</p>
          </div>
        )}
      </div>

    </div>
  );
}