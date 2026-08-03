import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Dices, CalendarDays, ListVideo, Heart, Swords, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    to: "/type-challenge",
    icon: Swords,
    title: "타입 챌린지 아카이브",
    description: "타입별로 정리된 챌린지 영상, 검색과 필터로 바로 찾기",
    accent: "from-brand-500 to-brand-700",
  },
  {
    to: "/roulette",
    icon: Dices,
    title: "포켓몬 룰렛",
    description: "스타팅, 벌칙, 타입까지 랜덤으로 결정하는 인터랙티브 도구",
    accent: "from-ember-400 to-ember-600",
  },
  {
    to: "/schedule",
    icon: CalendarDays,
    title: "방송 일정 & 공지",
    description: "다가오는 방송과 이벤트를 타임라인으로 한눈에",
    accent: "from-brand-400 to-brand-600",
  },
  {
    to: "/stream-log",
    icon: ListVideo,
    title: "다시보기 기록",
    description: "타임스탬프별 명대사와 명장면을 정리한 스토커 아카이브",
    accent: "from-slate-500 to-slate-700",
  },
  {
    to: "/dyang",
    icon: Heart,
    title: "댱 콜라보 아카이브",
    description: "썸타는 두 사람의 케미를 기록하는 특별한 공간",
    accent: "from-dyang-400 to-dyang-600",
  },
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="container-page relative py-20 text-center sm:py-28">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="badge mx-auto mb-5 bg-brand-100 text-brand-700"
          >
            비공식 팬 아카이브 · Fan-made
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl"
          >
            윤가놈의 모든 것,
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              한 곳에 정리했습니다.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-base text-slate-500 sm:text-lg"
          >
            타입 챌린지 아카이브부터 실시간 룰렛, 방송 일정, 다시보기 기록,
            그리고 댱과의 케미 아카이브까지 — 팬이 만든 가장 완성도 높은
            유틸리티 사이트.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/type-challenge" className="btn-primary">
              챌린지 아카이브 보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/roulette" className="btn-secondary">
              룰렛 돌려보기
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={cn(feature.to === "/dyang" && "sm:col-span-2 lg:col-span-1")}
              >
                <Link
                  to={feature.to}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <span
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                      feature.accent,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm text-slate-500">{feature.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                    바로가기 <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
