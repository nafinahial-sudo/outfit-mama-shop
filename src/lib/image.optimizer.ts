/**
 * Optimizes an image URL on the fly using weserv CDN.
 * Standardizes to WebP format, resizes, and compresses to extremely lightweight file sizes.
 */
export function getOptimizedImageUrl(url: string, width = 800, quality = 75): string {
  if (!url) return "";
  
  // Only optimize Supabase storage URLs
  if (url.includes("supabase.co") || url.includes("supabase.in")) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&output=webp`;
  }
  
  return url;
}
