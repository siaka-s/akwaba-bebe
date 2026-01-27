import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// IMPORTATION DES COMPOSANTS
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akwaba Bébé | Boutique Maman & Bébé",
  description: "Le meilleur pour votre enfant en Côte d'Ivoire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}