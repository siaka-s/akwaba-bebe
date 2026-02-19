'use client';

import { Heart, Star, Award } from 'lucide-react';

export default function OurStoryPage() {
  return (
    // Utilisation de w-full pour la structure globale
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-orange-50 pb-20 w-full">
      
      {/* Hero Section - Élargie */}
      <section className="py-8 md:py-8 relative">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 text-gray-900 leading-tight">
            D'une Maman <span className="text-primary-600">à Toutes les Mamans</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed text-justify md:text-center">
            Découvrez l'histoire d'Aminata Siahoué Fanny, celle qui a transformé son expérience de sa maternité en une mission pour le bien-être des familles ivoiriennes.
          </p>
        </div>
      </section>

      {/* Section: La Naissance d'une Vision */}
      <section className="py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
            
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-6">
                <Heart className="h-3 w-3 fill-primary-700"/> La Fondatrice
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Une vision née du cœur</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-justify">
                <p>
                  Tout a commencé avec une expérience personnelle. <strong>Aminata Siahoué Fanny</strong>, jeune maman dynamique, s'est retrouvée confrontée aux défis quotidiens de la maternité à Abidjan. Entre la recherche de produits de qualité, le besoin de conseils fiables et l'envie de préserver ses traditions tout en embrassant la modernité.
                </p>
                <p>
                  Frustrée par le manque d'options adaptées, elle a décidé de ne pas rester les bras croisés. Elle a imaginé un lieu qui ne serait pas juste un commerce, mais un véritable <strong>cocon pour les parents</strong>.
                </p>
                <p className="italic text-gray-800 font-medium border-l-4 border-secondary-500 pl-6 my-6 bg-orange-50 py-4 rounded-r-xl">
                  "Je voulais créer l'espace que j'aurais rêvé avoir quand j'attendais mon premier enfant. Un lieu d'écoute, de qualité et de bienveillance."
                </p>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-72 md:w-125 md:h-112.5">
                {/* Décoration de fond orange */}
                <div className="absolute inset-0 bg-secondary-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://media.licdn.com/dms/image/v2/D4E03AQEZtstOXH_ntw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1704586153579?e=2147483647&v=beta&t=39i2VuQnueaNPlIgtDDurAsRRakTFCCUu6DdYFifEmg"
                  alt="Aminata Siahoué Fanny"
                  className="relative w-full h-full object-cover rounded-3xl border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Le Lancement */}
      <section className="py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 md:order-1 relative">
                <div className="absolute -inset-4 bg-secondary-100 rounded-3xl opacity-50 rotate-3"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://hello-ci.com/wp-content/uploads/FILE1986.jpg"
                  alt="Boutique Akwaba Bébé"
                  className="relative rounded-3xl shadow-xl w-full object-cover h-100 md:h-100"
                />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-secondary-500">Du rêve à la réalité</h2>
              <div className="space-y-6 text-gray-600 text-justify">
                <p>
                  L'ouverture de la première boutique <strong>Akwaba Bébé</strong> a été un moment chargé d'émotion. Ce n'était pas seulement des rayons remplis de produits, c'était la concrétisation d'une promesse faite aux mamans ivoiriennes : celle de l'excellence.
                </p>
                <p>
                    Très vite, le bouche-à-oreille a fonctionné. Les mamans ont trouvé chez Aminata une oreille attentive et des produits sûrs. La petite boutique est devenue une référence incontournable pour toutes les familles en quête de douceur et de sécurité.
                </p>
                
                <div className="bg-white p-8 rounded-2xl border-l-8 border-secondary-500 shadow-sm flex items-start gap-6">
                    <Star className="h-10 w-10 text-secondary-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">Une reconnaissance nationale</h4>
                        <p className="text-sm mt-2 leading-relaxed">
                            Aujourd'hui, l'expertise d'Aminata est reconnue au-delà de la boutique. Invitée sur les plateaux télévisés, elle partage ses conseils et inspire une nouvelle génération de femmes entrepreneurs à travers toute la Côte d'Ivoire.
                        </p>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Impact Social */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Plus qu'une marque, une mission</h2>
                <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                    Akwaba Bébé s'engage au quotidien. À travers des émissions télévisées pour éduquer ou des actions sociales sur le terrain, nous sommes aux côtés de chaque famille.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Carte 1 : TV */}
                <div className="group relative overflow-hidden rounded-3xl shadow-lg h-112,5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYzDvAqjz9C4TR-avJUw3D6F6tyhj4iS8GCQ&s"
                        alt="Aminata à la TV"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex items-end p-10">
                        <div>
                            <div className="bg-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit uppercase">Média</div>
                            <h3 className="text-white font-bold text-2xl md:text-3xl">Sensibilisation à la Télévision</h3>
                            <p className="text-gray-300 text-base mt-2">Partager les bonnes pratiques maternelles au plus grand nombre.</p>
                        </div>
                    </div>
                </div>

                {/* Carte 2 : Social */}
                <div className="group relative overflow-hidden rounded-3xl shadow-lg h-112,5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLQSr9nRXUOHBbJVkDOvoJ0WzinlePrkQQbA&s"
                        alt="Action Sociale"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex items-end p-10">
                        <div>
                            <div className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit uppercase">Social</div>
                            <h3 className="text-white font-bold text-2xl md:text-3xl">Au cœur des communautés</h3>
                            <p className="text-gray-300 text-base mt-2">Des actions concrètes pour aider les familles dans le besoin.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer Vision */}
      <section className="py-24 text-center">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Award className="h-16 w-16 text-secondary-500 mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">L'aventure ne fait que commencer</h2>
          <p className="text-xl md:text-3xl text-gray-600 leading-relaxed italic font-light">
            "Notre rêve est grand : accompagner chaque bébé ivoirien dans ses premiers pas vers la vie. Merci de faire partie de notre histoire."
          </p>
          <div className="mt-10 font-bold text-gray-900 text-xl tracking-tighter">— Aminata Siahoué Fanny</div>
        </div>
      </section>
    </div>
  );
}