"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useProjects } from "@/components/useProjects";
import { ProjectDialog } from "@/components/ProjectDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { timeAgo } from "@/lib/format";
import { VIDEO_TYPE_LABELS, type ProjectStatus } from "@/lib/types";

export default function DashboardPage() {
  const { projects, error, reload } = useProjects();
  const [creating, setCreating] = useState(false);

  const count = (s: ProjectStatus) => projects?.filter((p) => p.status === s).length ?? 0;
  const stats = [
    { label: "Total projects", value: projects?.length ?? 0 },
    { label: "In progress", value: count("in_progress") },
    { label: "Completed", value: count("completed") },
    { label: "Failed", value: count("failed") },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black hover:brightness-110">
          <Plus className="h-4 w-4" aria-hidden /> New project
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-card p-5">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-2 text-3xl font-semibold">{projects === null ? "–" : s.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Recent projects</h2>
          <Link href="/projects" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        <div className="rounded-xl border border-line bg-card">
          {projects === null ? (
            <p className="p-6 text-sm text-muted">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="p-6 text-sm text-muted">No projects yet. Create one to get started.</p>
          ) : (
            <ul className="divide-y divide-line">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-sm text-muted">{VIDEO_TYPE_LABELS[p.video_type]} · {p.aspect_ratio} · updated {timeAgo(p.updated_at)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {creating && (
        <ProjectDialog project={null} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); reload(); }} />
      )}
    </div>
  );
}
