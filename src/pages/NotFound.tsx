import { useLocation, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title="Page Not Found" noIndex path={location.pathname} />
      <Navigation />
      <main
        id="main-content"
        className="flex items-center justify-center pt-32 pb-20 px-4"
      >
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            404
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Page not found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {location.pathname}
            </code>{" "}
            doesn&apos;t exist.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/year-selection">
                <Search className="w-4 h-4 mr-2" />
                Browse resources
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
