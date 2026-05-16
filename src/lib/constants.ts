import jersey from "@/assets/cat-jersey.jpg";
import tshirt from "@/assets/cat-tshirt.jpg";
import shirt from "@/assets/cat-shirt.jpg";
import drop from "@/assets/cat-drop.jpg";

export const CATEGORIES = [
  { slug: "Jersey", label: "Jersey", image: jersey },
  { slug: "T-Shirts", label: "T-Shirts", image: tshirt },
  { slug: "Shirts", label: "Shirts", image: shirt },
  { slug: "Drop Shoulders", label: "Drop Shoulders", image: drop },
] as const;

export const CATEGORY_OPTIONS = [
  "Jersey",
  "T-Shirts",
  "Shirts",
  "Drop Shoulders",
  "Others",
] as const;

export const SOCIAL_KEYS = [
  { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "social_whatsapp", label: "WhatsApp", placeholder: "+8801XXXXXXXXX or wa.me link" },
  { key: "support_phone", label: "Support Mobile Number", placeholder: "+8801XXXXXXXXX" },
  { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "social_tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
] as const;
