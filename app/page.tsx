import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AuthPanel from "./ui/auth-panel";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = session.user.role ?? "user";
    redirect(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050510] via-[#0b0f2a] to-[#120b2d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="scatter-field">
          {Array.from({ length: 18 }).map((_, index) => (
            <span className="scatter-line" key={`scatter-${index}`} />
          ))}
          <span className="scatter-core" />
        </div>
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-6 py-12">
        <section className="z-20 flex min-h-[70vh] flex-col justify-center gap-6">
          <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/80">
            Intern Mentor 2026
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Perseverance is the quiet superpower behind every internship offer.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-cyan-100/70 sm:text-lg">
            The journey is a loop of rejections, revisions, and returns. You
            build stamina by showing up when progress is invisible, by shipping
            one more pull request, by practicing one more problem, and by
            keeping your focus when the pace feels unfair. This platform is
            built to hold the line with you.
          </p>
          <div className="mt-2 w-full sm:w-[320px]">
            <AuthPanel />
          </div>
        </section>
      </main>
    </div>
  );
}
