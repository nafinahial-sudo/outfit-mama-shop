import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SocialLinks = {
  facebook: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  tiktok: string;
  youtube: string;
};

export function useSocialLinks() {
  return useQuery({
    queryKey: ["public_social"],
    queryFn: async (): Promise<SocialLinks> => {
      const { data } = await supabase.from("site_settings").select("key,value");
      const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
      return {
        facebook: map["social_facebook"] ?? "",
        whatsapp: map["social_whatsapp"] ?? "",
        phone: map["support_phone"] ?? "",
        instagram: map["social_instagram"] ?? "",
        tiktok: map["social_tiktok"] ?? "",
        youtube: map["social_youtube"] ?? "",
      };
    },
    staleTime: 60_000,
  });
}

export function waLink(value: string): string {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const digits = value.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function telLink(value: string): string {
  if (!value) return "";
  return `tel:${value.replace(/\s+/g, "")}`;
}
