'use client';

import { Heart, Star, Award, Quote } from 'lucide-react';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* La Fondatrice */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">

              {/* Image */}
              <div className="md:w-2/5 bg-primary-600 relative flex items-center justify-center p-8 min-h-72">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://media.licdn.com/dms/image/v2/D4E03AQEZtstOXH_ntw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1704586153579?e=2147483647&v=beta&t=39i2VuQnueaNPlIgtDDurAsRRakTFCCUu6DdYFifEmg"
                  alt="Aminata Siahoué Fanny"
                  className="relative w-44 h-44 md:w-56 md:h-56 object-cover rounded-2xl border-4 border-white/30 shadow-2xl"
                />
              </div>

              {/* Texte */}
              <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                  <Heart className="h-3.5 w-3.5 fill-primary-600" /> La Fondatrice
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Une vision née du cœur</h2>
                <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                  <p>
                    Tout a commencé avec une expérience personnelle. <strong className="text-gray-800">Aminata Siahoué Fanny</strong>, jeune maman dynamique, s&apos;est retrouvée confrontée aux défis de la maternité à Abidjan — entre la recherche de produits de qualité et le besoin de conseils fiables.
                  </p>
                  <p>
                    Elle a imaginé un lieu qui ne serait pas juste un commerce, mais un véritable <strong className="text-gray-800">cocon pour les parents</strong>.
                  </p>
                </div>

                <blockquote className="mt-6 border-l-4 border-secondary-400 pl-4 py-1">
                  <div className="flex gap-2 items-start">
                    <Quote className="h-4 w-4 text-secondary-400 mt-0.5 shrink-0" />
                    <p className="text-sm italic text-gray-700 font-medium leading-relaxed">
                      "Je voulais créer l&apos;espace que j&apos;aurais rêvé avoir quand j&apos;attendais mon premier enfant. Un lieu d&apos;écoute, de qualité et de bienveillance."
                    </p>
                  </div>
                </blockquote>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Du rêve à la réalité */}
      <section className="py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-2 bg-secondary-100 rounded-3xl opacity-50 rotate-1 pointer-events-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://hello-ci.com/wp-content/uploads/FILE1986.jpg"
              alt="Boutique Akwaba Bébé"
              className="relative rounded-2xl shadow-lg w-full object-cover h-72 md:h-80"
            />
          </div>

          {/* Texte */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-secondary-500 mb-4">Du rêve à la réalité</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                L&apos;ouverture de la première boutique <strong className="text-gray-800">Akwaba Bébé</strong> a été un moment chargé d&apos;émotion — la concrétisation d&apos;une promesse faite aux mamans ivoiriennes : celle de l&apos;excellence.
              </p>
              <p>
                Très vite, le bouche-à-oreille a fonctionné. Les mamans ont trouvé chez Aminata une oreille attentive et des produits sûrs.
              </p>
            </div>

            <div className="mt-6 flex items-start gap-4 bg-secondary-50 rounded-2xl p-4">
              <Star className="h-6 w-6 text-secondary-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Reconnaissance nationale</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Invitée sur les plateaux télévisés, Aminata inspire une nouvelle génération de femmes entrepreneurs à travers toute la Côte d&apos;Ivoire.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Impact Social */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Plus qu&apos;une marque, une mission</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Akwaba Bébé s&apos;engage au quotidien — à travers les médias et des actions sociales sur le terrain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TV */}
            <div className="group relative overflow-hidden rounded-3xl shadow-sm h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYzDvAqjz9C4TR-avJUw3D6F6tyhj4iS8GCQ&s"
                alt="Aminata à la TV"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <span className="bg-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase">Média</span>
                  <h3 className="text-white font-bold text-lg">Sensibilisation à la Télévision</h3>
                  <p className="text-gray-300 text-xs mt-1">Partager les bonnes pratiques maternelles au plus grand nombre.</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="group relative overflow-hidden rounded-3xl shadow-sm h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLQSr9nRXUOHBbJVkDOvoJ0WzinlePrkQQbA&s"
                alt="Action Sociale"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase">Social</span>
                  <h3 className="text-white font-bold text-lg">Au cœur des communautés</h3>
                  <p className="text-gray-300 text-xs mt-1">Des actions concrètes pour aider les familles dans le besoin.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citation finale */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-primary-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-28 h-28 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <Award className="h-10 w-10 text-secondary-400 mx-auto mb-5" />
              <p className="text-white text-base md:text-lg leading-relaxed italic font-light mb-6">
                &quot;Notre rêve est grand : accompagner chaque bébé ivoirien dans ses premiers pas vers la vie. Merci de faire partie de notre histoire.&quot;
              </p>
              <div className="text-primary-200 font-bold text-sm tracking-wide">— Aminata Siahoué Fanny</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
