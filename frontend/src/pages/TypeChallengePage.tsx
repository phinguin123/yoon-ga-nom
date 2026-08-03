import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PokemonType } from "@/types";
import { MOCK_TYPE_CHALLENGE_VIDEOS } from "@/features/type-challenge/data/mockVideos";
import { TypeFilterBar } from "@/features/type-challenge/components/TypeFilterBar";
import { VideoCard } from "@/features/type-challenge/components/VideoCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function TypeChallengePage() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);

  const toggleType = (type: PokemonType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filteredVideos = useMemo(() => {
    return MOCK_TYPE_CHALLENGE_VIDEOS.filter((video) => {
      const matchesSearch =
        search.trim().length === 0 ||
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesTypes =
        selectedTypes.length === 0 ||
        selectedTypes.every((type) => video.types.includes(type));

      return matchesSearch && matchesTypes;
    });
  }, [search, selectedTypes]);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Archive"
        title="포켓몬 타입 챌린지 아카이브"
        description="한 가지 타입으로만 체육관을 격파하는 그 영상들, 여기서 전부 찾아보세요. 타입별 필터와 검색으로 원하는 챌린지를 빠르게 찾을 수 있어요."
      />

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <TypeFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          onClear={() => setSelectedTypes([])}
        />
      </div>

      <p className="mt-6 text-sm font-medium text-slate-500">
        총 <span className="text-brand-600 font-bold">{filteredVideos.length}</span>개의 영상
      </p>

      {filteredVideos.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <p className="text-lg font-bold text-slate-700">조건에 맞는 영상이 없어요</p>
          <p className="mt-1 text-sm text-slate-400">검색어나 타입 필터를 조정해보세요.</p>
        </div>
      )}
    </div>
  );
}
