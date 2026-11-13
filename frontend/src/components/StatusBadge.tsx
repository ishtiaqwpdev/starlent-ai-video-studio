import { STATUS_LABELS, type ProjectStatus } from "@/lib/types";

const STYLES: Record<ProjectStatus, string> = {
  draft: "bg-white/5 text-muted border-line",
  in_progress: "bg-info/10 text-info border-info/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  failed: "bg-red-500/10 text-red-400 border-red-500/30",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
