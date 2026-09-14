const reloadKey = "gcet-chunk-reload-at";
const reloadCooldownMs = 60_000;

export function installPreloadRecovery() {
  window.addEventListener("vite:preloadError", (event) => {
    if (!navigator.onLine) return;

    try {
      const storage = window.sessionStorage;
      const previous = storage.getItem(reloadKey);
      const now = Date.now();
      const lastReload = Number(previous);
      if (
        previous !== null &&
        (!Number.isFinite(lastReload) || now - lastReload < reloadCooldownMs)
      ) {
        return;
      }

      // Persist before navigating, and keep the marker across successful loads.
      // If persistence is unavailable, leave the error to the manual retry UI.
      const marker = String(now);
      storage.setItem(reloadKey, marker);
      if (storage.getItem(reloadKey) !== marker) return;

      // Reload the current destination, including any query and fragment.
      window.location.reload();
      event.preventDefault();
    } catch {
      // Storage/reload restrictions must not hide the ErrorBoundary fallback.
    }
  });
}
