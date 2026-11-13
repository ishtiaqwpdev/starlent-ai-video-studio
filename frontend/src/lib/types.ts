export type VideoType = "youtube_long" | "youtube_short" | "instagram_reel" | "tiktok";
export type AspectRatio = "16:9" | "9:16" | "1:1";
export type ProjectStatus = "draft" | "in_progress" | "completed" | "failed";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_type: VideoType;
  aspect_ratio: AspectRatio;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  title: string;
  description: string | null;
  video_type: VideoType;
  aspect_ratio: AspectRatio;
}

export const VIDEO_TYPE_LABELS: Record<VideoType, string> = {
  youtube_long: "YouTube long-form",
  youtube_short: "YouTube Short",
  instagram_reel: "Instagram Reel",
  tiktok: "TikTok",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
};
