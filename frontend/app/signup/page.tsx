'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, User, Mail, Lock, Phone, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  
  // États
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // Pour l'œil
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      // Succès
      alert("Compte créé avec succès ! Connectez-vous maintenant.");
      router.push('/login');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FOND DÉGRADÉ (Cohérent avec Login)
    <div className="min-h-screen bg-gradient-to-tl from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* --- DÉCORATION D'ARRIÈRE-PLAN --- */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-secondary-200/40 rounded-full blur-3xl animate-pulse" />

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
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full flex items-center justify-center shadow-inner mb-4">
              <User className="h-6 w-6 text-secondary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Rejoignez la famille
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Créez votre compte Akwaba Bébé en 1 minute
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nom Complet */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nom Complet</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="full_name"
                        type="text"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-all"
                        placeholder="Ex: Kouassi Jean"
                        onChange={handleChange}
                    />
                </div>
              </div>
              
              {/* Téléphone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Téléphone</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="phone"
                        type="tel"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-all"
                        placeholder="Ex: 01 02 03 04 05"
                        onChange={handleChange}
                    />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="email"
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-all"
                        placeholder="Ex: jean@email.com"
                        onChange={handleChange}
                    />
                </div>
              </div>

              {/* Mot de passe + Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Mot de passe</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-all"
                        placeholder="••••••••"
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary-600 transition-colors cursor-pointer"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
              </div>
            </div>

            {/* Bouton Inscription (Secondaire / Orange) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-secondary-500 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all shadow-md hover:shadow-lg mt-6"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "S'inscrire gratuitement"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}