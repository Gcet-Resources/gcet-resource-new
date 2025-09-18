
import { Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const SocialShare = () => {
  const shareUrl = window.location.href;
  const title = "Check out GCET Resources!";

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Share2 className="text-primary h-6 w-6" />
        <h2 className="text-2xl font-semibold">Share with friends</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="flex flex-col items-center space-y-2 h-auto py-4"
          onClick={() => window.open(shareLinks.facebook, "_blank")}
        >
          <Facebook className="h-6 w-6" />
          <span className="text-sm">Facebook</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center space-y-2 h-auto py-4"
          onClick={() => window.open(shareLinks.twitter, "_blank")}
        >
          <Twitter className="h-6 w-6" />
          <span className="text-sm">Twitter</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center space-y-2 h-auto py-4"
          onClick={() => window.open(shareLinks.linkedin, "_blank")}
        >
          <Linkedin className="h-6 w-6" />
          <span className="text-sm">LinkedIn</span>
        </Button>
      </div>
    </Card>
  );
};

export default SocialShare;
