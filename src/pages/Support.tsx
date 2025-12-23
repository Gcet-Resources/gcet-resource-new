
import { Navigation } from "@/components/Navigation";
import BuyCoffee from "@/components/BuyCoffee";
import UpiPayment from "@/components/UpiPayment";
import SocialShare from "@/components/SocialShare";
import { HeartHandshake } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-teal-500/20 flex items-center justify-center">
                <HeartHandshake className="w-8 h-8 text-primary dark:text-teal-400" />
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white">
              Support Our Work
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Help us keep GCET Resources running and contribute to the growth of our educational community. Your support means a lot to us!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <BuyCoffee />
              <SocialShare />
            </div>
            <UpiPayment />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
