'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: '', email: '', subject: 'Conseil produit', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.message) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Message envoyé avec succès !');
        setForm({ full_name: '', email: '', subject: 'Conseil produit', message: '' });
      } else {
        toast.error(data.message || 'Erreur lors de l\'envoi.');
      }
    } catch {
      toast.error('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 w-full">

      <div className="bg-white py-6 md:py-6 ">
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-0 bg-white rounded-4xl shadow-sm overflow-hidden border border-gray-100">

          {/* Infos de contact (Gauche - 2 colonnes) */}
          <div className="md:col-span-2 bg-primary-600 p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8">Nos coordonnées</h2>
              <p className="text-primary-100 mb-12 text-lg leading-relaxed text-justify">
                Besoin d&apos;un conseil personnalisé ou d&apos;un suivi sur votre commande ? Nous vous répondons avec bienveillance.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary-200 text-xs font-bold uppercase tracking-wider">Téléphone</span>
                    <span className="text-lg font-medium">+225 01 01 08 99 95</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary-200 text-xs font-bold uppercase tracking-wider">Email</span>
                    <span className="text-lg font-medium">contact@akwababebe.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-white/20 transition-colors">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary-200 text-xs font-bold uppercase tracking-wider">Localisation</span>
                    <span className="text-lg font-medium">Abidjan, Côte d&apos;Ivoire</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux Sociaux */}
            <div className="mt-16 pt-8 border-t border-white/20 flex gap-4">
               <div className="bg-white/10 p-3 rounded-full hover:bg-white/20 cursor-pointer transition-all">
                  <Facebook className="h-5 w-5" />
               </div>
               <div className="bg-white/10 p-3 rounded-full hover:bg-white/20 cursor-pointer transition-all">
                  <Instagram className="h-5 w-5" />
               </div>
            </div>
          </div>

          {/* Formulaire (Droite - 3 colonnes) */}
          <div className="md:col-span-3 p-10 md:p-16">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Nom complet</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-gray-50 border-none px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-700"
                    placeholder="Ex: Aminata Koné"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-gray-50 border-none px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-700"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Sujet</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-gray-50 border-none px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-700 appearance-none"
                >
                  <option>Conseil produit</option>
                  <option>Suivi de commande</option>
                  <option>Devenir partenaire</option>
                  <option>Autre demande</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                <textarea
                  rows={5}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-gray-50 border-none px-6 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-700 text-justify"
                  placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary-500 text-primary-500 py-5 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex justify-center items-center gap-3 text-lg active:scale-95 disabled:opacity-60"
              >
                <Send className="h-5 w-5" />
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
