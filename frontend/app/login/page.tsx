'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast'; // <--- 1. Import de Toast
import { API_URL } from '@/config';

export default function LoginPage() {
  const router = useRouter();
  
  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // J'ai supprimé [error, setError] car on utilise les toasts maintenant

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // --- 2. ALERTE ERREUR MODERNE ---
        toast.error(data.message || 'Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // --- 3. ALERTE SUCCÈS ---
      // On récupère le prénom pour personnaliser le message
      const firstName = data.full_name ? data.full_name.split(' ')[0] : '';
      toast.success(`Heureux de vous revoir, ${firstName} ! 👋`);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_name', data.full_name);

      // Petite pause pour laisser le temps de voir le toast vert avant de rediriger
      setTimeout(() => {
        window.location.href = '/'; 
      }, 1000);

    } catch (err: any) {
      toast.error("Données incorrectes");
      setLoading(false);
    }
  };

  return (
    // FOND DÉGRADÉ + ANIMATION SECONDAIRE
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* --- CERCLES DÉCORATIFS ANIMÉS (Secondaire) --- */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-secondary-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-primary-200/40 rounded-full blur-3xl" />

      {/* --- BOUTON RETOUR --- */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-secondary-600 transition-colors font-medium z-10"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour à l'accueil
      </Link>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/50 relative z-10">
        
        <div className="p-8">
          {/* En-tête Carte */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-linear-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center shadow-inner mb-4">
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
            
            {/* L'ancien bloc d'erreur rouge a été supprimé ici */}

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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-all"
                        placeholder="exemple@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              {/* Champ Mot de passe AVEC OEIL */}
              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <Link href="#" className="text-xs font-medium text-secondary-600 hover:text-secondary-500">
                        Mot de passe oublié ?
                    </Link>
                </div>
                <div className="relative">
                    {/* Icône Cadenas à gauche */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {/* Input : Type change selon showPassword */}
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Bouton Oeil à droite */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary-600 transition-colors cursor-pointer"
                        tabIndex={-1} // Empêche le focus avec Tab
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
              </div>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Pied de carte (Inscription) */}
        <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="font-bold text-secondary-600 hover:text-secondary-700 transition-colors">
              Créer un compte gratuit
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}