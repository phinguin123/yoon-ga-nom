import { Radio, Heart, PartyPopper, Megaphone } from "lucide-react";
import type { ScheduleEventType } from "@/types";

export const EVENT_TYPE_META: Record<
  ScheduleEventType,
  { label: string; icon: typeof Radio; className: string; dot: string }
> = {
  stream: { label: "방송", icon: Radio, className: "bg-brand-100 text-brand-700", dot: "bg-brand-500" },
  collab: { label: "콜라보", icon: Heart, className: "bg-dyang-100 text-dyang-700", dot: "bg-dyang-500" },
  event: { label: "이벤트", icon: PartyPopper, className: "bg-ember-400/20 text-ember-600", dot: "bg-ember-500" },
  notice: { label: "공지", icon: Megaphone, className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};
