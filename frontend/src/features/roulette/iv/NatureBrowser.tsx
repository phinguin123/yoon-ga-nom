import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeNature, isNeutralNature, NATURES, type Nature } from "./natures";

interface NatureBrowserProps {
  selectedId?: number;
  onSelect: (nature: Nature) => void;
  disabled?: boolean;
}

/** Searchable grid of all 25 Pokémon natures — lets you browse every nature's
 * stat effect and manually pick one instead of only rolling randomly. */
export function NatureBrowser({ selectedId, onSelect, disabled }: NatureBrowserProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NATURES;
    return NATURES.filter(
      (n) => n.nameKo.toLowerCase().includes(q) || n.nameEn.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-slate-700">
          성격 25종 전체 보기 <span className="text-slate-400">— 검색하고 직접 선택할 수도 있어요</span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-4">
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="성격 이름으로 검색 (예: 고집, Jolly)"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-400 focus:bg-white"
                />
              </div>

              <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                {filtered.map((n) => {
                  const active = n.id === selectedId;
                  const neutral = isNeutralNature(n);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(n)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-all disabled:opacity-50",
                        active
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[13px] font-bold",
                          active ? "text-brand-700" : "text-slate-700",
                        )}
                      >
                        {n.nameKo}
                      </span>
                      <span className={cn("text-[11px] font-medium", neutral ? "text-slate-400" : "text-slate-500")}>
                        {describeNature(n)}
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-slate-400">
                    일치하는 성격이 없어요.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
