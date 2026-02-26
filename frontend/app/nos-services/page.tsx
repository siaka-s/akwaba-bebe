'use client';

import { Truck, ShieldCheck, HeartHandshake, Gift, Baby, Star, Phone } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: Truck,
    title: 'Livraison à domicile',
    description: 'Nous livrons vos commandes directement chez vous à Abidjan et dans ses environs. Rapide, fiable et soigné.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: ShieldCheck,
    title: 'Produits certifiés',
    description: 'Tous nos produits sont soigneusement sélectionnés et certifiés pour garantir la sécurité de maman et bébé.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: HeartHandshake,
    title: 'Accompagnement personnalisé',
    description: 'Notre équipe est disponible pour vous conseiller et vous guider dans le choix des meilleurs produits pour votre grossesse et votre bébé.',
    color: 'bg-secondary-50 text-secondary-600',
  },
  {
    icon: Gift,
    title: 'Box cadeaux sur mesure',
    description: 'Nous composons des box cadeaux personnalisées pour célébrer la naissance, le baby shower ou tout moment précieux.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Baby,
    title: 'Suivi maternité',
    description: 'De la grossesse aux premiers mois de bébé, nous vous accompagnons avec des produits adaptés à chaque étape.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Star,
    title: 'Programme fidélité',
    description: 'Profitez d\'avantages exclusifs, de réductions et d\'offres spéciales en rejoignant notre communauté de mamans.',
    color: 'bg-yellow-50 text-yellow-600',
  },
];

export default function NosServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-primary-50 py-12 px-4 border-b border-primary-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary-500 mb-3">Ce que nous offrons</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 leading-tight mb-4">
            Nos <span className="text-secondary-500">Services</span>
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto">
            Chez Akwaba Bébé, nous mettons tout en œuvre pour vous offrir une expérience d'achat douce et sécurisée, du choix du produit jusqu'à la livraison.
          </p>
        </div>
      </section>

      {/* Grille services */}
      <section className="py-12 px-4">
        <div className="max-w-screen-lg mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 px-4">
        <div className="max-w-xl mx-auto text-center bg-white rounded-2xl shadow-sm p-8 border border-primary-100">
          <Phone className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-primary-900 mb-2">Une question ? Contactez-nous</h2>
          <p className="text-gray-500 text-sm mb-5">Notre équipe est disponible pour vous aider du lundi au samedi.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-md"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
