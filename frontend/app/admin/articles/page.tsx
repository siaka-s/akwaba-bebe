'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Loader2, Calendar } from 'lucide-react';
import { API_URL } from '@/config';

interface Article {
  id: number;
  title: string;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/articles`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setArticles(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-500"/></div>;

  return (
    <div className="max-w-5xl mx-auto">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Blog & Astuces</h1>
          <p className="text-gray-500">Partagez vos conseils avec les parents</p>
        </div>
        <Link 
          href="/admin/articles/add" 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <Plus className="h-5 w-5" />
          Rédiger un article
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Titre</th>
              <th className="p-4 font-semibold text-gray-600">Date de publication</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    {article.title}
                </td>
                <td className="p-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.created_at).toLocaleDateString('fr-FR')}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            Aucun article pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}