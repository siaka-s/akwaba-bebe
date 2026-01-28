import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      
      {/* HERO SECTION */}
      <section className="bg-primary-50 py-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-primary-900 leading-tight">
              Le meilleur pour <span className="text-secondary-500">votre bébé</span>
            </h1>
            <p className="text-xl text-gray-600">
              Des produits de qualité, sélectionnés avec amour pour le confort et la sécurité de votre enfant.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/produits" className="bg-primary-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl">
                Voir le catalogue
              </Link>
              <Link href="/notre-histoire" className="bg-white text-primary-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200">
                Qui sommes-nous ?
              </Link>
            </div>
          </div>
          <div className="flex-1">
            {/* Image d'illustration (tu pourras changer l'URL) */}
            <img 
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1000&auto=format&fit=crop" 
              alt="Bébé heureux" 
              className="rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* SECTION RÉASSURANCE */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-center">
          <div>
            <h3 className="font-bold text-lg text-primary-900">📦 Livraison Rapide</h3>
            <p className="text-gray-500 text-sm">Partout à Abidjan et à l'intérieur</p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary-900">🛡️ Qualité Garantie</h3>
            <p className="text-gray-500 text-sm">Produits authentiques et certifiés</p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary-900">📞 Service Client</h3>
            <p className="text-gray-500 text-sm">Disponible 7j/7 pour vous aider</p>
          </div>
        </div>
      </section>

      {/* TEASER CATALOGUE */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos coups de cœur</h2>
          <p className="text-gray-600 mb-10">Découvrez les produits préférés des mamans</p>
          
          {/* Ici on pourrait mettre une liste de produits "Featured", pour l'instant un lien */}
          
          <Link href="/produits" className="inline-flex items-center text-primary-600 font-bold hover:underline text-lg">
            Explorer toute la boutique <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

    </main>
  );
}