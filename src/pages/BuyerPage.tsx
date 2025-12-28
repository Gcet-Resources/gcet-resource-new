
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data for purchased items
const purchasedItems = [
  { id: 1, name: "Vintage Leather Jacket", price: 150 },
  { id: 2, name: "Antique Wooden Chair", price: 75 },
  { id: 3, name: "Signed First Edition Book", price: 300 },
];

const BuyerPage = () => {
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
          <CardHeader>
            <CardTitle>Your Purchased Items</CardTitle>
          </CardHeader>
          <CardContent>
            {purchasedItems.length > 0 ? (
              <ul className="space-y-4">
                {purchasedItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600 dark:text-gray-300">${item.price}</p>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven't purchased any items yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
            <Link to="/store">
                <Button>Browse for New Items</Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerPage;
