import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akwaba Bébé | Boutique Maman & Bébé",
  description: "Le meilleur pour votre enfant en Côte d'Ivoire",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* MODIFICATION ICI : Ajout de w-full, overflow-x-hidden et d'un fond gris très léger */}
      <body className={`${inter.className} w-full overflow-x-hidden bg-gray-50`}>
        
        <CartProvider>
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
              success: {
                style: {
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #10b981',
                  fontWeight: '600',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  color: '#b91c1c',
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