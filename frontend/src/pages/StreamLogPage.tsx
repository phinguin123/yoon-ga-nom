import { useState } from "react";
import { MOCK_STREAM_LOGS } from "@/features/stream-log/data/mockStreamLogs";
import { StreamLogCard } from "@/features/stream-log/components/StreamLogCard";
import { StreamLogTimeline } from "@/features/stream-log/components/StreamLogTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function StreamLogPage() {
  const [activeId, setActiveId] = useState(MOCK_STREAM_LOGS[0]?.id);
  const activeLog = MOCK_STREAM_LOGS.find((log) => log.id === activeId);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="The Archive"
        title="다시보기 기록 (스토커 아카이브)"
        description="놓친 방송의 명장면, 명대사, 타임스탬프까지 전부 기록해뒀어요. VOD 링크를 눌러 해당 구간으로 바로 이동할 수 있어요."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {MOCK_STREAM_LOGS.map((log) => (
            <StreamLogCard
              key={log.id}
              log={log}
              isActive={log.id === activeId}
              onClick={() => setActiveId(log.id)}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
          {activeLog ? (
            <StreamLogTimeline log={activeLog} />
          ) : (
            <p className="text-slate-400">왼쪽에서 방송을 선택해주세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
