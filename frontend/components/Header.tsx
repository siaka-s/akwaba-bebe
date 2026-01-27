import { ShoppingCart, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo'

export default function Header() {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-primary-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          <Logo size="md" />
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['Produits', 'À Propos', 'Contact', 'Astuces'].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`} 
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:underline decoration-secondary-500 decoration-2 underline-offset-4"
              >
                {item}
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative group">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-secondary-500 rounded-full border border-white group-hover:animate-bounce"></span>
            </button>
            
            <div className="hidden md:flex items-center space-x-3 border-l pl-3 ml-2 border-gray-200">
              <button className="text-sm font-medium text-primary-700 hover:text-primary-900 px-3 py-2">
                Connexion
              </button>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md transition-all transform hover:-translate-y-0.5">
                Inscription
              </button>
            </div>

            <button className="md:hidden p-2 text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}