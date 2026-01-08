
import { Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const SellerLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    // In a real application, you would validate the credentials here.
    login({ name: "Jane Doe", role: "seller" });
    navigate("/seller-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display font-bold">Seller Login</CardTitle>
            <CardDescription>Enter your credentials to access the seller dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleLogin}>Login</Button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              Don't have an account? <Link to="/seller-signup" className="text-primary dark:text-teal-400 hover:underline">Sign up</Link>
            </p>
            <Link to="/store">
                <Button variant="ghost">Go Back</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SellerLoginPage;
