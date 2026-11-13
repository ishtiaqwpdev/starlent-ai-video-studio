"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else {
        setEmail(data.session.user.email ?? null);
        setChecking(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [configured, router]);

  if (!configured) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md rounded-xl border border-line bg-card p-6">
          <h1 className="text-lg font-semibold">Supabase is not configured</h1>
          <p className="mt-2 text-sm text-muted">
            Copy <code>frontend/.env.example</code> to <code>frontend/.env.local</code>, fill in your Supabase URL and anon key, then restart the dev server.
          </p>
        </div>
      </main>
    );
  }
  if (checking) return <main className="grid min-h-screen place-items-center text-sm text-muted">Loading…</main>;

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line px-4 md:px-8">
          <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="hidden text-sm text-muted md:block">Starlent Solutions</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:block">{email}</span>
            <button
              onClick={() => getSupabase().auth.signOut()}
              className="flex items-center gap-1.5 text-muted hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
