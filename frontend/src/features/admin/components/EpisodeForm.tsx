import { useState, type FormEvent } from "react";
import { ALL_POKEMON_TYPES, POKEMON_TYPE_META } from "@/features/type-challenge/pokemonTypeMeta";
import { cn } from "@/lib/utils";
import type { ChallengeStatus, PokemonType, TypeChallengeVideo } from "@/types";
import type { EpisodeInput } from "../api";
import { TagInput } from "./TagInput";

interface EpisodeFormProps {
  initial?: TypeChallengeVideo;
  onSubmit: (input: EpisodeInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function secondsToParts(total: number) {
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClassName = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400";

export function EpisodeForm({ initial, onSubmit, onCancel, isSubmitting }: EpisodeFormProps) {
  const [type, setType] = useState<PokemonType>(initial?.type ?? "electric");
  const [seriesTitle, setSeriesTitle] = useState(initial?.seriesTitle ?? "");
  const [seriesStatus, setSeriesStatus] = useState<ChallengeStatus>(initial?.seriesStatus ?? "ongoing");
  const [episodeNumber, setEpisodeNumber] = useState(initial?.episodeNumber ?? 1);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [youtubeId, setYoutubeId] = useState(initial?.youtubeId ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [result, setResult] = useState<"clear" | "in-progress">(initial?.result ?? "in-progress");
  const initialDuration = secondsToParts(initial?.durationSeconds ?? 0);
  const [minutes, setMinutes] = useState(initialDuration.minutes);
  const [seconds, setSeconds] = useState(initialDuration.seconds);
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [views, setViews] = useState(initial?.views ?? 0);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (event: FormEvent) => {
    console.log("Inside handleSubmit");
    console.log("seriesTitle", seriesTitle);
    console.log("seriesStatus", seriesStatus);
    console.log("episodeNumber", episodeNumber);
    console.log("title", title);
    console.log("youtubeId", youtubeId);
    console.log("thumbnailUrl", thumbnailUrl);
    console.log("result", result);
    console.log("durationSeconds", minutes * 60 + seconds);
    console.log("publishedAt", publishedAt);
    console.log("views", views);
    event.preventDefault();

    const fallbackThumbnail = `https://placehold.co/640x360/${POKEMON_TYPE_META[type].color.replace(
      "#",
      "",
    )}/ffffff?text=${encodeURIComponent(POKEMON_TYPE_META[type].label)}`;

    onSubmit({
      type,
      seriesTitle,
      seriesStatus,
      episodeNumber,
      title,
      youtubeId: youtubeId.trim(),
      thumbnailUrl: thumbnailUrl.trim() || fallbackThumbnail,
      result,
      durationSeconds: minutes * 60 + seconds,
      publishedAt,
      views,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className={labelClassName}>포켓몬 타입</label>
        <div className="flex flex-wrap gap-2">
          {ALL_POKEMON_TYPES.map((pokemonType) => {
            const meta = POKEMON_TYPE_META[pokemonType];
            const isSelected = type === pokemonType;
            return (
              <button
                key={pokemonType}
                type="button"
                onClick={() => setType(pokemonType)}
                style={isSelected ? { backgroundColor: meta.color, borderColor: meta.color } : undefined}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                  isSelected
                    ? "text-white shadow-md"
                    : "border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClassName}>시리즈 제목</label>
          <input
            value={seriesTitle}
            onChange={(event) => setSeriesTitle(event.target.value)}
            required
            placeholder="예: 전기타입 하트골드【포켓몬 모든타입 깨기】"
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>시리즈 상태</label>
          <select
            value={seriesStatus}
            onChange={(event) => setSeriesStatus(event.target.value as ChallengeStatus)}
            className={inputClassName}
          >
            <option value="ongoing">진행중</option>
            <option value="completed">완료</option>
          </select>
        </div>

        <div>
          <label className={labelClassName}>에피소드 번호</label>
          <input
            type="number"
            min={1}
            value={episodeNumber}
            onChange={(event) => setEpisodeNumber(Number(event.target.value))}
            required
            className={inputClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName}>영상 제목</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="예: 대장급 타입 : 전기타입 하트골드【포켓몬 모든타입 깨기】#1"
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>유튜브 영상 ID</label>
          <input
            value={youtubeId}
            onChange={(event) => setYoutubeId(event.target.value)}
            required
            placeholder="watch?v= 뒤의 값"
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>결과</label>
          <select
            value={result}
            onChange={(event) => setResult(event.target.value as "clear" | "in-progress")}
            className={inputClassName}
          >
            <option value="in-progress">진행중</option>
            <option value="clear">클리어</option>
          </select>
        </div>

        <div>
          <label className={labelClassName}>업로드 날짜</label>
          <input
            type="date"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>영상 길이</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className={inputClassName}
            />
            <span className="shrink-0 text-sm text-slate-400">분</span>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(event) => setSeconds(Number(event.target.value))}
              className={inputClassName}
            />
            <span className="shrink-0 text-sm text-slate-400">초</span>
          </div>
        </div>

        <div>
          <label className={labelClassName}>
            조회수 <span className="font-normal normal-case text-slate-400">(유튜브 연동 시 자동 갱신)</span>
          </label>
          <input
            type="number"
            min={0}
            value={views}
            onChange={(event) => setViews(Number(event.target.value))}
            className={inputClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName}>
            썸네일 URL <span className="font-normal normal-case text-slate-400">(비워두면 자동 생성)</span>
          </label>
          <input
            value={thumbnailUrl}
            onChange={(event) => setThumbnailUrl(event.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName}>태그</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          취소
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "저장 중..." : initial ? "수정 저장" : "영상 추가"}
        </button>
      </div>
    </form>
  );
}
