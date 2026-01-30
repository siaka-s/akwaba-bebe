import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// On importe UNIQUEMENT le ClientLayout
import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast'; // 1. L'import est là

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akwaba Bébé | Boutique Maman & Bébé",
  description: "Le meilleur pour votre enfant en Côte d'Ivoire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* On enveloppe tout le contenu avec le CartProvider */}
        <CartProvider>
          
          {/* 2. AJOUT ESSENTIEL : Le composant Toaster DOIT être ici pour s'afficher.
              Sans ça, toast.success() ne fait rien.
          */}
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
              // Configuration pour les succès (Vert Akwaba)
              success: {
                style: {
                  background: '#ecfdf5', // Vert très clair
                  color: '#047857',      // Vert foncé
                  border: '1px solid #10b981',
                  fontWeight: '600',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              // Configuration pour les erreurs (Rouge)
              error: {
                style: {
                  background: '#fef2f2', // Rouge très clair
                  color: '#b91c1c',      // Rouge foncé
                  border: '1px solid #ef4444',
                  fontWeight: '600',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />

          <ClientLayout>
            {children}
          </ClientLayout>
          
        </CartProvider>
      </body>
    </html>
  );
}