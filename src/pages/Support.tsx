
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Coffee,
  QrCode,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const { toast } = useToast();
  const [coffeeCount, setCoffeeCount] = useState(1);
  const [activeTab, setActiveTab] = useState("upi");

  const shareUrl = window.location.href;
  const upiId = "9897087612@ybl"; // Replace with actual UPI ID if different from QR

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "UPI ID Copied!",
      description: "You can now paste it in your payment app.",
    });
  };

  const handleShare = (platform: string) => {
    let url = "";
    const text = "Check out GCET Resources - The best place for study materials! 🚀";

    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied!", description: "Share it with your friends!" });
        return;
    }
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 dark:bg-teal-500/10 rounded-full ring-1 ring-primary/20 dark:ring-teal-500/20">
            <Heart className="w-8 h-8 text-primary dark:text-teal-400 fill-primary/20 dark:fill-teal-500/20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Fuel Our Mission 🚀
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            GCET Resources is built by students, for students. Your support helps us cover server costs
            and keep this platform free for everyone forever.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl shadow-primary/5 dark:shadow-teal-500/5 bg-white dark:bg-gray-900 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
            <div className="grid md:grid-cols-5 h-full min-h-[500px]">

              {/* Left Column: Value Prop */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800/50 p-8 flex flex-col justify-between border-r border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary dark:text-teal-500" />
                    Why Support Us?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Keep the website ad-free",
                      "Cover domain & server costs",
                      "Support open-source development",
                      "Help us add more resources"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-500 italic">
                    "Every contribution, big or small, helps us build a better learning platform."
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Tabs */}
              <div className="md:col-span-3 p-6 md:p-8">
                <Tabs defaultValue="upi" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="upi" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                      <QrCode className="w-4 h-4 mr-2" />
                      UPI / Scan
                    </TabsTrigger>
                    <TabsTrigger value="coffee" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                      <Coffee className="w-4 h-4 mr-2" />
                      Buy Coffee
                    </TabsTrigger>
                  </TabsList>

                  {/* UPI Tab */}
                  <TabsContent value="upi" className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-teal-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                      <div className="relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <img
                          src="/qr-code.png"
                          alt="Payment QR Code"
                          className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="mt-8 w-full max-w-xs space-y-3">
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                        Scan with any UPI app
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <code className="text-sm font-mono flex-1 text-center text-gray-700 dark:text-gray-300 truncate">
                          {upiId}
                        </code>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={copyUpiId}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Buy Me A Coffee Tab */}
                  <TabsContent value="coffee" className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">How many coffees? ☕</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Each coffee makes us code faster!</p>
                      </div>

                      <div className="flex justify-center gap-4">
                        {[1, 3, 5].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setCoffeeCount(amount)}
                            className={`flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all duration-200 ${coffeeCount === amount
                                ? "border-primary bg-primary/5 dark:border-teal-500 dark:bg-teal-500/10 scale-105 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-teal-500/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                          >
                            <span className="text-2xl mb-1">☕</span>
                            <span className={`font-bold ${coffeeCount === amount ? 'text-primary dark:text-teal-400' : 'text-gray-600 dark:text-gray-400'}`}>
                              x{amount}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          Total Support: ₹{coffeeCount * 50}
                        </p>
                      </div>

                      <Button
                        className="w-full bg-primary dark:bg-teal-600 hover:bg-primary/90 dark:hover:bg-teal-500 text-white h-12 text-lg shadow-lg shadow-primary/20"
                        onClick={() => setActiveTab('upi')}
                      >
                        Proceed to Pay
                      </Button>
                      <p className="text-xs text-center text-gray-400">
                        (Redirects to QR code for payment)
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>

          {/* Social Share Section */}
          <div className="mt-16 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-gray-50/50 dark:bg-gray-950 px-4 text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                  Or Share With Friends
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="gap-2 rounded-full h-11 px-6 hover:text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/5 transition-colors" onClick={() => handleShare('whatsapp')}>
                <Share2 className="w-4 h-4" /> WhatsApp
              </Button>
              <Button variant="outline" className="gap-2 rounded-full h-11 px-6 hover:text-[#1DA1F2] hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/5 transition-colors" onClick={() => handleShare('twitter')}>
                <Twitter className="w-4 h-4" /> Twitter
              </Button>
              <Button variant="outline" className="gap-2 rounded-full h-11 px-6 hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-colors" onClick={() => handleShare('linkedin')}>
                <Linkedin className="w-4 h-4" /> LinkedIn
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 border border-transparent hover:border-gray-200 dark:hover:border-gray-700" onClick={() => handleShare('copy')}>
                <Copy className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
