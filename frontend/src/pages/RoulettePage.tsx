import { useState } from "react";
import { Dices, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { PokemonRoulette } from "@/features/roulette/pokemon/PokemonRoulette";
import { IvRoulette } from "@/features/roulette/iv/IvRoulette";

const TABS = [
  { id: "pokemon", label: "포켓몬 룰렛", icon: Dices },
  { id: "iv", label: "개체값 룰렛", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function RoulettePage() {
  const [tab, setTab] = useState<TabId>("pokemon");

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        title="룰렛"
        description="스타팅, 다음 상대 포켓몬, 개체값까지! 방송 중 실시간으로 돌려보세요."
        align="center"
      />

      <div className="mx-auto mt-8 flex w-fit gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all",
              tab === id ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        {tab === "pokemon" ? <PokemonRoulette /> : <IvRoulette />}
      </div>
    </div>
  );
}
