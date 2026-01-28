'use client';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* Infos de contact (Gauche) */}
        <div className="bg-primary-600 p-10 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-6">Contactez-nous</h1>
            <p className="text-primary-100 mb-10">
              Une question sur un produit ? Besoin d'un conseil ? Notre équipe est là pour vous écouter.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary-200" />
                <span>+225 07 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary-200" />
                <span>bonjour@akwababebe.ci</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary-200" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire (Droite) */}
        <div className="p-10">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Votre nom" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Comment pouvons-nous vous aider ?"></textarea>
            </div>
            <button type="button" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors flex justify-center items-center gap-2">
              <Send className="h-5 w-5" />
              Envoyer le message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}