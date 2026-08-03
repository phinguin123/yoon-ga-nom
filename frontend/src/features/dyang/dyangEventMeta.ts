import { Heart, MessageCircleHeart, Star, Video } from "lucide-react";
import type { DyangEventType } from "@/types";

export const DYANG_EVENT_META: Record<
  DyangEventType,
  { label: string; icon: typeof Heart; className: string }
> = {
  "collab-stream": { label: "콜라보 방송", icon: Video, className: "bg-dyang-100 text-dyang-700" },
  "sns-interaction": { label: "SNS 훈훈함", icon: MessageCircleHeart, className: "bg-dyang-100 text-dyang-700" },
  milestone: { label: "마일스톤", icon: Star, className: "bg-dyang-200 text-dyang-800" },
  "cute-moment": { label: "심쿵 모먼트", icon: Heart, className: "bg-dyang-100 text-dyang-700" },
};
