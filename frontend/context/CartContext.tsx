'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Structure d'un article dans le panier
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

// Les actions possibles
interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 1. Au chargement, on récupère le panier sauvegardé (localStorage)
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // 2. À chaque modification, on sauvegarde dans le navigateur
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // --- ACTIONS ---

  const addToCart = (product: any) => {
    setItems(currentItems => {
      // Est-ce que le produit est déjà dans le panier ?
      const existingItem = currentItems.find(item => item.id === product.id);

      if (existingItem) {
        // Oui : on augmente la quantité
        return currentItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Non : on l'ajoute avec quantité 1
        return [...currentItems, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image_url: product.image_url, 
          quantity: 1 
        }];
      }
    });
    
    // ❌ J'AI SUPPRIMÉ L'ALERTE ICI !
    // C'est maintenant la page (ProductDetailPage) qui affiche le Toast.
  };

  const removeFromCart = (id: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculs automatiques
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personnalisé pour utiliser le panier partout
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}