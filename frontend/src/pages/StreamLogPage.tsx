import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { VodCard } from "@/features/vods/components/VodCard";
import { VodCategoryFilter } from "@/features/vods/components/VodCategoryFilter";
import { useVodCategories, useVods } from "@/features/vods/hooks/useVods";

export default function StreamLogPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { data: vods, isLoading, isError, refetch } = useVods();
  const { data: categories = [] } = useVodCategories();

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  const filteredVods = useMemo(() => {
    if (!vods) return [];
    if (selectedCategoryId === null) return vods;
    return vods.filter((vod) => vod.categoryId === selectedCategoryId);
  }, [vods, selectedCategoryId]);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="The Archive"
        title="다시보기"
        description="치지직에 올라온 방송 다시보기를 카테고리별로 모아봤어요. 영상을 클릭하면 치지직에서 바로 시청할 수 있어요."
      />

      {categories.length > 0 && (
        <div className="mt-8">
          <VodCategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>
      )}

      {isLoading && <LoadingState label="다시보기 목록을 불러오는 중..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <p className="mt-6 text-sm font-medium text-slate-500">
            총 <span className="font-bold text-brand-600">{filteredVods.length}</span>개의 다시보기
          </p>

          {filteredVods.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVods.map((vod, i) => (
                <motion.div
                  key={vod.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <VodCard vod={vod} categoryName={vod.categoryId ? categoryNameById.get(vod.categoryId) : undefined} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
              <p className="text-lg font-bold text-slate-700">아직 등록된 다시보기가 없어요</p>
              <p className="mt-1 text-sm text-slate-400">곧 새로운 다시보기가 추가될 예정이에요.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
