"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, FolderKanban, Images, LayoutDashboard, Settings, Sparkles, X } from "lucide-react";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "My Projects", icon: FolderKanban },
  { href: "/media-library", label: "Media Library", icon: Images, soon: true },
  { href: "/ai-video-generator", label: "AI Video Generator", icon: Sparkles, soon: true },
  { href: "/settings", label: "Settings", icon: Settings, soon: true },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-sidebar transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-black">
              <Clapperboard className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-semibold leading-tight">
              Starlent
              <br />
              <span className="font-normal text-muted">AI Video Studio</span>
            </span>
          </div>
          <button className="md:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon, soon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-accent/10 text-accent" : "text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="flex-1">{label}</span>
                {soon && <span className="text-xs text-muted">Soon</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
