import { Heart, Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    // Changement ici : bg-primary-50 (fond très clair) au lieu de bg-primary-900
    <footer className="bg-primary-50 text-gray-600 pt-0 md:pt-16 pb-8 border-t border-primary-100">
      <div className="container mx-auto px-4">
        <div className="hidden md:grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Colonne 1 : Marque */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
               {/* Logo : Fond blanc pour ressortir sur le gris clair */}
               <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="h-4 w-4 text-primary-600 fill-primary-600" />
               </div>
               <span className="font-bold text-2xl text-primary-900">Akwaba Bébé</span>
            </div>

            <p className="text-gray-600 leading-relaxed max-w-md">
              Votre partenaire de confiance pour le bien-être des mamans. 
              Nature, douceur et énergie pour accompagner votre enfant.
            </p>
            <div className="flex space-x-4 pt-2">
              {[Facebook, Instagram, MessageCircle].map((Icon, i) => (
                <button key={i} className="bg-white text-primary-600 hover:bg-primary-600 hover:text-white p-3 rounded-full transition-all duration-300 shadow-sm border border-gray-100">
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Colonne 2 : Liens */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-primary-900">Navigation</h3>
            <ul className="space-y-4">
              {['Nos produits', 'À propos', 'Contact', 'Blog'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-primary-900">Nous trouver</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                <span>Cocody Faya, Rue G50<br/>Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                <a href="tel:+2250101089995" className="hover:text-primary-700 transition-colors font-medium">01 01 08 99 95</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                <a href="mailto:contact@akwababebe.com" className="hover:text-primary-700 transition-colors">contact@akwababebe.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="md:border-t border-primary-200 pt-4 md:pt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Akwaba Bébé.
          </p>
        </div>
      </div>
    </footer>
  );
}