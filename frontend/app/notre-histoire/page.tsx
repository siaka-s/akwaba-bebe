import { Heart, ShieldCheck, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-primary-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-primary-900 mb-6">Notre Histoire</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Akwaba Bébé est né d'une volonté simple : offrir aux parents de Côte d'Ivoire ce qu'il y a de meilleur pour leurs enfants, sans compromis sur la qualité.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-primary-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Passion</h3>
            <p className="text-gray-500">Nous sélectionnons chaque produit avec l'amour d'un parent pour son enfant.</p>
          </div>
          <div className="text-center p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-secondary-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Qualité</h3>
            <p className="text-gray-500">Tous nos articles respectent les normes de sécurité internationales les plus strictes.</p>
          </div>
          <div className="text-center p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Communauté</h3>
            <p className="text-gray-500">Plus qu'une boutique, nous sommes une famille qui grandit ensemble.</p>
          </div>
        </div>
      </section>
    </div>
  );
}