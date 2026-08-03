import axios from "axios";
import { api } from "@/lib/api";
import type { TypeChallengeVideo } from "@/types";

export type EpisodeInput = Omit<TypeChallengeVideo, "id">;

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

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}
