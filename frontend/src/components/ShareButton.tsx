import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SITE_URL } from "@/lib/site";
import { trackShare } from "@/lib/analytics";

interface ShareButtonProps {
  year: string;
  subjectId: string;
  subjectTitle: string;
  className?: string;
}

export function ShareButton({
  year,
  subjectId,
  subjectTitle,
  className,
}: ShareButtonProps) {
  const { toast } = useToast();

  const shareUrl = `${SITE_URL}/resources/${year}/${subjectId}`;
  const shareText = `Check out ${subjectTitle} (${subjectId}) resources on GCET Resources — notes, PYQs & more!`;

  const handleShare = async () => {
    trackShare(subjectId, year);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${subjectTitle} | GCET Resources`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        /* user cancelled or failed */
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${shareText}\n${shareUrl}`
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    toast({
      title: "Share via WhatsApp",
      description: "Opening WhatsApp to share this subject.",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleShare}
    >
      <Share2 className="w-3.5 h-3.5 mr-1.5" />
      Share
    </Button>
  );
}
