import { DyangHero } from "@/features/dyang/components/DyangHero";
import { DyangTimeline } from "@/features/dyang/components/DyangTimeline";
import { MOCK_DYANG_EVENTS } from "@/features/dyang/data/mockDyangEvents";

export default function DyangPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <DyangHero />

      <div className="mt-16">
        <h2 className="mb-10 text-center font-romantic text-2xl font-bold text-dyang-800 sm:text-3xl">
          우리의 순간들 💌
        </h2>
        <DyangTimeline events={MOCK_DYANG_EVENTS} />
      </div>
    </div>
  );
}
