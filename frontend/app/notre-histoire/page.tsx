'use client';

import { Heart, Star, Award } from 'lucide-react';

export default function OurStoryPage() {
  return (
    // FOND HARMONISÉ (Même que Login)
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-secondary-600 font-bold tracking-wider text-sm uppercase mb-4 block">Notre Parcours</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
            D'une Maman <span className="text-primary-600">à Toutes les Mamans</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Découvrez l'histoire d'Aminata Siahoué Fanny, celle qui a transformé son expérience de la maternité en une mission pour le bien-être des familles ivoiriennes.
          </p>
        </div>
      </section>

      {/* Section: La Naissance d'une Vision */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white flex flex-col md:flex-row gap-12 items-center">
            
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold mb-6">
                <Heart className="h-3 w-3 fill-primary-700"/> La Fondatrice
              </div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Une vision née du cœur</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Tout a commencé avec une expérience personnelle. <strong>Aminata Siahoué Fanny</strong>, jeune maman dynamique, s'est retrouvée confrontée aux défis quotidiens de la maternité à Abidjan. Entre la recherche de produits de qualité, le besoin de conseils fiables et l'envie de préserver ses traditions tout en embrassant la modernité.
                </p>
                <p>
                  Frustrée par le manque d'options adaptées, elle a décidé de ne pas rester les bras croisés. Elle a imaginé un lieu qui ne serait pas juste un commerce, mais un véritable <strong>cocon pour les parents</strong>.
                </p>
                <p className="italic text-gray-800 font-medium border-l-4 border-primary-500 pl-4 my-4">
                  "Je voulais créer l'espace que j'aurais rêvé avoir quand j'attendais mon premier enfant. Un lieu d'écoute, de qualité et de bienveillance."
                </p>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-secondary-200 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://media.licdn.com/dms/image/v2/D4E03AQEZtstOXH_ntw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1704586153579?e=2147483647&v=beta&t=39i2VuQnueaNPlIgtDDurAsRRakTFCCUu6DdYFifEmg"
                  alt="Aminata Siahoué Fanny"
                  className="relative w-full h-full object-cover rounded-full border-8 border-white shadow-2xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Le Lancement */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="order-2 md:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-10 rotate-2"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://hello-ci.com/wp-content/uploads/FILE1986.jpg"
                  alt="Boutique Akwaba Bébé"
                  className="relative rounded-xl shadow-lg w-full object-cover h-80 md:h-[500px]"
                />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Du rêve à la réalité</h2>
              <div className="space-y-6 text-gray-600">
                <p>
                  L'ouverture de la première boutique <strong>Akwaba Bébé</strong> a été un moment chargé d'émotion. Ce n'était pas seulement des rayons remplis de produits, c'était la concrétisation d'une promesse faite aux mamans ivoiriennes : celle de l'excellence.
                </p>
                <p>
                    Très vite, le bouche-à-oreille a fonctionné. Les mamans ont trouvé chez Aminata une oreille attentive et des produits sûrs. La petite boutique est devenue une référence incontournable.
                </p>
                
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <Star className="h-8 w-8 text-secondary-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-900">Une reconnaissance nationale</h4>
                        <p className="text-sm mt-1">
                            Aujourd'hui, l'expertise d'Aminata est reconnue au-delà de la boutique. Invitée sur les plateaux télévisés, elle partage ses conseils et inspire une nouvelle génération de femmes entrepreneurs.
                        </p>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Impact Social (Grille Images) */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Plus qu'une marque, une mission</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Akwaba Bébé s'engage au quotidien. À travers des émissions télévisées pour éduquer ou des actions sociales sur le terrain, nous sommes aux côtés de chaque famille.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Carte 1 : TV */}
                <div className="group relative overflow-hidden rounded-2xl shadow-md h-80 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYzDvAqjz9C4TR-avJUw3D6F6tyhj4iS8GCQ&s"
                        alt="Aminata à la TV"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                        <div>
                            <div className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 w-fit">Média</div>
                            <h3 className="text-white font-bold text-xl">Sensibilisation à la Télévision</h3>
                            <p className="text-gray-200 text-sm mt-1">Partager les bonnes pratiques maternelles au plus grand nombre.</p>
                        </div>
                    </div>
                </div>

                {/* Carte 2 : Social */}
                <div className="group relative overflow-hidden rounded-2xl shadow-md h-80 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLQSr9nRXUOHBbJVkDOvoJ0WzinlePrkQQbA&s"
                        alt="Action Sociale"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                        <div>
                            <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 w-fit">Social</div>
                            <h3 className="text-white font-bold text-xl">Au cœur des communautés</h3>
                            <p className="text-gray-200 text-sm mt-1">Des actions concrètes pour aider les familles dans le besoin.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer Vision */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <Award className="h-12 w-12 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">L'aventure ne fait que commencer</h2>
          <p className="text-xl text-gray-600 leading-relaxed italic">
            "Notre rêve est grand : accompagner chaque bébé ivoirien dans ses premiers pas vers la vie. Merci de faire partie de notre histoire."
          </p>
          <div className="mt-8 font-bold text-gray-900">— Aminata Siahoué Fanny</div>
        </div>
      </section>
    </div>
  );
}