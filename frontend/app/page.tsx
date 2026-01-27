import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('http://localhost:8080/products', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Impossible de récupérer les produits');
  }

  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mb-10 text-center">
        {/* Titre en vert foncé */}
        <h1 className="text-4xl font-extrabold text-primary-800 mb-2">
          Bienvenue sur Akwaba Bébé
        </h1>
        <p className="text-gray-600">Tout pour le bonheur de votre enfant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            
            <div className="h-48 w-full bg-gray-200 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center mt-4">
                {/* Prix en Vert et Jaune */}
                <span className="text-2xl font-bold text-primary-600">
                  {product.price.toLocaleString()} FCFA
                </span>
                {/* Bouton en Vert Akwaba */}
                <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm font-medium">
                  Ajouter
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Stock: {product.stock_quantity}
              </div>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}