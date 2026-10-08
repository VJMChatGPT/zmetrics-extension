import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { captureCampaignAttribution } from "@/lib/campaign-attribution";

export function CampaignAttribution() {
  const href = useLocation({ select: (location) => location.href });
  useEffect(() => {
    void captureCampaignAttribution();
  }, [href]);
  return null;
}
