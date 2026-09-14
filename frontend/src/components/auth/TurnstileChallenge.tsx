import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { isTurnstileEnabled, turnstileSiteKey } from "@/lib/supabase";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "auto";
      size: "compact" | "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      "timeout-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    const timeout = window.setTimeout(() => fail(), 15_000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      scriptPromise = null;
      reject(new Error("Security check could not be loaded"));
    }
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function TurnstileChallenge({
  onToken,
  resetKey,
}: {
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<
    "loading" | "ready" | "verified" | "expired" | "error"
  >("loading");
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!isTurnstileEnabled) return;
    let active = true;
    let instance: string | null = null;
    callback.current(null);
    setStatus("loading");
    void loadTurnstile()
      .then((api) => {
        if (!active || !container.current) return;
        instance = api.render(container.current, {
          sitekey: turnstileSiteKey,
          theme: "auto",
          size: container.current.clientWidth < 300 ? "compact" : "flexible",
          callback: (token) => {
            if (active) {
              callback.current(token);
              setStatus("verified");
            }
          },
          "expired-callback": () => {
            if (active) {
              callback.current(null);
              setStatus("expired");
            }
          },
          "error-callback": () => {
            if (active) {
              callback.current(null);
              setStatus("error");
            }
          },
          "timeout-callback": () => {
            if (active) {
              callback.current(null);
              setStatus("expired");
            }
          },
        });
        widget.current = instance;
        setStatus((current) => (current === "verified" ? current : "ready"));
      })
      .catch(() => {
        if (active) {
          callback.current(null);
          setStatus("error");
        }
      });
    return () => {
      active = false;
      if (instance && window.turnstile) window.turnstile.remove(instance);
      widget.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    if (widget.current && window.turnstile) {
      callback.current(null);
      setStatus("ready");
      window.turnstile.reset(widget.current);
    }
  }, [resetKey]);

  if (!isTurnstileEnabled) return null;
  return (
    <div className="mt-5" aria-label="Sign-in security check">
      <div ref={container} />
      {status === "loading" && (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          Loading security check…
        </p>
      )}
      {status === "ready" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Complete the security check before requesting an email code.
        </p>
      )}
      {status === "expired" && (
        <p
          role="status"
          className="mt-2 text-xs text-amber-800 dark:text-amber-200"
        >
          The security check expired. Complete it again before requesting a
          code.
        </p>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="mt-2 text-sm text-red-800 dark:text-red-200"
        >
          <p>
            The security check could not load. Check your connection or retry.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry security check
          </Button>
        </div>
      )}
    </div>
  );
}
