import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CampusGuard,
  actionClass,
  inputClass,
  ErrorState,
} from "@/components/campus/CampusShell";
import { useAuth } from "@/context/AuthProvider";
import { requireSupabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/campus";

interface ReportContext {
  resourceId?: string;
  title: string;
  subjectId?: string;
  year?: string;
  resourceType?: string;
}

function ReportForm({
  resourceId,
  title,
  subjectId,
  year,
  resourceType,
}: ReportContext) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || busy) return;
    if (message.trim().length < 10) {
      setError("Describe the issue in at least 10 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Report stable catalog metadata only; never store a signed download URL/token.
      const context = [
        `Resource: ${title}`,
        subjectId && `Subject: ${subjectId}`,
        year && `Year: ${year}`,
        resourceType && `Type: ${resourceType}`,
      ]
        .filter(Boolean)
        .join("\n");
      const body = `${context}\n\n${message.trim()}`;
      if (body.length > 5000)
        throw new Error("Please shorten your description.");
      const validId =
        resourceId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          resourceId,
        )
          ? resourceId
          : null;
      const result = await requireSupabase()
        .from("reports")
        .insert({
          user_id: user.id,
          resource_id: validId,
          subject: `Resource issue: ${title}`.slice(0, 200),
          message: body,
          status: "open",
        })
        .select("id")
        .single();
      if (result.error) throw result.error;
      setReceipt(result.data.id);
      setMessage("");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };
  if (receipt)
    return (
      <div
        role="status"
        className="rounded-xl bg-teal-50 p-5 text-teal-900 dark:bg-teal-950 dark:text-teal-200"
      >
        <p className="font-semibold">Your report has been submitted.</p>
        <p className="mt-2 text-sm">
          The campus team can now review this resource issue.
        </p>
        <p className="mt-3 break-all text-xs">Reference: {receipt}</p>
      </div>
    );
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {[subjectId, year, resourceType].filter(Boolean).join(" · ")}
        </p>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">What went wrong?</span>
        <textarea
          required
          minLength={10}
          maxLength={4000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={busy}
          className={`${inputClass} min-h-32`}
          placeholder="For example: the document does not open, access is denied, or the file belongs to another subject."
        />
      </label>
      {error && <ErrorState message={error} />}
      <button disabled={busy} className={actionClass}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Submitting…" : "Send report"}
      </button>
    </form>
  );
}

export function ResourceReport(props: ReportContext) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Flag size={15} className="mr-2" />
        Report an issue
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report a resource issue</DialogTitle>
            <DialogDescription>
              Tell the campus team what needs attention. Your report is visible
              to you and administrators.
            </DialogDescription>
          </DialogHeader>
          <CampusGuard>
            <ReportForm key={props.resourceId || props.title} {...props} />
          </CampusGuard>
        </DialogContent>
      </Dialog>
    </>
  );
}
