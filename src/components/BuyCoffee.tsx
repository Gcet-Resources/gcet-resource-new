
import { Coffee } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const BuyCoffee = () => {
  const [coffeeCount, setCoffeeCount] = useState(1);
  const [message, setMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSupport = () => {
    // Handle payment integration here
    console.log("Support with:", coffeeCount, "coffees");
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Coffee className="text-primary h-6 w-6" />
        <h2 className="text-2xl font-semibold">Buy me a coffee</h2>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Coffee className="h-8 w-8 text-primary" />
        <span className="text-xl">×</span>
        <div className="flex space-x-2">
          {[1, 3, 5].map((num) => (
            <Button
              key={num}
              variant={coffeeCount === num ? "default" : "outline"}
              onClick={() => setCoffeeCount(num)}
              className="w-12 h-12"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Say something nice (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        rows={3}
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="private"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded border-gray-300 focus:ring-primary"
        />
        <label htmlFor="private" className="text-sm text-gray-600">
          Make this message private
        </label>
      </div>

      <Button onClick={handleSupport} className="w-full">
        Support ${coffeeCount * 4}
      </Button>
    </Card>
  );
};

export default BuyCoffee;
