export function safeSource(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.username || url.password) return null;
    return url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname))
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function sourceKind(
  value: string,
): "pdf" | "drive-file" | "drive-folder" | "external" {
  const safe = safeSource(value);
  if (!safe) return "external";
  const url = new URL(safe);
  if (url.hostname === "drive.google.com")
    return url.pathname.includes("/folders/") ? "drive-folder" : "drive-file";
  return /\.pdf$/i.test(url.pathname) ? "pdf" : "external";
}
export function drivePreview(value: string): string | null {
  const safe = safeSource(value);
  if (!safe) return null;
  const url = new URL(safe);
  if (url.hostname !== "drive.google.com" || url.pathname.includes("/folders/"))
    return null;
  const id =
    url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    url.searchParams.get("id");
  return id && /^[a-zA-Z0-9_-]+$/.test(id)
    ? `https://drive.google.com/file/d/${id}/preview`
    : null;
}
