import axios from "axios";
import { api } from "@/lib/api";
import type { TypeChallengeVideo, Drip, ScheduleCategory, ScheduleEvent, Vod, VodCategory } from "@/types";

export type EpisodeInput = Omit<TypeChallengeVideo, "id">;
export type DripInput = Omit<
  Drip,
  "id" | "createdAt" | "publishedAt" | "thumbnailUrl" | "durationSeconds"
>;

/** `chzzkVideoId` accepts either a bare video number (e.g. "14487229") or a full `chzzk.naver.com/video/...` URL — normalized server-side. */
export interface VodInput {
  chzzkVideoId: string;
  categoryId: number | null;
}

/** A CHZZK VOD's live metadata, as previewed before/without saving — see `lookupChzzkVideo`. */
export interface ChzzkVideoPreview {
  videoNo: number;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  publishedAt: string;
  views: number;
}

export interface ChzzkChannelVideosPage {
  items: ChzzkVideoPreview[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export async function loginAdmin(password: string): Promise<void> {
  await api.post("/admin/auth/login", { password });
}

export async function logoutAdmin(): Promise<void> {
  await api.post("/admin/auth/logout");
}

export async function fetchAdminSession(): Promise<boolean> {
  try {
    await api.get("/admin/auth/me");
    return true;
  } catch {
    return false;
  }
}

export async function fetchAdminVideos(): Promise<TypeChallengeVideo[]> {
  const { data } = await api.get<{ data: TypeChallengeVideo[] }>("/admin/videos");
  return data.data;
}

export async function createAdminVideo(input: EpisodeInput): Promise<TypeChallengeVideo> {
  const { data } = await api.post<{ data: TypeChallengeVideo }>("/admin/videos", input);
  return data.data;
}

export async function updateAdminVideo(
  id: string,
  input: EpisodeInput,
): Promise<TypeChallengeVideo> {
  const { data } = await api.put<{ data: TypeChallengeVideo }>(`/admin/videos/${id}`, input);
  return data.data;
}

export async function deleteAdminVideo(id: string): Promise<void> {
  await api.delete(`/admin/videos/${id}`);
}

export async function fetchAdminDrips(): Promise<Drip[]> {
  const { data } = await api.get<{ data: Drip[] }>("/admin/drips");
  return data.data;
}

export async function createAdminDrip(input: DripInput): Promise<Drip> {
  const { data } = await api.post<{ data: Drip }>("/admin/drips", input);
  return data.data;
}

export async function updateAdminDrip(id: number, input: DripInput): Promise<Drip> {
  const { data } = await api.put<{ data: Drip }>(`/admin/drips/${id}`, input);
  return data.data;
}

export async function deleteAdminDrip(id: number): Promise<void> {
  await api.delete(`/admin/drips/${id}`);
}

export async function fetchAdminVodCategories(): Promise<VodCategory[]> {
  const { data } = await api.get<{ data: VodCategory[] }>("/admin/vod-categories");
  return data.data;
}

export async function createAdminVodCategory(name: string): Promise<VodCategory> {
  const { data } = await api.post<{ data: VodCategory }>("/admin/vod-categories", { name });
  return data.data;
}

export async function updateAdminVodCategory(id: number, name: string): Promise<VodCategory> {
  const { data } = await api.put<{ data: VodCategory }>(`/admin/vod-categories/${id}`, { name });
  return data.data;
}

export async function deleteAdminVodCategory(id: number): Promise<void> {
  await api.delete(`/admin/vod-categories/${id}`);
}

export async function fetchAdminVods(): Promise<Vod[]> {
  const { data } = await api.get<{ data: Vod[] }>("/admin/vods");
  return data.data;
}

export async function createAdminVod(input: VodInput): Promise<Vod> {
  const { data } = await api.post<{ data: Vod }>("/admin/vods", input);
  return data.data;
}

export async function updateAdminVod(id: number, input: VodInput): Promise<Vod> {
  const { data } = await api.put<{ data: Vod }>(`/admin/vods/${id}`, input);
  return data.data;
}

export async function refreshAdminVod(id: number): Promise<Vod> {
  const { data } = await api.post<{ data: Vod }>(`/admin/vods/${id}/refresh`);
  return data.data;
}

export async function deleteAdminVod(id: number): Promise<void> {
  await api.delete(`/admin/vods/${id}`);
}

/** Live preview of a CHZZK video's metadata, used by the admin form before saving — doesn't touch our database. */
export async function lookupChzzkVideo(query: string): Promise<ChzzkVideoPreview> {
  const { data } = await api.get<{ data: ChzzkVideoPreview }>("/admin/vods/lookup", {
    params: { query },
  });
  return data.data;
}

/** Powers the "치지직 채널에서 찾기" browser in the VOD admin form. */
export async function fetchChzzkChannelVideos(page: number, size = 12): Promise<ChzzkChannelVideosPage> {
  const { data } = await api.get<{ data: ChzzkChannelVideosPage }>("/admin/vods/channel-videos", {
    params: { page, size },
  });
  return data.data;
}

export interface ScheduleCategoryInput {
  name: string;
  color: string;
}

export interface ScheduleEventInput {
  title: string;
  description: string;
  categoryId: number | null;
  start: string;
  end: string | null;
  allDay: boolean;
  isPinned: boolean;
}

export async function fetchAdminScheduleCategories(): Promise<ScheduleCategory[]> {
  const { data } = await api.get<{ data: ScheduleCategory[] }>("/admin/schedule/categories");
  return data.data;
}

export async function createAdminScheduleCategory(input: ScheduleCategoryInput): Promise<ScheduleCategory> {
  const { data } = await api.post<{ data: ScheduleCategory }>("/admin/schedule/categories", input);
  return data.data;
}

export async function updateAdminScheduleCategory(
  id: number,
  input: ScheduleCategoryInput,
): Promise<ScheduleCategory> {
  const { data } = await api.put<{ data: ScheduleCategory }>(`/admin/schedule/categories/${id}`, input);
  return data.data;
}

export async function deleteAdminScheduleCategory(id: number): Promise<void> {
  await api.delete(`/admin/schedule/categories/${id}`);
}

export async function fetchAdminScheduleEvents(): Promise<ScheduleEvent[]> {
  const { data } = await api.get<{ data: ScheduleEvent[] }>("/admin/schedule/events");
  return data.data;
}

export async function createAdminScheduleEvent(input: ScheduleEventInput): Promise<ScheduleEvent> {
  const { data } = await api.post<{ data: ScheduleEvent }>("/admin/schedule/events", input);
  return data.data;
}

export async function updateAdminScheduleEvent(id: number, input: ScheduleEventInput): Promise<ScheduleEvent> {
  const { data } = await api.put<{ data: ScheduleEvent }>(`/admin/schedule/events/${id}`, input);
  return data.data;
}

export async function deleteAdminScheduleEvent(id: number): Promise<void> {
  await api.delete(`/admin/schedule/events/${id}`);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}
