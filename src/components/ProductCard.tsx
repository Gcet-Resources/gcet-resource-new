
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProductCard = ({ product }) => {
  return (
    <Card className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="p-0">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
        </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
        <p className="text-gray-600 dark:text-gray-300">₹{product.price}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between">
        <Button>Add to Cart</Button>
        <Button variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
