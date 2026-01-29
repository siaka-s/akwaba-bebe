'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // SUCCÈS : Stockage des infos
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_name', data.full_name);

      // Force un rafraîchissement pour mettre à jour le Header immédiatement
      window.location.href = '/'; 

    } catch (err: any) {
      setError(err.message);
      setLoading(false); // Stop loading seulement si erreur (si succès, on redirige)
    }
  };

  return (
    <div className="min-h-screen bg-primary-50/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* --- 1. BOUTON RETOUR À L'ACCUEIL --- */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-primary-600 transition-colors font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour à l'accueil
      </Link>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        <div className="p-8">
          {/* En-tête Carte */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center shadow-inner mb-4">
              <Heart className="h-6 w-6 text-primary-600 fill-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Bon retour parmi nous
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Accédez à votre espace Akwaba Bébé
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100 flex items-center justify-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Champ Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                        placeholder="exemple@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <Link href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                        Mot de passe oublié ?
                    </Link>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
              </div>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Pied de carte (Inscription) */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
              Créer un compte gratuit
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}