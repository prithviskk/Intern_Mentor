"use client";

import { signOut } from "next-auth/react";

export default function UserSignOut() {
  return (
    <button
      className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-cyan-200/40 text-sm font-semibold text-white transition hover:bg-cyan-500/10"
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
