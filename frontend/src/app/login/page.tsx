"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const field = "mt-1.5 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-line bg-card p-6">
        <h1 className="text-xl font-semibold">Sign in to Starlent AI Video Studio</h1>
        {!isSupabaseConfigured() && (
          <p role="alert" className="text-sm text-red-400">Supabase is not configured. See frontend/.env.example.</p>
        )}
        <label className="block text-sm">
          Email
          <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={busy || !isSupabaseConfigured()} className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:brightness-110 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-muted">Accounts are created by an admin in Supabase. Public sign-up is off.</p>
      </form>
    </main>
  );
}
