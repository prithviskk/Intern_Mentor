import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { getProfileByEmail } from "@/lib/profiles";
import { deleteSubmissionAction, saveProfileAction } from "./actions";
import BirthdayPopper from "./birthday-popper";
import { listDriveFiles } from "@/lib/drive";
import { createCheckin, listCheckins } from "@/lib/checkins";
import { listSubmissionsByEmail } from "@/lib/submissions";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import UserNav from "./user-nav";
import CoinReward from "./coin-reward";
import SubmissionForm from "./submission-form";
import UserSignOut from "./user-signout";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  const tasks = await listTasks();
  const email = session?.user?.email ?? null;
  const profile = email ? await getProfileByEmail(email) : null;
  const driveUrl = process.env.GOOGLE_DRIVE_MATERIALS_URL ?? "";
  const driveFiles = await listDriveFiles();
  let checkins = email ? await listCheckins(email) : [];
  const submissions = email ? await listSubmissionsByEmail(email) : [];
  const leetCodeStats = profile?.leetcode_id
    ? await fetchLeetCodeStats(profile.leetcode_id)
    : null;

  const today = new Date().toISOString().slice(0, 10);
  const hasCheckedInToday = checkins.some(
    (checkin) => checkin.checkin_date === today
  );

  if (email && !hasCheckedInToday) {
    await createCheckin(email, today);
    checkins = await listCheckins(email);
  }

  const streakDays = (() => {
    const uniqueDates = Array.from(
      new Set(checkins.map((checkin) => checkin.checkin_date))
    ).sort((a, b) => (a > b ? -1 : 1));
    let streak = 0;
    let cursor = new Date(today);
    for (const date of uniqueDates) {
      const cursorString = cursor.toISOString().slice(0, 10);
      if (date !== cursorString) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  })();

  const badges = [10, 20, 30, 40].map((milestone) => ({
    milestone,
    earned: streakDays >= milestone,
  }));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#050510] via-[#0b0f2a] to-[#120b2d] px-6 py-16 text-white">
      <BirthdayPopper
        dateOfBirth={profile?.date_of_birth}
        name={session?.user?.name ?? null}
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
            User Dashboard
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Welcome back, {session?.user?.name ?? "User"}.
          </h1>
          <p className="text-sm text-cyan-100/70">
            Track assignments, materials, and performance insights.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside className="h-fit rounded-2xl border border-cyan-200/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Dashboard
            </p>
            <UserNav />
          </aside>

          <section className="grid gap-6">
            <section
              id="overview"
              className="grid gap-4 rounded-3xl border border-cyan-200/10 bg-white/5 p-6"
            >
              <h2 className="text-lg font-semibold">Overview</h2>
              <p className="text-sm text-cyan-100/70">
                Quick access to your check-ins, tasks, materials, and stats.
              </p>
            </section>

            {!profile && (
              <section className="grid gap-4 rounded-3xl border border-cyan-200/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold">
                  Complete your profile
                </h2>
                <p className="text-sm text-cyan-100/70">
                  Add your place and date of birth so we can personalize your
                  experience.
                </p>
                <form className="grid gap-4" action={saveProfileAction}>
                  <input
                    className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
                    name="place"
                    placeholder="Place (e.g., Bengaluru)"
                    required
                  />
                  <input
                    className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
                    name="date_of_birth"
                    type="date"
                    required
                  />
                  <input
                    className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
                    name="leetcode_id"
                    placeholder="LeetCode ID"
                    required
                  />
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/90 via-indigo-400/90 to-fuchsia-500/90 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.55)] transition hover:brightness-110"
                    type="submit"
                  >
                    Save profile
                  </button>
                </form>
              </section>
            )}

            <section
              id="tasks"
              className="grid gap-4 rounded-3xl border border-cyan-200/10 bg-white/5 p-6"
            >
              <h2 className="text-lg font-semibold">Today’s Tasks</h2>
              <p className="text-sm text-cyan-100/70">
                Tasks published by admins will appear here.
              </p>
              {tasks.length === 0 ? (
                <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/60 p-5 text-sm text-cyan-100/80">
                  No tasks assigned yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {tasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-2xl border border-cyan-200/10 bg-slate-950/60 p-5 text-sm text-cyan-100/80"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-white">
                          {task.title}
                        </h3>
                        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                          Due {task.deadline}
                        </span>
                      </div>
                  <p className="mt-3 text-sm text-cyan-100/70">
                    {task.problem}
                  </p>
                  <div className="mt-4 rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-xs text-cyan-100/70">
                    Hint: {task.hints}
                  </div>
                  {task.attachment_url ? (
                    <a
                      className="mt-3 inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                      href={task.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Attachment: {task.attachment_name ?? "View file"}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          )}
            </section>

            <section
              id="submissions"
              className="grid gap-4 rounded-3xl border border-cyan-200/10 bg-white/5 p-6"
            >
              <h2 className="text-lg font-semibold">Submit Your Work</h2>
              <p className="text-sm text-cyan-100/70">
                Upload your answer as a link or paste your solution.
              </p>
              <SubmissionForm tasks={tasks} />
              {submissions.length > 0 ? (
                <div className="mt-4 grid gap-3 text-sm text-cyan-100/80">
                  {submissions.slice(0, 3).map((submission) => (
                    <div
                      key={submission.id}
                      className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>Submission {submission.id.slice(0, 6)}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                          {submission.status}
                        </span>
                      </div>
                      {submission.answer_url ? (
                        <a
                          className="mt-2 inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                          href={submission.answer_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View link
                        </a>
                      ) : null}
                      {submission.answer_image_url ? (
                        <a
                          className="mt-2 inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                          href={submission.answer_image_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View image
                        </a>
                      ) : null}
                      {submission.admin_remark ? (
                        <div className="mt-2 rounded-xl border border-cyan-200/10 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100/70">
                          Remark: {submission.admin_remark}
                        </div>
                      ) : null}
                      {submission.status === "pending" ? (
                        <form className="mt-3" action={deleteSubmissionAction}>
                          <input
                            type="hidden"
                            name="submission_id"
                            value={submission.id}
                          />
                          <button
                            className="inline-flex h-8 items-center justify-center rounded-full border border-cyan-300/40 px-4 text-xs font-semibold text-white transition hover:bg-cyan-500/10"
                            type="submit"
                          >
                            Delete submission
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section
              id="materials"
              className="grid gap-4 rounded-3xl border border-cyan-200/10 bg-white/5 p-6"
            >
          <h2 className="text-lg font-semibold">Learning Materials</h2>
          <p className="text-sm text-cyan-100/70">
            Refer materials here.
          </p>
              <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/60 p-5 text-sm text-cyan-100/80">
                {driveFiles.length === 0 ? (
                  <p>No materials found.</p>
                ) : (
                  <ul className="grid gap-3">
                    {driveFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3"
                      >
                        <span>{file.name}</span>
                        {file.webViewLink ? (
                          <a
                            className="text-cyan-200 underline-offset-4 hover:underline"
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section
              id="stats"
              className="grid gap-4 rounded-3xl border border-cyan-200/10 bg-white/5 p-6"
            >
              <h2 className="text-lg font-semibold">LeetCode Progress</h2>
              <p className="text-sm text-cyan-100/70">
                {profile?.leetcode_id
                  ? `Tracking ${profile.leetcode_id}`
                  : "Connect your LeetCode handle to see stats."}
              </p>
              <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/60 p-5 text-sm text-cyan-100/80">
                {profile?.leetcode_id ? (
                  leetCodeStats ? (
                    <div className="grid gap-4">
                      <div className="text-base font-semibold text-white">
                        Total solved: {leetCodeStats.totalSolved}
                      </div>
                      <div className="grid gap-2 text-xs text-cyan-100/70">
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                          Last 5 accepted
                        </p>
                        {leetCodeStats.recentAccepted.length === 0 ? (
                          <p>No recent submissions.</p>
                        ) : (
                          <ul className="grid gap-2">
                            {leetCodeStats.recentAccepted.map((item) => (
                              <li
                                key={`${item.titleSlug}-${item.timestamp}`}
                                className="flex items-center justify-between gap-2 rounded-xl border border-cyan-200/10 bg-slate-950/70 px-3 py-2"
                              >
                                <span>{item.title}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                                  #{item.titleSlug}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between text-xs">
                          <span>Easy</span>
                          <span>{leetCodeStats.easySolved}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{
                              width: `${
                                leetCodeStats.totalSolved
                                  ? (leetCodeStats.easySolved /
                                      leetCodeStats.totalSolved) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Medium</span>
                          <span>{leetCodeStats.mediumSolved}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{
                              width: `${
                                leetCodeStats.totalSolved
                                  ? (leetCodeStats.mediumSolved /
                                      leetCodeStats.totalSolved) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Hard</span>
                          <span>{leetCodeStats.hardSolved}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                          <div
                            className="h-full rounded-full bg-rose-400"
                            style={{
                              width: `${
                                leetCodeStats.totalSolved
                                  ? (leetCodeStats.hardSolved /
                                      leetCodeStats.totalSolved) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    "Unable to fetch LeetCode stats right now."
                  )
                ) : (
                  "LeetCode data pending configuration."
                )}
              </div>
            </section>

          </section>

          <aside className="h-fit rounded-2xl border border-cyan-200/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Profile
            </p>
            <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/80">
              <p className="font-semibold text-white">
                {session?.user?.name ?? "User"}
              </p>
              <p className="mt-1 text-xs">{session?.user?.email}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                Place
              </p>
              <p className="mt-1 text-sm text-white">
                {profile?.place ?? "Not set"}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                Birthday
              </p>
              <p className="mt-1 text-sm text-white">
                {profile?.date_of_birth ?? "Not set"}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                LeetCode ID
              </p>
              <p className="mt-1 text-sm text-white">
                {profile?.leetcode_id ?? "Not set"}
              </p>
            </div>
            <UserSignOut />
            <section
              id="checkin"
              className="mt-6 grid gap-4 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4"
            >
              <h2 className="text-sm font-semibold text-white">Daily Check-in</h2>
              <p className="text-xs text-cyan-100/70">
                Keep your streak alive to earn badges.
              </p>
              <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/60 px-4 py-3 text-xs text-cyan-100/80">
                Current streak:{" "}
                <span className="font-semibold text-white">
                  {streakDays} days
                </span>
              </div>
              <CoinReward
                streakDays={streakDays}
                hasCheckedInToday={hasCheckedInToday}
              />
              {badges.some((badge) => badge.earned) ? (
                <div className="grid gap-2 text-[10px] uppercase tracking-[0.2em]">
                  {badges
                    .filter((badge) => badge.earned)
                    .map((badge) => (
                      <div
                        key={badge.milestone}
                        className="rounded-2xl border border-cyan-300/60 bg-cyan-500/20 px-3 py-2 text-cyan-100"
                      >
                        {badge.milestone}-day badge
                      </div>
                    ))}
                </div>
              ) : null}
            </section>
            <div className="mt-6 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-xs text-cyan-100/70">
              Rewards and streaks appear in the center panel.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
