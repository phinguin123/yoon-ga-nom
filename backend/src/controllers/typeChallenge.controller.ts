import type { Request, Response } from "express";
import { getAllVideos, getVideoById } from "../data/typeChallengeVideos.js";
import { ok, NotFoundError } from "../lib/response.js";

export function listVideos(req: Request, res: Response) {
  const { type, search } = req.query;
  let videos = getAllVideos();

  if (typeof type === "string" && type.length > 0) {
    videos = videos.filter((v) => v.types.includes(type as (typeof v.types)[number]));
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

export function getVideo(req: Request, res: Response) {
  const video = getVideoById(req.params.id);
  if (!video) throw new NotFoundError(`영상을 찾을 수 없습니다: ${req.params.id}`);
  ok(res, video);
}
