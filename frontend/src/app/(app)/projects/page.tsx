"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { projectsApi } from "@/lib/api";
import { useProjects } from "@/components/useProjects";
import { ProjectDialog } from "@/components/ProjectDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { timeAgo } from "@/lib/format";
import { VIDEO_TYPE_LABELS, type Project } from "@/lib/types";

export default function ProjectsPage() {
  const { projects, error, reload } = useProjects();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    setActionError(null);
    try {
      await projectsApi.remove(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not delete the project.");
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">My Projects</h1>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black hover:brightness-110">
          <Plus className="h-4 w-4" aria-hidden /> New project
        </button>
      </div>

      {(error || actionError) && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error ?? actionError}</p>
      )}

      {projects === null ? (
        <p className="text-sm text-muted">Loading projects…</p>
      ) : projects.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-line bg-card px-6 py-16 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted">Create your first project to choose a format and start planning a video.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-col rounded-xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{p.title}</h2>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{p.description || "No description"}</p>
              <p className="mt-4 text-xs text-muted">{VIDEO_TYPE_LABELS[p.video_type]} · {p.aspect_ratio}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs text-muted">Updated {timeAgo(p.updated_at)}</span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} aria-label={`Edit ${p.title}`} className="rounded-md p-2 text-muted hover:bg-white/5 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`} className="rounded-md p-2 text-muted hover:bg-white/5 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <ProjectDialog
          project={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); reload(); }}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl border border-line bg-card p-6">
            <h2 className="text-lg font-semibold">Delete project?</h2>
            <p className="mt-2 text-sm text-muted">“{deleting.title}” will be permanently deleted.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white">Cancel</button>
              <button onClick={confirmDelete} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110">Delete project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
