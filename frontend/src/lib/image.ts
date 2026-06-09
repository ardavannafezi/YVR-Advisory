const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

export function resolveImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
}
