import { useMemo, useState } from "react";
import type { DripSort, DripYearFilter } from "@/types";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { DripCard } from "@/features/doty/components/DripCard";
import { useDripYears, useDrips } from "@/features/doty/hooks/useDrips";

const SORT_OPTIONS: { value: DripSort; label: string }[] = [
  { value: "likes", label: "랭킹" },
  { value: "recent", label: "타임라인" },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function DotyPage() {
  const [sort, setSort] = useState<DripSort>("likes");
  const [year, setYear] = useState<DripYearFilter>(CURRENT_YEAR);
  const { data: availableYears } = useDripYears();
  const { data: drips, isLoading, isError, refetch } = useDrips(sort, year);

  const yearOptions = useMemo(() => {
    const years = new Set<number>(availableYears ?? []);
    years.add(CURRENT_YEAR);
    return Array.from(years).sort((a, b) => b - a);
  }, [availableYears]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-3xl px-5 pb-24">
        {/* Hero */}
        <div className="pb-8 pt-14 sm:pt-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73]">
            Drip of the Year
          </p>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] sm:text-[42px]">
            레전드 드립 🏆
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#6e6e73]">
            윤가놈 방송 역사를 관통하는 밈과 명언. 좋아요로 올해의 드립을 뽑아주세요.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setYear("all")}
              className="rounded-full px-3 py-1 text-[13px] font-medium transition-all duration-150"
              style={{
                background: year === "all" ? "#1d1d1f" : "rgba(0,0,0,0.05)",
                color: year === "all" ? "#f5f5f7" : "#6e6e73",
              }}
            >
              전체
            </button>
            {yearOptions.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className="rounded-full px-3 py-1 text-[13px] font-medium transition-all duration-150"
                style={{
                  background: year === y ? "#1d1d1f" : "rgba(0,0,0,0.05)",
                  color: year === y ? "#f5f5f7" : "#6e6e73",
                }}
              >
                {y}년
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-black/10" />

          <div className="flex rounded-full p-0.5" style={{ background: "rgba(0,0,0,0.05)" }}>
            {SORT_OPTIONS.map((option) => {
              const active = sort === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className="rounded-full px-3.5 py-1 text-[13px] font-medium transition-all duration-200"
                  style={{
                    background: active ? "white" : "transparent",
                    color: active ? "#1d1d1f" : "#86868b",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {!isLoading && drips && (
            <p className="ml-auto text-[12px] text-[#86868b]">
              총 <span className="font-semibold text-[#1d1d1f]">{drips.length}</span>개
            </p>
          )}
        </div>

        {/* Video cards */}
        {isLoading && <LoadingState label="레전드 드립을 불러오는 중..." />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && drips && (
          <>
            {drips.length > 0 ? (
              <div className="flex flex-col gap-4">
                {drips.map((drip, i) => (
                  <DripCard
                    key={drip.id}
                    drip={drip}
                    sort={sort}
                    year={year}
                    rank={i + 1}
                    showYear={year === "all"}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-24 text-center">
                <span className="text-3xl">🏆</span>
                <p className="mt-2 text-[15px] font-medium text-[#1d1d1f]">드립이 없어요</p>
                <p className="text-[13px] text-[#86868b]">다른 연도를 선택해 보세요</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
