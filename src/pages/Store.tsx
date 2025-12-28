
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import products from "@/data/products.json";
import ProductCard from "@/components/ProductCard";

const Store = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
            Welcome to the Store
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse our collection of unique and handcrafted items.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-16 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">coming soon...</p>
        </div>

      </div>
    </div>
  );
};

export default Store;
