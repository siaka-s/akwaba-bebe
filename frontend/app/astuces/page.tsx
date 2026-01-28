'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Loader2, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('http://localhost:8080/articles', {
            cache: 'no-store'
        });

        // Si le serveur répond une erreur (ex: 404 ou 500)
        if (!res.ok) {
            console.error("Erreur réponse API:", res.status);
            setArticles([]);
            return;
        }

        const data = await res.json();
        setArticles(data || []);
      } catch (err) {
        // Si le serveur est éteint ou inaccessible
        console.error("Impossible de contacter le serveur:", err);
        setArticles([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary-900 mb-4">Conseils & Astuces</h1>
          <p className="text-xl text-gray-600">Le guide des parents épanouis</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
              
              <div className="h-48 overflow-hidden bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-xs text-gray-400 mb-3 gap-2">
                  <Calendar className="h-3 w-3" />
                  {/* Gestion sécurisée de la date */}
                  {article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : ''}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                  {article.content}
                </p>

                <button className="text-primary-600 font-bold hover:text-primary-800 flex items-center gap-2 text-sm mt-auto">
                  Lire la suite <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {articles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <BookOpen className="h-12 w-12 text-primary-200 mx-auto mb-4"/>
                <p className="text-gray-500">Aucune astuce pour le moment.</p>
                <p className="text-xs text-gray-400 mt-2">(Vérifiez que le Backend Go tourne bien)</p>
            </div>
        )}

      </div>
    </div>
  );
}