import { Facebook, Instagram, Youtube, Phone, MessageCircle } from "lucide-react";
import { useSocialLinks, waLink, telLink } from "@/hooks/useSocialLinks";

// Simple TikTok glyph
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.6 6.5a5.7 5.7 0 0 1-3.4-1.1 5.6 5.6 0 0 1-2.2-3.9h-3v13.1a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V8.9a5.8 5.8 0 1 0 4.9 5.7V9.3a8.7 8.7 0 0 0 5.6 1.9V6.5z" />
    </svg>
  );
}

export function SocialBar({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { data } = useSocialLinks();
  if (!data) return null;
  const items: { href: string; icon: React.ReactNode; label: string }[] = [];
  if (data.facebook) items.push({ href: data.facebook, icon: <Facebook className="h-4 w-4" />, label: "Facebook" });
  if (data.instagram) items.push({ href: data.instagram, icon: <Instagram className="h-4 w-4" />, label: "Instagram" });
  if (data.tiktok) items.push({ href: data.tiktok, icon: <TikTokIcon className="h-4 w-4" />, label: "TikTok" });
  if (data.youtube) items.push({ href: data.youtube, icon: <Youtube className="h-4 w-4" />, label: "YouTube" });
  if (data.whatsapp) items.push({ href: waLink(data.whatsapp), icon: <MessageCircle className="h-4 w-4" />, label: "WhatsApp" });
  if (data.phone) items.push({ href: telLink(data.phone), icon: <Phone className="h-4 w-4" />, label: data.phone });

  if (!items.length) return null;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {items.map((i) => (
          <a key={i.label} href={i.href} target={i.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
            aria-label={i.label}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold">
            {i.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <a key={i.label} href={i.href} target={i.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-gold">
          {i.icon}
          <span>{i.label}</span>
        </a>
      ))}
    </div>
  );
}
