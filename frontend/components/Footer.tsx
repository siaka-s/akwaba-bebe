import { Heart, Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Colonne 1 : Marque */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
               <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-600 fill-primary-600" />
               </div>
               <span className="font-bold text-2xl text-white">Akwaba Bébé</span>
            </div>

            <p className="text-primary-100 leading-relaxed max-w-md">
              Votre partenaire de confiance pour le bien-être des mamans. 
              Nature, douceur et énergie pour accompagner votre enfant.
            </p>
            <div className="flex space-x-4 pt-2">
              {[Facebook, Instagram, MessageCircle].map((Icon, i) => (
                <button key={i} className="bg-primary-800 hover:bg-secondary-500 text-white p-3 rounded-full transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Colonne 2 : Liens */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-secondary-400">Navigation</h3>
            <ul className="space-y-4">
              {['Nos produits', 'À propos', 'Contact', 'Blog'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-primary-100 hover:text-secondary-400 transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-secondary-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-secondary-400">Nous trouver</h3>
            <div className="space-y-4 text-primary-100">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-secondary-500 shrink-0" />
                <span>Cocody Faya, Rue G50<br/>Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-secondary-500 shrink-0" />
                <a href="tel:+2250101089995" className="hover:text-white transition-colors">01 01 08 99 95</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-secondary-500 shrink-0" />
                <a href="mailto:contact@akwababebe.com" className="hover:text-white transition-colors">contact@akwababebe.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-800 pt-8 text-center text-sm text-primary-200">
          <p>
            © {new Date().getFullYear()} Akwaba Bébé. Fait avec <Heart className="h-3 w-3 inline text-accent-500 mx-1 fill-accent-500" /> à Abidjan.
          </p>
        </div>
      </div>
    </footer>
  );
}