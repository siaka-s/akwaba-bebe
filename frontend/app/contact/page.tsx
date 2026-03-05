'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, MessageCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/config';

const PHONE = '+22501010899​95';
const PHONE_DISPLAY = '+225 01 01 08 99 95';
const EMAIL = 'contact@akwababebe.com';
const WHATSAPP = 'https://wa.me/2250101089995';

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
        toast.error(data.message || "Erreur lors de l'envoi.");
      }
    } catch {
      toast.error('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">

      {/* ===== MOBILE : Actions rapides ===== */}
      <section className="md:hidden px-4 pt-5 pb-2">

        {/* Appeler + WhatsApp : 2 gros boutons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <a href={`tel:${PHONE}`}
            className="flex flex-col items-center justify-center gap-2 bg-primary-600 active:scale-95 text-white rounded-2xl py-5 shadow-md transition-all">
            <Phone className="h-6 w-6" />
            <span className="text-sm font-bold">Appeler</span>
            <span className="text-[11px] text-primary-200">{PHONE_DISPLAY}</span>
          </a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 bg-green-500 active:scale-95 text-white rounded-2xl py-5 shadow-md transition-all">
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm font-bold">WhatsApp</span>
            <span className="text-[11px] text-green-100">Message rapide</span>
          </a>
        </div>

        {/* Email : bouton secondaire */}
        <a href={`mailto:${EMAIL}`}
          className="flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-3.5 shadow-sm active:scale-95 transition-all">
          <Mail className="h-5 w-5 text-secondary-500" />
          <span className="text-sm font-semibold text-gray-700">{EMAIL}</span>
        </a>

        {/* Séparateur */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou envoyez un message</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </section>

      {/* ===== DESKTOP : Actions rapides (3 icônes) ===== */}
      <section className="hidden md:block px-4 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-3">
          <a href={`tel:${PHONE}`}
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-4 px-2 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
            <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <Phone className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-xs font-bold text-gray-700">Appeler</span>
            <span className="text-[10px] text-gray-400">{PHONE_DISPLAY}</span>
          </a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-4 px-2 shadow-sm hover:shadow-md hover:border-green-200 transition-all group">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs font-bold text-gray-700">WhatsApp</span>
            <span className="text-[10px] text-gray-400">Chat rapide</span>
          </a>
          <a href={`mailto:${EMAIL}`}
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-4 px-2 shadow-sm hover:shadow-md hover:border-secondary-200 transition-all group">
            <div className="w-11 h-11 bg-secondary-50 rounded-xl flex items-center justify-center group-hover:bg-secondary-100 transition-colors">
              <Mail className="h-5 w-5 text-secondary-600" />
            </div>
            <span className="text-xs font-bold text-gray-700">Email</span>
            <span className="text-[10px] text-gray-400 truncate max-w-full">{EMAIL}</span>
          </a>
        </div>
      </section>

      {/* ===== LAYOUT PRINCIPAL ===== */}
      <section className="px-4 pb-6 md:pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* Infos coordonnées — desktop uniquement */}
          <div className="hidden md:flex md:col-span-2 bg-primary-600 rounded-3xl p-8 text-white flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-28 h-28 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Nos coordonnées</h2>
              <p className="text-primary-200 text-sm mb-8 leading-relaxed">
                Besoin d&apos;un conseil ou d&apos;un suivi de commande ? Nous vous répondons avec bienveillance.
              </p>

              <div className="space-y-5">
                <a href={`tel:${PHONE}`} className="flex items-center gap-4 group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-wider">Téléphone</p>
                    <p className="font-semibold text-sm group-hover:underline">{PHONE_DISPLAY}</p>
                  </div>
                </a>

                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors shrink-0">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-wider">WhatsApp</p>
                    <p className="font-semibold text-sm group-hover:underline">{PHONE_DISPLAY}</p>
                  </div>
                </a>

                <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-wider">Email</p>
                    <p className="font-semibold text-sm group-hover:underline break-all">{EMAIL}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-primary-200 text-xs font-bold uppercase tracking-wider">Localisation</p>
                    <p className="font-semibold text-sm">Abidjan, Côte d&apos;Ivoire</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/20 flex gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl hover:bg-white/20 cursor-pointer transition-colors">
                <Facebook className="h-4 w-4" />
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl hover:bg-white/20 cursor-pointer transition-colors">
                <Instagram className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="md:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-10">
            <h2 className="text-base font-bold text-gray-900 mb-5">Envoyer un message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nom complet</label>
                  <input type="text" name="full_name" value={form.full_name} onChange={handleChange}
                    placeholder="Ex: Aminata Koné"
                    autoComplete="name"
                    className="w-full rounded-xl bg-gray-50 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-gray-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="votre@email.com"
                    inputMode="email"
                    autoComplete="email"
                    className="w-full rounded-xl bg-gray-50 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-gray-700" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sujet</label>
                <select name="subject" value={form.subject} onChange={handleChange}
                  className="w-full rounded-xl bg-gray-50 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-gray-700">
                  <option>Conseil produit</option>
                  <option>Suivi de commande</option>
                  <option>Box cadeau sur mesure</option>
                  <option>Devenir partenaire</option>
                  <option>Autre demande</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                <textarea rows={5} name="message" value={form.message} onChange={handleChange}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full rounded-xl bg-gray-50 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-gray-700 resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 active:scale-95 disabled:opacity-60 text-white py-4 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                <Send className="h-4 w-4" />
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* Bouton WhatsApp sticky — mobile uniquement */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 px-4 pb-5 pt-3 bg-linear-to-t from-gray-100 to-transparent pointer-events-none">
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
          className="pointer-events-auto flex items-center justify-center gap-2.5 w-full bg-green-500 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-xl transition-all">
          <MessageCircle className="h-5 w-5" />
          Discuter sur WhatsApp
        </a>
      </div>

    </div>
  );
}
