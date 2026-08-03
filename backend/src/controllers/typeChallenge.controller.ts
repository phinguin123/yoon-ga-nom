import type { Request, Response } from "express";
import { getAllVideos, getVideoById } from "../data/typeChallengeVideos.js";
import { groupVideosBySeries } from "../lib/groupSeries.js";
import { ok, NotFoundError } from "../lib/response.js";

export async function listVideos(req: Request, res: Response) {
  const { type, search } = req.query;
  let videos = await getAllVideos();

  if (typeof type === "string" && type.length > 0) {
    videos = videos.filter((v) => v.type === type);
  }

  if (typeof search === "string" && search.length > 0) {
    const q = search.toLowerCase();
    videos = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  ok(res, videos);
}

export async function getVideo(req: Request, res: Response) {
  const video = await getVideoById(req.params.id);
  if (!video) throw new NotFoundError(`영상을 찾을 수 없습니다: ${req.params.id}`);
  ok(res, video);
}

/** Videos grouped into numbered series (e.g. "전기타입 하트골드" #1, #2, ...). */
export async function listSeries(req: Request, res: Response) {
  const { type, search } = req.query;
  let series = groupVideosBySeries(await getAllVideos());

  if (typeof type === "string" && type.length > 0) {
    series = series.filter((s) => s.type === type);
  }

  if (typeof search === "string" && search.length > 0) {
    const q = search.toLowerCase();
    series = series.filter(
      (s) =>
        s.seriesTitle.toLowerCase().includes(q) ||
        s.episodes.some(
          (ep) =>
            ep.title.toLowerCase().includes(q) ||
            ep.tags.some((tag) => tag.toLowerCase().includes(q)),
        ),
    );
  }

  ok(res, series);
}

export async function getSeries(req: Request, res: Response) {
  const series = groupVideosBySeries(await getAllVideos()).find((s) => s.key === req.params.key);
  if (!series) throw new NotFoundError(`시리즈를 찾을 수 없습니다: ${req.params.key}`);
  ok(res, series);
}
