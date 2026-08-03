import type { TypeChallengeVideo } from "../types/index.js";
import { fetchYoutubeStats } from "../services/youtube.service.js";

/**
 * Curated catalog: which video belongs to which type/series/episode, and
 * whether the series is done — this classification can't come from
 * YouTube's API, so it's maintained here (swap for a real DB/CMS later).
 *
 * `title`, `thumbnailUrl`, `views`, `durationSeconds`, and `publishedAt`
 * below are placeholders only. `getAllVideos()` overwrites them with live
 * data from the YouTube Data API whenever `YOUTUBE_API_KEY` is configured
 * (see `services/youtube.service.ts`), so aggregates like total views and
 * latest upload date are always computed from real numbers, not guesses.
 */
const catalog: TypeChallengeVideo[] = [
  {
    id: "electric-1",
    seriesTitle: "전기타입 하트골드【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 1,
    title: "대장급 타입 : 전기타입 하트골드【포켓몬 모든타입 깨기】#1",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/f7d117/2b2400?text=Electric+%231",
    type: "electric",
    result: "clear",
    durationSeconds: 5423,
    publishedAt: "2026-04-19",
    views: 231000,
    tags: ["챌린지", "전기", "하트골드"],
  },
  {
    id: "electric-2",
    seriesTitle: "전기타입 하트골드【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 2,
    title: "약간 해적 룰렛 같은 방송 : 전기타입 하트골드【포켓몬 모든타입 깨기】#2",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/f7d117/2b2400?text=Electric+%232",
    type: "electric",
    result: "clear",
    durationSeconds: 4870,
    publishedAt: "2026-04-26",
    views: 198500,
    tags: ["챌린지", "전기", "하트골드"],
  },
  {
    id: "ghost-1",
    seriesTitle: "고스트타입 소울실버【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 1,
    title: "첫 관문부터 험난함 : 고스트타입 소울실버【포켓몬 모든타입 깨기】#1",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/735797/ffffff?text=Ghost+%231",
    type: "ghost",
    result: "clear",
    durationSeconds: 5011,
    publishedAt: "2026-06-05",
    views: 121000,
    tags: ["챌린지", "고스트", "소울실버"],
  },
  {
    id: "ghost-2",
    seriesTitle: "고스트타입 소울실버【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 2,
    title: "8체육관 최종 클리어 : 고스트타입 소울실버【포켓몬 모든타입 깨기】#2",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/735797/ffffff?text=Ghost+%232",
    type: "ghost",
    result: "clear",
    durationSeconds: 5820,
    publishedAt: "2026-06-19",
    views: 182000,
    tags: ["챌린지", "고스트", "소울실버", "풀클리어"],
  },
  {
    id: "fire-1",
    seriesTitle: "불꽃타입 루비【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 1,
    title: "물 체육관 상대로 도전 : 불꽃타입 루비【포켓몬 모든타입 깨기】#1",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/ee8130/ffffff?text=Fire+%231",
    type: "fire",
    result: "clear",
    durationSeconds: 3311,
    publishedAt: "2026-05-20",
    views: 97400,
    tags: ["챌린지", "불꽃", "루비"],
  },
  {
    id: "fire-2",
    seriesTitle: "불꽃타입 루비【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 2,
    title: "결국 여기서 멈췄습니다 : 불꽃타입 루비【포켓몬 모든타입 깨기】#2",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/ee8130/ffffff?text=Fire+%232",
    type: "fire",
    result: "fail",
    durationSeconds: 4103,
    publishedAt: "2026-05-27",
    views: 132100,
    tags: ["챌린지", "불꽃", "루비", "실패"],
  },
  {
    id: "ice-1",
    seriesTitle: "얼음타입 화이트【포켓몬 모든타입 깨기】",
    seriesStatus: "ongoing",
    episodeNumber: 1,
    title: "역대급 난이도 예고 : 얼음타입 화이트【포켓몬 모든타입 깨기】#1",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/96d9d6/1a1a1a?text=Ice+%231",
    type: "ice",
    result: "clear",
    durationSeconds: 4820,
    publishedAt: "2026-06-25",
    views: 64200,
    tags: ["챌린지", "얼음", "화이트"],
  },
  {
    id: "ice-2",
    seriesTitle: "얼음타입 화이트【포켓몬 모든타입 깨기】",
    seriesStatus: "ongoing",
    episodeNumber: 2,
    title: "챔피언로드 진입 : 얼음타입 화이트【포켓몬 모든타입 깨기】#2",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/96d9d6/1a1a1a?text=Ice+%232",
    type: "ice",
    result: "clear",
    durationSeconds: 5210,
    publishedAt: "2026-07-02",
    views: 58900,
    tags: ["챌린지", "얼음", "화이트"],
  },
  {
    id: "poison-1",
    seriesTitle: "독타입 에메랄드【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 1,
    title: "생각보다 강한 조합 : 독타입 에메랄드【포켓몬 모든타입 깨기】#1",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/a33ea1/ffffff?text=Poison+%231",
    type: "poison",
    result: "clear",
    durationSeconds: 4110,
    publishedAt: "2026-03-15",
    views: 55300,
    tags: ["챌린지", "독", "에메랄드"],
  },
  {
    id: "poison-2",
    seriesTitle: "독타입 에메랄드【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 2,
    title: "챌린지 완주, 소감은? : 독타입 에메랄드【포켓몬 모든타입 깨기】#2",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/a33ea1/ffffff?text=Poison+%232",
    type: "poison",
    result: "clear",
    durationSeconds: 4520,
    publishedAt: "2026-03-22",
    views: 61800,
    tags: ["챌린지", "독", "에메랄드", "풀클리어"],
  },
  {
    id: "steel-1",
    seriesTitle: "강철타입 화이트【포켓몬 모든타입 깨기】",
    seriesStatus: "completed",
    episodeNumber: 1,
    title: "원턴킬 모음.zip : 강철타입 화이트【포켓몬 모든타입 깨기】#1",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/b7b7ce/1a1a1a?text=Steel+%231",
    type: "steel",
    result: "clear",
    durationSeconds: 2870,
    publishedAt: "2026-02-14",
    views: 143000,
    tags: ["챌린지", "강철", "화이트", "하이라이트"],
  },
];

/**
 * Merges the curated catalog with live YouTube stats where available.
 * Video IDs are deduped before hitting the API, and results are cached
 * inside `fetchYoutubeStats` — safe to call on every request.
 */
export async function getAllVideos(): Promise<TypeChallengeVideo[]> {
  const liveStats = await fetchYoutubeStats(catalog.map((v) => v.youtubeId));

  return catalog.map((video) => {
    const live = liveStats.get(video.youtubeId);
    if (!live) return video;

    return {
      ...video,
      title: live.title || video.title,
      thumbnailUrl: live.thumbnailUrl || video.thumbnailUrl,
      publishedAt: live.publishedAt || video.publishedAt,
      views: live.views || video.views,
      durationSeconds: live.durationSeconds || video.durationSeconds,
    };
  });
}

export async function getVideoById(id: string): Promise<TypeChallengeVideo | undefined> {
  const videos = await getAllVideos();
  return videos.find((v) => v.id === id);
}
