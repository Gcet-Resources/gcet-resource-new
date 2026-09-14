import { useEffect, useRef, useState, type FormEvent } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/Seo";
import { TurnstileChallenge } from "@/components/auth/TurnstileChallenge";
import { useAuth } from "@/context/AuthProvider";
import {
  authErrorMessage,
  isAllowedDomain,
  normalizeEmail,
  safeReturnPath,
} from "@/lib/auth-policy";
import {
  isSupabaseConfigured,
  isTurnstileEnabled,
  requireSupabase,
} from "@/lib/supabase";

export default function Login() {
  const auth = useAuth();
  const { refreshProfile } = auth;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCallbackPage = pathname === "/auth/callback";
  const [params] = useSearchParams();
  const returnTo = safeReturnPath(params.get("next"));
  const [callback] = useState(() => ({
    tokenHash: params.get("token_hash"),
    type: params.get("type"),
  }));
  const [callbackPending, setCallbackPending] = useState(
    Boolean(callback.tokenHash),
  );
  const callbackPromise = useRef<Promise<void> | null>(null);
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(() =>
    params.has("error") || params.has("error_code")
      ? "This sign-in link is invalid or has expired. Request a fresh email code below."
      : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const cooldown = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  useEffect(() => {
    if (auth.loading || auth.error || !auth.user || callbackPending) return;
    const needsAccount =
      !auth.profile || auth.membership?.status !== "active" || auth.needsMfa;
    navigate(
      needsAccount
        ? `/account?next=${encodeURIComponent(returnTo)}${auth.needsMfa ? "#security" : ""}`
        : returnTo,
      { replace: true },
    );
  }, [
    auth.loading,
    auth.error,
    auth.user,
    auth.profile,
    auth.membership,
    auth.needsMfa,
    navigate,
    returnTo,
    callbackPending,
  ]);

  useEffect(() => {
    if (!callback.tokenHash || !isSupabaseConfigured) {
      setCallbackPending(false);
      return;
    }
    let active = true;
    if (!callbackPromise.current) {
      // Remove the one-time token from the address bar/history before starting verification.
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token_hash");
      cleanUrl.searchParams.delete("type");
      window.history.replaceState(
        window.history.state,
        "",
        cleanUrl.pathname + cleanUrl.search,
      );
      callbackPromise.current = (async () => {
        if (
          !callback.type ||
          !["email", "invite", "recovery", "email_change", "signup"].includes(
            callback.type,
          )
        )
          throw new Error("Invalid callback type");
        const result = await requireSupabase().auth.verifyOtp({
          token_hash: callback.tokenHash!,
          type: callback.type as EmailOtpType,
        });
        if (result.error) throw result.error;
        if (!result.data.session) throw new Error("No verified session");
      })();
    }
    void callbackPromise.current
      .then(async () => {
        if (active) await refreshProfile();
      })
      .catch((cause) => {
        if (active)
          setError(
            authErrorMessage(
              cause,
              "This sign-in link could not be verified. Request a fresh email code below.",
            ),
          );
      })
      .finally(() => {
        if (active) setCallbackPending(false);
      });
    return () => {
      active = false;
    };
  }, [callback, refreshProfile]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    if (busy || cooldown > 0) return;
    const address = normalizeEmail(sentEmail || email);
    if (!isAllowedDomain(address)) {
      setError(
        "Use your @galgotiacollege.edu email. Personal and other college email addresses cannot register.",
      );
      return;
    }
    if (isTurnstileEnabled && !captchaToken) {
      setError("Complete the security check before requesting a code.");
      return;
    }
    setBusy("send");
    setError(null);
    setMessage(null);
    try {
      const result = await requireSupabase().auth.signInWithOtp({
        email: address,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...(captchaToken ? { captchaToken } : {}),
        },
      });
      if (result.error) throw result.error;
      setSentEmail(address);
      setEmail(address);
      setCode("");
      const timestamp = Date.now();
      setNow(timestamp);
      setResendAt(timestamp + 60_000);
      setMessage(
        "Code requested. Check your college inbox and spam folder for the latest email.",
      );
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "We couldn't send a sign-in code. Please try again or contact the campus team.",
        ),
      );
    } finally {
      setBusy(null);
      setCaptchaToken(null);
      setCaptchaReset((value) => value + 1);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!/^\d{6,10}$/.test(code)) {
      setError("Enter the complete numeric code from your latest email.");
      return;
    }
    setBusy("verify");
    setError(null);
    setMessage(null);
    try {
      const result = await requireSupabase().auth.verifyOtp({
        email: sentEmail,
        token: code,
        type: "email",
      });
      if (result.error) throw result.error;
      if (!result.data.session) throw new Error("No session returned");
      setMessage("Email verified. Loading your campus account…");
      await auth.refreshProfile();
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "We couldn't verify this code. Try your latest code or request a new one.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Seo
        title={isCallbackPage ? "Verify your sign-in" : "Sign in"}
        description="Sign in with your college email to access your GCET campus account."
        path={isCallbackPage ? "/auth/callback" : "/login"}
        noIndex
      />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6" aria-hidden="true" /> GCET Campus
        </Link>
        <Link
          to="/year-selection"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Browse resources{" "}
          <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
        </Link>
      </header>
      <main
        id="main-content"
        className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:gap-16 md:py-24"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Your campus, connected
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One college email.
            <br />
            Your campus account.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Save your subjects, follow campus updates, and find the things that
            matter to your year.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <BookOpen
                className="h-5 w-5 text-teal-700 dark:text-teal-300"
                aria-hidden="true"
              />{" "}
              Your resources, ready across devices
            </li>
            <li className="flex items-center gap-3">
              <Mail
                className="h-5 w-5 text-teal-700 dark:text-teal-300"
                aria-hidden="true"
              />{" "}
              Verified college accounts for students and staff
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck
                className="h-5 w-5 text-teal-700 dark:text-teal-300"
                aria-hidden="true"
              />{" "}
              Extra verification for campus management
            </li>
          </ul>
        </div>
        <section
          aria-labelledby="sign-in-title"
          className="rounded-3xl border bg-card p-6 shadow-sm sm:p-9"
        >
          <div className="mb-6 inline-flex rounded-2xl bg-teal-50 p-3 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
            <Mail aria-hidden="true" />
          </div>
          <h2
            id="sign-in-title"
            className="text-2xl font-semibold tracking-tight"
          >
            {sentEmail
              ? "Check your college email"
              : "Sign in or create an account"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {sentEmail ? (
              <>
                Enter the code sent to{" "}
                <strong className="break-all text-foreground">
                  {sentEmail}
                </strong>
                .
              </>
            ) : (
              "We'll send you a one-time email code. You don't need a password."
            )}
          </p>
          {!isSupabaseConfigured ? (
            <div
              role="status"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
            >
              Campus accounts are not available on this deployment yet. Public
              resources are ready to explore.
            </div>
          ) : auth.loading || callbackPending ? (
            <p role="status" className="mt-8 flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
              {callbackPending
                ? "Verifying your sign-in link…"
                : "Checking your session…"}
            </p>
          ) : (
            <>
              {(error || auth.error) && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
                >
                  {error || auth.error}
                  {auth.error && auth.user && (
                    <Button
                      className="mt-3"
                      variant="outline"
                      onClick={() => void auth.refreshProfile().catch(() => {})}
                    >
                      Retry account loading
                    </Button>
                  )}
                </div>
              )}
              {message && (
                <p
                  role="status"
                  className="mt-5 flex gap-2 text-sm text-teal-800 dark:text-teal-200"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  {message}
                </p>
              )}
              <TurnstileChallenge
                onToken={setCaptchaToken}
                resetKey={captchaReset}
              />
              {!sentEmail ? (
                <form onSubmit={sendCode} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="college-email"
                      className="mb-2 block text-sm font-medium"
                    >
                      College email
                    </label>
                    <Input
                      id="college-email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      maxLength={254}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@galgotiacollege.edu"
                      aria-describedby="college-email-help"
                      disabled={Boolean(busy)}
                      className="h-12"
                    />
                    <p
                      id="college-email-help"
                      className="mt-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      Only @galgotiacollege.edu email addresses are eligible.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="h-12 w-full"
                    disabled={
                      Boolean(busy) ||
                      cooldown > 0 ||
                      (isTurnstileEnabled && !captchaToken)
                    }
                  >
                    {busy === "send" ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" />{" "}
                        Requesting code…
                      </>
                    ) : cooldown > 0 ? (
                      `Try again in ${cooldown}s`
                    ) : (
                      <>
                        Send email code <ArrowRight aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="email-code"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email verification code
                    </label>
                    <Input
                      id="email-code"
                      autoFocus
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
                      placeholder="Enter your code"
                      disabled={Boolean(busy)}
                      className="h-12 text-center text-lg tracking-[0.25em]"
                      aria-describedby="code-help"
                    />
                    <p
                      id="code-help"
                      className="mt-2 text-xs text-muted-foreground"
                    >
                      Use the latest code. Expired or already-used codes won't
                      work.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="h-12 w-full"
                    disabled={Boolean(busy)}
                  >
                    {busy === "verify" ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" />{" "}
                        Verifying…
                      </>
                    ) : (
                      "Verify and continue"
                    )}
                  </Button>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={Boolean(busy)}
                      onClick={() => {
                        setSentEmail("");
                        setCode("");
                        setError(null);
                        setMessage(null);
                      }}
                    >
                      <ArrowLeft aria-hidden="true" /> Change email
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={
                        Boolean(busy) ||
                        cooldown > 0 ||
                        (isTurnstileEnabled && !captchaToken)
                      }
                      onClick={() => void sendCode()}
                    >
                      {busy === "send"
                        ? "Requesting…"
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "Resend code"}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
          <p className="mt-7 border-t pt-5 text-xs leading-relaxed text-muted-foreground">
            Student access follows email verification and profile setup. Staff
            and other campus roles are assigned by an administrator.
          </p>
        </section>
      </main>
    </div>
  );
}
