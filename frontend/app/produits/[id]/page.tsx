'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Check, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

// 👇 Attention au nombre de points pour remonter les dossiers
// app/produits/[id]/page.tsx -> on remonte de 3 crans pour trouver context
import { useCart } from '../../../context/CartContext'; 

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
}

export default function ProductDetailPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // 👇 Backend (Go) reste en anglais "/products"
        const res = await fetch(`http://localhost:8080/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct(null); 
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  // ... (Le reste du code d'affichage reste identique à ce que je t'ai donné avant)
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  if (!product) return <div>Produit introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/produits" className="flex items-center text-gray-500 hover:text-primary-600 mb-8 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Link>
        {/* ... Code d'affichage du produit ... */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="bg-gray-100 h-96 md:h-auto flex items-center justify-center p-8">
                    <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain"/>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <span className="text-3xl font-bold text-primary-600 mb-6">{product.price.toLocaleString()} FCFA</span>
                    <p className="text-gray-600 mb-8">{product.description}</p>
                    
                    {/* LE BOUTON */}
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary-700 transition-all"
                    >
                      <ShoppingCart className="h-6 w-6" /> Ajouter au panier
                    </button>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}