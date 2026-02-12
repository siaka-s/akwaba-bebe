'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State pour les données du formulaire
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '', // Souvent en lecture seule
    phone: ''
  });

  // 1. Chargement initial des données utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // Ou redirection vers login

      try {
        const res = await fetch('http://localhost:8080/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setFormData(data);
        }
      } catch (error) {
        console.error("Erreur fetch profil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Gestion des changements dans les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Soumission du formulaire (Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
        const res = await fetch('http://localhost:8080/profile', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone
            })
        });

        if (res.ok) {
            toast.success("Profil mis à jour !");
            // Mise à jour locale du localStorage si nécessaire (ex: nom affiché dans le header)
            localStorage.setItem('user_name', `${formData.first_name} ${formData.last_name}`);
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
    } catch (error) {
        toast.error("Erreur serveur");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-600"/></div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <User className="h-8 w-8 text-primary-600"/> Mon Profil
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Prénom & Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
                    <input 
                        type="text" 
                        name="first_name"
                        value={formData.first_name} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                    <input 
                        type="text" 
                        name="last_name"
                        value={formData.last_name} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            {/* Email (Lecture Seule) */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"/>
                    <input 
                        type="email" 
                        value={formData.email} 
                        disabled
                        className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
            </div>

            {/* Téléphone */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"/>
                    <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            {/* Bouton Action */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5"/>}
                    Enregistrer les modifications
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}