import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    title: "Casio FX-100MS",
    description: "Best budget calculator for students. Will work till 4th Year without any problems",
    price: "₹971",
    image: "https://m.media-amazon.com/images/I/61gYf0RIFiL._SX679_.jpg",
    link: "https://amzn.to/496sArV",
  },
  {
    id: 2,
    title: "Laptop Stand (Ergonomic)",
    description: "Improve posture and productivity during long coding sessions.",
    price: "₹1799",
    image: "https://m.media-amazon.com/images/I/615sV-wxJyL._SX679_.jpg",
    link: "https://amzn.to/48TqBIV",
  },
  {
    id: 3,
    title: "EvoFox Mechanical Keyboard",
    description: "Tactile mechanical keyboard ideal for programmers.",
    price: "₹1799",
    image: "https://m.media-amazon.com/images/I/61cvMO-HeeL._SX679_.jpg",
    link: "https://amzn.to/4pO3Hsd",
  },
  {
    id: 4,
    title: "Cool Developer stickers",
    description: "Decorate your digital weapon with trendy stickers",
    price: "₹148",
    image: "https://m.media-amazon.com/images/I/81h9hPUM8uL._SX679_.jpg",
    link: "https://amzn.to/4p88eEG",
  },
  {
    id: 5,
    title: "Cracking The Coding Interview",
    description: "Most asked coding interview questions with solutions.",
    price: "₹418",
    image: "https://m.media-amazon.com/images/I/51BKztjHJAL.jpg",
    link: "https://amzn.to/3KLMn8h",
  },
  {
    id: 6,
    title: "GitHub t-shirt",
    description: "DUDEME Git Hub The Place Where I Fork Half Sleeve 100% Cotton 180 GSM T-Shirt",
    price: "₹468",
    image: "https://m.media-amazon.com/images/I/51s2A-F2T-L._SX679_.jpg",
    link: "https://amzn.to/4994tZM",
  },
];

const Game = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
            Recommended Products for Students
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Handpicked tools and resources that genuinely help B.Tech students
            learn better and code smarter.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {products.map((product) => (
            <Card
              key={product.id}
              className="p-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-40 object-contain rounded-md mb-4 bg-white dark:bg-gray-700"
                />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {product.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="font-medium text-green-700 dark:text-green-400">
                  {product.price}
                </span>
                <Button asChild>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Product
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
