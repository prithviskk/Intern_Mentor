import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createTaskAction,
  deleteTaskAction,
  updateSubmissionStatusAction,
  deleteUserAction,
} from "./actions";
import AdminClient from "./admin-client";
import { listSubmissionsPage } from "@/lib/submissions";
import { listTasks } from "@/lib/tasks";
import { listProfiles } from "@/lib/profiles";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import { listCheckinsSince } from "@/lib/checkins";
import { listSubmissionsSince } from "@/lib/submissions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const page = Number(searchParams?.page ?? "1");
  const submissionsPage = await listSubmissionsPage(page, 10);
  const tasks = await listTasks();
  const profiles = await listProfiles();
  const leetCodeProfiles = profiles
    .filter((profile) => profile.leetcode_id)
    .slice(0, 8);
  const leetCodeStats = await Promise.all(
    leetCodeProfiles.map(async (profile) => ({
      email: profile.email,
      name: profile.full_name ?? profile.email,
      leetcodeId: profile.leetcode_id ?? "",
      stats: await fetchLeetCodeStats(profile.leetcode_id ?? ""),
    }))
  );

  const today = new Date();
  const startOfDay = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const last7 = new Date(startOfDay);
  last7.setDate(last7.getDate() - 6);
  const prev7 = new Date(startOfDay);
  prev7.setDate(prev7.getDate() - 13);

  const [recentCheckins, previousCheckins, recentSubmissions] =
    await Promise.all([
      listCheckinsSince(last7.toISOString().slice(0, 10)),
      listCheckinsSince(prev7.toISOString().slice(0, 10)),
      listSubmissionsSince(last7.toISOString()),
    ]);

  const activeUsers = new Set(recentCheckins.map((item) => item.email)).size;
  const previousActiveUsers = new Set(
    previousCheckins
      .filter((item) => item.checkin_date < last7.toISOString().slice(0, 10))
      .map((item) => item.email)
  ).size;

  const completionRate = profiles.length
    ? Math.round((new Set(recentSubmissions.map((s) => s.email)).size /
        profiles.length) * 100)
    : 0;

  const momentum = previousActiveUsers
    ? Math.round(
        ((activeUsers - previousActiveUsers) / previousActiveUsers) * 100
      )
    : activeUsers
      ? 100
      : 0;

  const dailyProgress = Array.from({ length: 5 }).map((_, index) => {
    const day = new Date(startOfDay);
    day.setDate(day.getDate() - (4 - index));
    const dayKey = day.toISOString().slice(0, 10);
    const count = recentCheckins.filter(
      (checkin) => checkin.checkin_date === dayKey
    ).length;
    const percent = profiles.length
      ? Math.round((count / profiles.length) * 100)
      : 0;
    return { label: day.toLocaleDateString("en-US", { weekday: "short" }), percent };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0b0f2a] to-[#120b2d] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
            Admin Control Room
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Intern Mentor Dashboard
          </h1>
        </header>

        <AdminClient
          userEmail={session.user.email ?? "admin@internmentor"}
          userName={session.user.name ?? "Admin"}
          driveUrl={process.env.GOOGLE_DRIVE_MATERIALS_URL ?? ""}
          createTaskAction={createTaskAction}
          updateSubmissionStatusAction={updateSubmissionStatusAction}
          submissions={submissionsPage.submissions}
          submissionsPage={submissionsPage.page}
          submissionsTotalPages={submissionsPage.totalPages}
          submissionsHasNext={submissionsPage.hasNext}
          submissionsHasPrev={submissionsPage.hasPrev}
          tasks={tasks}
          deleteTaskAction={deleteTaskAction}
          profiles={profiles}
          deleteUserAction={deleteUserAction}
          leetCodeStats={leetCodeStats}
          analytics={{
            activeUsers,
            completionRate,
            momentum,
            dailyProgress,
          }}
        />
      </div>
    </div>
  );
}
