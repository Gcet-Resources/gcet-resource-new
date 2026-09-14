import { useCatalog } from "@/context/CatalogProvider";
export function CatalogStatus() {
  const { loading, error, refresh } = useCatalog();
  return loading ? (
    <p role="status" className="py-10 text-center">
      Loading your resource library…
    </p>
  ) : error ? (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 p-6 text-center"
    >
      <p>We couldn't load the resource library.</p>
      <p className="text-sm text-muted-foreground">{error}</p>
      <button className="mt-3 underline" onClick={() => void refresh()}>
        Try again
      </button>
    </div>
  ) : null;
}
