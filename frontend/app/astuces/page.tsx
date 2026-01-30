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
  
  // État pour l'article sélectionné (Modal)
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

  // Fonction pour fermer la modale si on clique en dehors ou sur la croix
  const closeArticle = () => setSelectedArticle(null);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary-900 mb-4">Conseils & Astuces</h1>
          <p className="text-xl text-gray-600">Le guide des parents épanouis</p>
        </div>

        {/* Grille des articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
              
              {/* Image Carte */}
              <div className="h-48 overflow-hidden bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Contenu Carte */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-xs text-gray-400 mb-3 gap-2">
                  <Calendar className="h-3 w-3" />
                  {article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : ''}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h2>
                
                {/* Aperçu du texte (coupé à 3 lignes) */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                  {article.content}
                </p>

                {/* Bouton pour ouvrir la modale */}
                <button 
                    onClick={() => setSelectedArticle(article)}
                    className="text-primary-600 font-bold hover:text-primary-800 flex items-center gap-2 text-sm mt-auto transition-colors"
                >
                  Lire la suite <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Message si vide */}
        {articles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <BookOpen className="h-12 w-12 text-primary-200 mx-auto mb-4"/>
                <p className="text-gray-500">Aucune astuce pour le moment.</p>
            </div>
        )}

      </div>

      {/* --- MODALE DE LECTURE --- */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            
            {/* Conteneur Modale */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                
                {/* Bouton Fermer */}
                <button 
                    onClick={closeArticle}
                    className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors z-10"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Image Modale */}
                <div className="h-64 shrink-0 bg-gray-100">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={selectedArticle.image_url} 
                        alt={selectedArticle.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Contenu Scrollable */}
                <div className="p-8 overflow-y-auto">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(selectedArticle.created_at).toLocaleDateString('fr-FR')}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> Lecture : ~3 min</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                        {selectedArticle.title}
                    </h2>

                    {/* Texte complet avec respect des sauts de ligne */}
                    <div className="prose prose-pink max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedArticle.content}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={closeArticle}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}