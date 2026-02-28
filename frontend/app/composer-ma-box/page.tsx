'use client';

import { Gift, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ComposerMaBoxPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-3xl mb-6 shadow-sm">
          <Gift className="h-10 w-10 text-pink-500" />
        </div>

        <span className="inline-flex items-center gap-1.5 bg-secondary-100 text-secondary-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <Clock className="h-3.5 w-3.5" />
          Bientôt disponible
        </span>

        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-900 mb-3">
          Composer ma Box sur Mesure
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Nous préparons quelque chose de spécial pour vous. Très bientôt, vous pourrez choisir vos produits et nous composer une box cadeau unique.
        </p>

        <div className="inline-flex items-center gap-2 bg-white border border-primary-200 rounded-full px-5 py-2.5 text-sm font-medium text-primary-700 shadow-sm mb-8">
          <Gift className="h-4 w-4 text-secondary-500" />
          Frais de confection : <span className="font-bold text-secondary-600">5 000 F</span>
          <span className="text-gray-400 text-xs">(emballage + box inclus)</span>
        </div>

        <div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-full transition-all shadow-md text-sm"
          >
            Nous contacter pour une box
          </Link>
        </div>

      </div>
    </div>
  );
}
