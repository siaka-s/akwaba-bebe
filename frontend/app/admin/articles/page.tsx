'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
        <Button asChild>
          <Link href="/admin/articles/add">
            <Plus className="h-4 w-4" />
            Rédiger un article
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead className="w-52">Date de publication</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    {article.title}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.created_at).toLocaleDateString('fr-FR')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {articles.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            Aucun article pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}