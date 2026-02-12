'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Loader2, ArrowRight, X, Clock } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('http://localhost:8080/articles', {
            cache: 'no-store'
        });
        if (!res.ok) {
            setArticles([]);
            return;
        }
        const data = await res.json();
        setArticles(data || []);
      } catch (err) {
        console.error(err);
        setArticles([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const closeArticle = () => setSelectedArticle(null);

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <Loader2 className="animate-spin text-primary-600 h-12 w-12 mb-4"/>
      <p className="text-gray-500 animate-pulse">Préparation de vos conseils...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 w-full pb-20">
      
      {/* --- EN-TÊTE LARGE --- */}
      <section className="bg-white py-12 md:py-20 border-b border-gray-100 mb-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-600 font-extrabold tracking-widest text-sm uppercase mb-4 block">Espace Conseils</span>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 text-secondary-500">Conseils & Astuces</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Parce qu'être parent est une aventure, nous vous accompagnons avec les meilleurs conseils pour le bien-être de votre famille.
          </p>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- GRILLE DES ARTICLES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {articles.map((article) => (
            <div 
              key={article.id} 
              className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:-translate-y-2"
            >
              {/* Image Carte */}
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Contenu Carte */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center text-xs text-gray-400 mb-4 gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : ''}
                  </div>
                  <span className="text-gray-200">|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 3 min
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h2>
                
                {/* Aperçu du texte JUSTIFIÉ */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1 text-justify">
                  {article.content}
                </p>

                <button 
                    onClick={() => setSelectedArticle(article)}
                    className="text-primary-600 font-bold hover:text-primary-800 flex items-center gap-2 text-sm mt-auto group/btn transition-all"
                >
                  Lire l'article complet <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message si vide */}
        {articles.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-6"/>
                <h3 className="text-xl font-bold text-gray-900">Pas encore d'articles</h3>
                <p className="text-gray-500 mt-2">Revenez très bientôt pour de nouveaux conseils !</p>
            </div>
        )}

      </div>

      {/* --- MODALE DE LECTURE --- */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
                
                {/* Bouton Fermer */}
                <button 
                    onClick={closeArticle}
                    className="absolute top-6 right-6 bg-white/90 p-3 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-all z-20 shadow-lg active:scale-90"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Contenu Scrollable */}
                <div className="overflow-y-auto custom-scrollbar">
                    {/* Image Modale */}
                    <div className="h-80 md:h-[450px] w-full shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={selectedArticle.image_url} 
                            alt={selectedArticle.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-8 md:p-16">
                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-8 font-medium">
                            <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                                <Calendar className="h-4 w-4 text-primary-500"/> {new Date(selectedArticle.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                                <Clock className="h-4 w-4 text-primary-500"/> Lecture : ~3 min
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-10 leading-tight">
                            {selectedArticle.title}
                        </h2>

                        {/* Texte JUSTIFIÉ */}
                        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-justify text-lg md:text-xl font-light">
                            {selectedArticle.content}
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-4 text-primary-600 font-bold">
                                <BookOpen className="h-6 w-6"/>
                                Akwaba Bébé vous accompagne
                            </div>
                            <button 
                                onClick={closeArticle}
                                className="bg-primary-600 text-white px-10 py-4 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95"
                            >
                                J'ai fini ma lecture
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}