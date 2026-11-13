"use client";

import { useState } from "react";
import { projectsApi } from "@/lib/api";
import { VIDEO_TYPE_LABELS, type AspectRatio, type Project, type ProjectStatus, type VideoType } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1"];
const DEFAULT_RATIO: Record<VideoType, AspectRatio> = {
  youtube_long: "16:9",
  youtube_short: "9:16",
  instagram_reel: "9:16",
  tiktok: "9:16",
};
const field = "mt-1.5 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent";

export function ProjectDialog({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [videoType, setVideoType] = useState<VideoType>(project?.video_type ?? "youtube_short");
  const [ratio, setRatio] = useState<AspectRatio>(project?.aspect_ratio ?? "9:16");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const base = { title, description: description.trim() || null, video_type: videoType, aspect_ratio: ratio };
      if (project) await projectsApi.update(project.id, { ...base, status });
      else await projectsApi.create(base);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the project.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={project ? "Edit project" : "New project"}>
      <form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">{project ? "Edit project" : "New project"}</h2>
        <label className="block text-sm">
          Title
          <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} autoFocus />
        </label>
        <label className="block text-sm">
          Description
          <textarea className={field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Video type
            <select
              className={field}
              value={videoType}
              onChange={(e) => {
                const v = e.target.value as VideoType;
                setVideoType(v);
                setRatio(DEFAULT_RATIO[v]);
              }}
            >
              {(Object.keys(VIDEO_TYPE_LABELS) as VideoType[]).map((v) => (
                <option key={v} value={v}>{VIDEO_TYPE_LABELS[v]}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Aspect ratio
            <select className={field} value={ratio} onChange={(e) => setRatio(e.target.value as AspectRatio)}>
              {RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        {project && (
          <label className="block text-sm">
            Status
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
              {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:brightness-110 disabled:opacity-60">
            {saving ? "Saving…" : project ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}
