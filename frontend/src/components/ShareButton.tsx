import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SITE_URL } from "@/lib/site";
interface Props {
  year: string;
  subjectId: string;
  subjectTitle: string;
  className?: string;
  path?: string;
}
export function ShareButton({
  year,
  subjectId,
  subjectTitle,
  className,
  path,
}: Props) {
  const { toast } = useToast();
  const handle = async () => {
    const url = new URL(path || `/resources/${year}/${subjectId}`, SITE_URL)
      .href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${subjectTitle} | GCET Campus`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast({
        title: "Unable to share",
        description: "Copy this page’s address from your browser.",
        variant: "destructive",
      });
    }
  };
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => void handle()}
    >
      <Share2 size={14} className="mr-2" />
      Share
    </Button>
  );
}
