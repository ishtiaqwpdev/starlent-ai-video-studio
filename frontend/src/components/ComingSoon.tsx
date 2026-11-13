import type { LucideIcon } from "lucide-react";

export function ComingSoon({ title, icon: Icon, description }: { title: string; icon: LucideIcon; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-line bg-card px-6 py-16 text-center">
        <Icon className="h-8 w-8 text-muted" aria-hidden />
        <p className="mt-4 font-medium">Coming soon</p>
        <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
