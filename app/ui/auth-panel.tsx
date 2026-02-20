"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthPanelProps = {
  autoRedirect?: boolean;
};

export default function AuthPanel({ autoRedirect = true }: AuthPanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!autoRedirect) return;
    if (status !== "authenticated") return;
    const role = session?.user?.role ?? "user";
    router.replace(role === "admin" ? "/admin" : "/dashboard");
  }, [autoRedirect, router, session?.user?.role, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <p className="text-sm text-indigo-100/70">Checking session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Not signed in</h2>
          <p className="mt-1 text-sm text-cyan-100/70">
            Use Google to continue.
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/90 via-indigo-400/90 to-fuchsia-500/90 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.55)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          onClick={() => signIn("google")}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Welcome, {session.user?.name ?? "User"}
        </h2>
        <p className="mt-1 text-sm text-cyan-100/70">
          {session.user?.email} · Role:{" "}
          <span className="font-semibold text-white">
            {session.user?.role ?? "user"}
          </span>
        </p>
      </div>
      <button
        className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-200/40 px-6 text-sm font-semibold text-white transition hover:bg-cyan-500/10"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    </div>
  );
}
