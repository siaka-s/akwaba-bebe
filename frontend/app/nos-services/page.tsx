'use client';

import { HeartHandshake, Gift, Baby, Camera, Droplets, ShoppingBag, MessageCircle, BookOpen, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: Gift,
    title: 'Box cadeaux de naissance',
    description: 'Des box cadeaux soigneusement composées pour célébrer la naissance ou un baby shower. Emballage premium, produits sélectionnés avec amour.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: HeartHandshake,
    title: 'Placement de matronnes',
    description: 'Nous mettons en relation les familles avec des matronnes expérimentées pour prendre soin de maman et de bébé après l\'accouchement.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Camera,
    title: 'Shooting photo bébé',
    description: 'Immortalisez les premiers instants de votre bébé avec nos séances photo professionnelles, douces et mémorables.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Droplets,
    title: 'Conseils & produits allaitement',
    description: 'Tire-lait, boosters et gummies de lactation, accessoires — accompagnés de conseils personnalisés pour soutenir votre allaitement.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ShoppingBag,
    title: 'Kit post-partum maman africaine',
    description: 'Un kit complet pensé pour la récupération post-accouchement, adapté aux traditions et besoins de la maman africaine.',
    color: 'bg-secondary-50 text-secondary-600',
  },
  {
    icon: Baby,
    title: 'Accessoires pour bébé',
    description: 'Biberons, lingettes, et tous les essentiels du quotidien pour bébé — soigneusement sélectionnés pour leur qualité et sécurité.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: MessageCircle,
    title: 'Plateforme conseils & partage',
    description: 'Un espace bienveillant pour échanger sur la grossesse, l\'allaitement, le développement de bébé et la parentalité avec d\'autres mamans.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: BookOpen,
    title: 'Livre-album de vie',
    description: 'Offrez un souvenir unique et éternel avec nos livres-albums personnalisés pour capturer les premiers moments de vie de bébé.',
    color: 'bg-rose-50 text-rose-600',
  },
];

export default function NosServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Carte vedette — Box cadeaux */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-linear-to-r from-pink-500 to-secondary-500 rounded-3xl p-8 md:p-10 overflow-hidden shadow-lg">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Gift className="h-3.5 w-3.5" /> Service phare
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Box cadeaux sur mesure</h2>
                <p className="text-white/85 text-sm max-w-md leading-relaxed">
                  Choisissez vous-même les produits de votre box. Nous préparons l'emballage avec soin — idéal pour un baby shower, une naissance ou un cadeau original.
                </p>
              </div>
              <Link
                href="/composer-ma-box"
                className="shrink-0 inline-flex items-center gap-2 bg-white text-pink-600 font-bold px-6 py-3 rounded-2xl hover:bg-pink-50 transition-colors shadow-md self-start md:self-auto"
              >
                Composer ma box
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grille services */}
      <section className="pb-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
