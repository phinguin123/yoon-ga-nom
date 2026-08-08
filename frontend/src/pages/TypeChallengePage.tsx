import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PokemonType } from "@/types";
import { useChallengeSeriesList } from "@/features/type-challenge/hooks/useChallengeSeries";
import { TypeFilterBar } from "@/features/type-challenge/components/TypeFilterBar";
import { SeriesCard } from "@/features/type-challenge/components/SeriesCard";
import { ChallengeRules } from "@/features/type-challenge/components/ChallengeRules";
import { GLOBAL_CHALLENGE_RULES } from "@/features/type-challenge/challengeRules";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";

export default function TypeChallengePage() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const { data: allSeries, isLoading, isError, refetch } = useChallengeSeriesList();

  const toggleType = (type: PokemonType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filteredSeries = useMemo(() => {
    if (!allSeries) return [];

    return allSeries
      .filter((series) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          q.length === 0 ||
          series.seriesTitle.toLowerCase().includes(q) ||
          series.episodes.some(
            (ep) =>
              ep.title.toLowerCase().includes(q) ||
              ep.tags.some((tag) => tag.toLowerCase().includes(q)),
          );

        // A video only ever has one type now, so selecting multiple type
        // chips is an OR (show any matching type), not an AND.
        const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(series.type);

        return matchesSearch && matchesTypes;
      })
      .sort((a, b) => (a.latestPublishedAt < b.latestPublishedAt ? 1 : -1));
  }, [allSeries, search, selectedTypes]);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Archive"
        title="포켓몬 타입 챌린지 아카이브"
        description="한 가지 타입으로만 체육관을 격파하는 챌린지 시리즈, 여기서 전부 찾아보세요. 타입을 클릭하면 해당 시리즈의 모든 영상을 번호순으로 볼 수 있어요."
      />

      <ChallengeRules rules={GLOBAL_CHALLENGE_RULES} className="mt-8" />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <TypeFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          onClear={() => setSelectedTypes([])}
        />
      </div>

      {isLoading && <LoadingState label="챌린지 시리즈를 불러오는 중..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <p className="mt-6 text-sm font-medium text-slate-500">
            총 <span className="text-brand-600 font-bold">{filteredSeries.length}</span>개의
            챌린지 시리즈
          </p>

          {filteredSeries.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSeries.map((series, i) => (
                <motion.div
                  key={series.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <SeriesCard series={series} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
              <p className="text-lg font-bold text-slate-700">조건에 맞는 시리즈가 없어요</p>
              <p className="mt-1 text-sm text-slate-400">검색어나 타입 필터를 조정해보세요.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
