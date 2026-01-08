
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for items for sale
const listedItems = [
  { id: 1, name: "Handmade Ceramic Mug", price: 25, stock: 10 },
  { id: 2, name: "Custom-Printed T-Shirt", price: 30, stock: 5 },
  { id: 3, name: "Original Watercolor Painting", price: 200, stock: 1 },
];

const SellerPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display font-bold">Welcome, {user?.name}!</h1>
            <Button onClick={logout}>Logout</Button>
        </div>
        
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Your Listed Items</CardTitle>
            <Button>Add New Item</Button>
          </CardHeader>
          <CardContent>
            {listedItems.length > 0 ? (
              <ul className="space-y-4">
                {listedItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600 dark:text-gray-300">${item.price} - {item.stock} in stock</p>
                    </div>
                    <div>
                        <Button variant="outline" className="mr-2">Edit</Button>
                        <Button variant="destructive">Delete</Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven't listed any items for sale yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerPage;
