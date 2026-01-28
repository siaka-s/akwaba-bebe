import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// On importe UNIQUEMENT le ClientLayout (plus besoin de Header/Footer ici)
import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from '../context/CartContext';

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
          <ClientLayout>
            {children}
          </ClientLayout>
        </CartProvider>
      </body>
    </html>
  );
}