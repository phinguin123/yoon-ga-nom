import { motion } from "framer-motion";
import type { DyangEvent } from "@/types";
import { DYANG_EVENT_META } from "../dyangEventMeta";
import { cn } from "@/lib/utils";

interface DyangTimelineProps {
  events: DyangEvent[];
}

export function DyangTimeline({ events }: DyangTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-dyang-200 via-dyang-300 to-dyang-200 sm:block" />

      <div className="space-y-8">
        {sorted.map((event, i) => {
          const meta = DYANG_EVENT_META[event.type];
          const Icon = meta.icon;
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative flex flex-col sm:grid sm:grid-cols-2 sm:gap-8",
                isLeft ? "" : "",
              )}
            >
              <span className="absolute left-1/2 top-1 hidden h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-dyang-500 shadow sm:flex" />

              <div className={cn(isLeft ? "sm:col-start-1 sm:text-right" : "sm:col-start-2")}>
                <div className="rounded-2xl border border-dyang-200/70 bg-white/80 p-5 shadow-md shadow-dyang-200/40 backdrop-blur-sm">
                  <div className={cn("flex items-center gap-2", isLeft && "sm:flex-row-reverse")}>
                    <span className={cn("badge", meta.className)}>
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-xs font-medium text-dyang-400">
                      {new Date(event.date).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <h3 className="mt-2 font-romantic text-lg font-bold text-dyang-900">
                    {event.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-dyang-700/80">
                    {event.description}
                  </p>
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="mt-3 w-full rounded-xl border border-dyang-200 object-cover"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
