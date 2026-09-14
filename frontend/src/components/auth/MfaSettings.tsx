import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Factor } from "@supabase/supabase-js";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthProvider";
import { authErrorMessage, isValidPhoneNumber } from "@/lib/auth-policy";
import { isPhoneMfaEnabled, requireSupabase } from "@/lib/supabase";

type Challenge = {
  factorId: string;
  type: "totp" | "phone";
  enrolling: boolean;
  qrCode?: string;
  secret?: string;
  phone?: string;
  challengeId?: string;
  expiresAt?: number;
};
function safeQrSource(qr: string): string {
  const start = qr.indexOf("<svg");
  return start >= 0
    ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qr.slice(start))
    : qr;
}

export function MfaSettings() {
  const { user, isPrivileged, needsMfa, mfaLevel, refreshProfile } = useAuth();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [removeFactor, setRemoveFactor] = useState<Factor | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const cooldown = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const verifiedFactors = factors.filter(
    (factor) => factor.status === "verified",
  );
  const loadFactors = useCallback(async () => {
    const result = await requireSupabase().auth.mfa.listFactors();
    if (result.error) throw result.error;
    setFactors(
      result.data.all.filter(
        (factor) =>
          factor.factor_type === "totp" || factor.factor_type === "phone",
      ),
    );
  }, []);
  useEffect(() => {
    setLoading(true);
    void loadFactors()
      .catch((cause) =>
        setError(
          authErrorMessage(
            cause,
            "We couldn't load your verification methods. Please retry.",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, [loadFactors, user?.id]);
  useEffect(() => {
    if (!resendAt && !challenge?.expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt, challenge?.expiresAt]);

  async function refreshFactors() {
    setBusy("refresh");
    setError(null);
    try {
      await loadFactors();
    } catch (cause) {
      setError(
        authErrorMessage(cause, "Verification methods could not be loaded."),
      );
    } finally {
      setBusy(null);
    }
  }
  async function enrollTotp() {
    if (busy) return;
    setBusy("totp");
    setError(null);
    setMessage(null);
    setCode("");
    try {
      const result = await requireSupabase().auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator " + new Date().toISOString().slice(0, 16),
        issuer: "GCET Campus",
      });
      if (result.error) throw result.error;
      setChallenge({
        factorId: result.data.id,
        type: "totp",
        enrolling: true,
        qrCode: safeQrSource(result.data.totp.qr_code),
        secret: result.data.totp.secret,
      });
      await loadFactors();
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "We couldn't start authenticator setup. Remove an unfinished setup if one is listed, then retry.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }
  async function sendPhoneChallenge(state: Challenge) {
    if (!isPhoneMfaEnabled) throw new Error("SMS unavailable");
    const result = await requireSupabase().auth.mfa.challenge({
      factorId: state.factorId,
      channel: "sms",
    });
    if (result.error) throw result.error;
    const timestamp = Date.now();
    setNow(timestamp);
    setResendAt(timestamp + 60_000);
    setChallenge({
      ...state,
      challengeId: result.data.id,
      expiresAt: result.data.expires_at * 1000,
    });
    setCode("");
    setMessage(
      "Verification SMS requested. Enter the latest code sent to your enrolled phone.",
    );
  }
  async function enrollPhone(event: FormEvent) {
    event.preventDefault();
    if (busy || !isPhoneMfaEnabled || cooldown > 0) return;
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!isValidPhoneNumber(normalized)) {
      setError(
        "Enter a phone number with country code, for example +919876543210.",
      );
      return;
    }
    setBusy("phone");
    setError(null);
    setMessage(null);
    try {
      const result = await requireSupabase().auth.mfa.enroll({
        factorType: "phone",
        phone: normalized,
        friendlyName: "Phone ending " + normalized.slice(-4),
      });
      if (result.error) throw result.error;
      const state: Challenge = {
        factorId: result.data.id,
        type: "phone",
        enrolling: true,
        phone: normalized,
      };
      setChallenge(state);
      setCode("");
      await loadFactors();
      await sendPhoneChallenge(state);
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "SMS setup could not be completed. Check your number and try again. An authenticator app is also available.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }
  async function startVerification(factor: Factor) {
    if (
      busy ||
      (factor.factor_type !== "totp" && factor.factor_type !== "phone")
    )
      return;
    if (factor.factor_type === "phone" && !isPhoneMfaEnabled) {
      setError(
        "SMS verification is not enabled on this deployment. Use an authenticator app or contact the campus team.",
      );
      return;
    }
    if (factor.factor_type === "phone" && cooldown > 0) return;
    setBusy(factor.id);
    setError(null);
    setMessage(null);
    setCode("");
    const state: Challenge = {
      factorId: factor.id,
      type: factor.factor_type,
      enrolling: false,
    };
    setChallenge(state);
    try {
      if (factor.factor_type === "phone") await sendPhoneChallenge(state);
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "We couldn't send a verification SMS. Please retry.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }
  async function resendPhone() {
    if (!challenge || busy || cooldown > 0) return;
    setBusy("resend");
    setError(null);
    try {
      await sendPhoneChallenge(challenge);
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "The verification SMS could not be sent. Please try again.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!challenge || busy) return;
    if (!/^\d{6,10}$/.test(code)) {
      setError("Enter the complete verification code.");
      return;
    }
    if (
      challenge.type === "phone" &&
      (!challenge.challengeId || (challenge.expiresAt ?? 0) <= Date.now())
    ) {
      setError(
        "Request a new SMS code before continuing. The previous challenge has expired.",
      );
      return;
    }
    setBusy("verify");
    setError(null);
    setMessage(null);
    try {
      const client = requireSupabase();
      let challengeId = challenge.challengeId;
      if (challenge.type === "totp") {
        const result = await client.auth.mfa.challenge({
          factorId: challenge.factorId,
        });
        if (result.error) throw result.error;
        challengeId = result.data.id;
      }
      const result = await client.auth.mfa.verify({
        factorId: challenge.factorId,
        challengeId: challengeId!,
        code,
      });
      if (result.error) throw result.error;
      const enrolled = challenge.enrolling;
      setChallenge(null);
      setCode("");
      setPhone("");
      setMessage(
        enrolled
          ? "Verification method added. Your second step is verified for this session."
          : "Your second step is verified for this session.",
      );
      try {
        await loadFactors();
        await refreshProfile();
      } catch {
        setError(
          "Your code was verified, but account loading failed. Retry loading your account before continuing.",
        );
      }
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "We couldn't verify this code. Check the current code and try again.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }
  async function cancelChallenge() {
    if (!challenge || busy) return;
    setBusy("cancel");
    setError(null);
    try {
      if (challenge.enrolling) {
        const result = await requireSupabase().auth.mfa.unenroll({
          factorId: challenge.factorId,
        });
        if (result.error) throw result.error;
        await loadFactors();
      }
      setChallenge(null);
      setCode("");
      setMessage(null);
    } catch (cause) {
      setError(
        authErrorMessage(cause, "Setup could not be cancelled. Please retry."),
      );
    } finally {
      setBusy(null);
    }
  }
  async function remove() {
    if (!removeFactor || busy) return;
    if (
      isPrivileged &&
      removeFactor.status === "verified" &&
      verifiedFactors.length <= 1
    ) {
      setError(
        "Add and verify another method before removing your last verification method.",
      );
      setRemoveFactor(null);
      return;
    }
    setBusy("remove");
    setError(null);
    setMessage(null);
    try {
      const result = await requireSupabase().auth.mfa.unenroll({
        factorId: removeFactor.id,
      });
      if (result.error) throw result.error;
      setRemoveFactor(null);
      setMessage("Verification method removed.");
      try {
        await loadFactors();
        await refreshProfile();
      } catch {
        setError(
          "The method was removed, but account loading failed. Retry loading your account.",
        );
      }
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "This method could not be removed. Verify your second step and try again.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }

  const smsExpired =
    challenge?.type === "phone" &&
    Boolean(challenge.expiresAt) &&
    challenge.expiresAt! <= now;
  return (
    <section
      id="security"
      aria-labelledby="security-title"
      className="scroll-mt-6 rounded-2xl border bg-card p-6 sm:p-8"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="mt-1 h-6 w-6 shrink-0 text-teal-700 dark:text-teal-300"
          aria-hidden="true"
        />
        <div>
          <h2 id="security-title" className="text-xl font-semibold">
            Account security
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Your college email signs you in. A second verification step protects
            your campus account.
          </p>
        </div>
      </div>
      {needsMfa && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {isPrivileged
            ? "Your campus role requires a second verification step. Verify an existing method or set up an authenticator before opening management tools."
            : "You enabled an extra verification step. Verify a saved method to continue to your campus account."}
        </p>
      )}
      {mfaLevel === "aal2" && (
        <p className="mt-5 flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Second step
          verified for this session
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-100"
        >
          {error}
        </div>
      )}
      {message && (
        <p
          role="status"
          className="mt-5 text-sm text-teal-800 dark:text-teal-200"
        >
          {message}
        </p>
      )}
      {loading ? (
        <p role="status" className="mt-6 flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
          Loading verification methods…
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Your verification methods</h3>
            <Button
              variant="ghost"
              size="sm"
              disabled={Boolean(busy)}
              onClick={() => void refreshFactors()}
            >
              Refresh
            </Button>
          </div>
          {factors.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No verification methods added yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {factors.map((factor) => (
                <li
                  key={factor.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3">
                    {factor.factor_type === "phone" ? (
                      <Smartphone className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                    )}
                    <div>
                      <p className="break-words text-sm font-medium">
                        {factor.friendly_name ||
                          (factor.factor_type === "phone"
                            ? "SMS verification"
                            : "Authenticator app")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {factor.status === "verified"
                          ? "Ready to use"
                          : "Incomplete setup"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {factor.status === "verified" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          Boolean(busy) ||
                          Boolean(challenge) ||
                          (factor.factor_type === "phone" &&
                            (!isPhoneMfaEnabled || cooldown > 0))
                        }
                        onClick={() => void startVerification(factor)}
                      >
                        {factor.factor_type === "phone"
                          ? "Send SMS code"
                          : "Verify"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        "Remove " + (factor.friendly_name || factor.factor_type)
                      }
                      disabled={
                        Boolean(busy) ||
                        Boolean(challenge) ||
                        (factor.status === "verified" &&
                          (mfaLevel !== "aal2" ||
                            (isPrivileged && verifiedFactors.length <= 1)))
                      }
                      onClick={() => setRemoveFactor(factor)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {verifiedFactors.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Verify a saved method before removing it.
              {isPrivileged
                ? " Add and verify a replacement before removing your last method."
                : ""}
            </p>
          )}
          {challenge ? (
            <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50/50 p-5 dark:border-teal-900 dark:bg-teal-950/30">
              <h3 className="font-semibold">
                {challenge.enrolling
                  ? challenge.type === "totp"
                    ? "Set up your authenticator"
                    : "Verify your phone number"
                  : "Verify your second step"}
              </h3>
              {challenge.qrCode && (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Scan this QR code in your authenticator app, then enter its
                    current code.
                  </p>
                  <img
                    src={challenge.qrCode}
                    alt="QR code to add GCET Campus to your authenticator app"
                    className="my-4 h-48 w-48 rounded-lg bg-white p-3"
                  />
                  <details className="mb-4 text-sm">
                    <summary className="cursor-pointer font-medium">
                      Can't scan? Show setup key
                    </summary>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Enter this key manually in your authenticator app. Keep it
                      private.
                    </p>
                    <code className="mt-2 block break-all rounded border bg-background p-3 select-all">
                      {challenge.secret}
                    </code>
                  </details>
                </>
              )}
              {challenge.type === "phone" && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the SMS code
                  {challenge.phone
                    ? " sent to the number ending " + challenge.phone.slice(-4)
                    : " for your saved phone"}
                  . This number is a second factor; it does not replace college
                  email sign-in.
                </p>
              )}
              {challenge.type === "totp" && !challenge.enrolling && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Open your authenticator app and enter the current GCET Campus
                  code.
                </p>
              )}
              {smsExpired && (
                <p
                  role="status"
                  className="mt-3 text-sm text-amber-800 dark:text-amber-200"
                >
                  This SMS challenge has expired. Request a new code.
                </p>
              )}
              <form onSubmit={verify} className="mt-4 space-y-3">
                <label htmlFor="mfa-code" className="block text-sm font-medium">
                  Verification code
                </label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6,10}"
                  maxLength={10}
                  required
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, ""))
                  }
                  disabled={Boolean(busy)}
                  className="max-w-xs"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={
                      Boolean(busy) ||
                      (challenge.type === "phone" &&
                        (!challenge.challengeId || smsExpired))
                    }
                  >
                    {busy === "verify" ? "Verifying…" : "Verify code"}
                  </Button>
                  {challenge.type === "phone" && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        Boolean(busy) || cooldown > 0 || !isPhoneMfaEnabled
                      }
                      onClick={() => void resendPhone()}
                    >
                      {cooldown > 0
                        ? "Resend in " + cooldown + "s"
                        : "Send a new SMS code"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={Boolean(busy)}
                    onClick={() => void cancelChallenge()}
                  >
                    Cancel{challenge.enrolling ? " setup" : ""}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-5">
                <KeyRound
                  className="h-5 w-5 text-teal-700 dark:text-teal-300"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-semibold">Authenticator app</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Use an app such as Google Authenticator, Microsoft
                  Authenticator, or 1Password for your second step.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  disabled={Boolean(busy)}
                  onClick={() => void enrollTotp()}
                >
                  {busy === "totp" ? "Starting setup…" : "Add authenticator"}
                </Button>
              </div>
              <div className="rounded-xl border p-5">
                <Smartphone
                  className="h-5 w-5 text-teal-700 dark:text-teal-300"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-semibold">
                  SMS verification{" "}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </h3>
                {isPhoneMfaEnabled ? (
                  <form onSubmit={enrollPhone} className="mt-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Add and verify a phone number as a second factor.
                    </p>
                    <label
                      htmlFor="mfa-phone"
                      className="block text-sm font-medium"
                    >
                      Phone with country code
                    </label>
                    <Input
                      id="mfa-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+919876543210"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      maxLength={24}
                      required
                      disabled={Boolean(busy)}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={Boolean(busy) || cooldown > 0}
                    >
                      {busy === "phone"
                        ? "Requesting SMS…"
                        : cooldown > 0
                          ? "Send SMS in " + cooldown + "s"
                          : "Send verification SMS"}
                    </Button>
                  </form>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    SMS verification isn't available on this site yet. You can
                    add an authenticator app instead.
                  </p>
                )}
              </div>
            </div>
          )}
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Lost access to every verification method? Contact the campus team
            for account recovery. Signing in again with email does not bypass
            the second step for campus management.
          </p>
        </>
      )}
      <AlertDialog
        open={Boolean(removeFactor)}
        onOpenChange={(open) => {
          if (!open && !busy) setRemoveFactor(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove this verification method?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be able to use{" "}
              {removeFactor?.friendly_name || "this method"} to verify your
              account. Keep another working method if your campus role requires
              one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(busy)}
              onClick={() => setRemoveFactor(null)}
            >
              Keep method
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(busy)}
              onClick={() => void remove()}
            >
              {busy === "remove" ? "Removing…" : "Remove method"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
