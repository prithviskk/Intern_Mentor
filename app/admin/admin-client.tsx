"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";

type AdminClientProps = {
  userName: string;
  userEmail: string;
  driveUrl: string;
  createTaskAction: (formData: FormData) => Promise<void>;
  updateSubmissionStatusAction: (formData: FormData) => Promise<void>;
  submissions: {
    id: string;
    email: string;
    task_id: string | null;
    answer_url: string | null;
    answer_text: string | null;
    answer_image_url?: string | null;
    user_name?: string | null;
    admin_remark?: string | null;
    status: "pending" | "approved" | "rejected";
    created_at: string;
  }[];
  tasks: {
    id: string;
    title: string;
    deadline: string;
    problem: string;
    hints: string;
    attachment_url?: string | null;
    attachment_name?: string | null;
  }[];
  deleteTaskAction: (formData: FormData) => Promise<void>;
  submissionsPage: number;
  submissionsTotalPages: number;
  submissionsHasPrev: boolean;
  submissionsHasNext: boolean;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    place: string | null;
    date_of_birth: string | null;
    leetcode_id: string | null;
    created_at: string;
  }[];
  deleteUserAction: (formData: FormData) => Promise<void>;
  leetCodeStats: {
    email: string;
    name: string;
    leetcodeId: string;
    stats: {
      totalSolved: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
      recentAccepted: { title: string; titleSlug: string; timestamp: string }[];
    } | null;
  }[];
  analytics: {
    activeUsers: number;
    completionRate: number;
    momentum: number;
    dailyProgress: { label: string; percent: number }[];
  };
};

export default function AdminClient({
  userName,
  userEmail,
  driveUrl,
  createTaskAction,
  updateSubmissionStatusAction,
  submissions,
  tasks,
  deleteTaskAction,
  submissionsPage,
  submissionsTotalPages,
  submissionsHasPrev,
  submissionsHasNext,
  profiles,
  deleteUserAction,
  leetCodeStats,
  analytics,
}: AdminClientProps) {
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const tasksRef = useRef<HTMLDivElement | null>(null);
  const uploadsRef = useRef<HTMLDivElement | null>(null);
  const analyticsRef = useRef<HTMLDivElement | null>(null);
  const leetcodeRef = useRef<HTMLDivElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    link?: string | null;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [taskFileStatus, setTaskFileStatus] = useState<string>("");
  const [taskFile, setTaskFile] = useState<{
    name: string;
    link?: string | null;
  } | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
      <aside className="h-fit rounded-2xl border border-cyan-200/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
          Dashboard
        </p>
        <nav className="mt-6 grid gap-3 text-sm text-cyan-100/80">
          <button
            className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-left text-cyan-100 transition hover:border-cyan-300/60"
            onClick={() => scrollTo(overviewRef)}
            type="button"
          >
            Overview
          </button>
          <button
            className="rounded-xl border border-cyan-200/10 px-4 py-2 text-left transition hover:border-cyan-300/40"
            onClick={() => scrollTo(tasksRef)}
            type="button"
          >
            Assign Tasks
          </button>
          <button
            className="rounded-xl border border-cyan-200/10 px-4 py-2 text-left transition hover:border-cyan-300/40"
            onClick={() => scrollTo(uploadsRef)}
            type="button"
          >
            Upload Documents
          </button>
          <button
            className="rounded-xl border border-cyan-200/10 px-4 py-2 text-left transition hover:border-cyan-300/40"
            onClick={() => scrollTo(analyticsRef)}
            type="button"
          >
            Analytics
          </button>
          <button
            className="rounded-xl border border-cyan-200/10 px-4 py-2 text-left transition hover:border-cyan-300/40"
            onClick={() => scrollTo(leetcodeRef)}
            type="button"
          >
            LeetCode Stats
          </button>
        </nav>
      </aside>

      <section className="grid gap-6">
        <div
          className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6"
          ref={overviewRef}
        >
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Jump to tasks, uploads, analytics, and LeetCode insights from the
            left navigation.
          </p>
        </div>

        <div
          className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6"
          ref={tasksRef}
        >
          <h2 className="text-xl font-semibold">Assign Tasks</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Create daily tasks with deadlines and guided hints.
          </p>
          <form className="mt-5 grid gap-4" action={createTaskAction}>
            <input
              className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
              name="title"
              placeholder="Task heading"
              required
            />
            <input
              className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
              name="deadline"
              placeholder="Deadline (e.g., 2026-03-10)"
              required
            />
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
              name="problem"
              placeholder="Problem statement"
              required
            />
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
              name="hints"
              placeholder="Hints to guide students"
              required
            />
            <div className="grid gap-3">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-cyan-300/40 bg-slate-950/70 px-4 py-3 text-xs text-cyan-100/70">
                <span>Upload PDF or image (optional)</span>
                <input
                  className="hidden"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setTaskFileStatus("Uploading...");
                    setTaskFile(null);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const response = await fetch("/api/drive/upload-user", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data?.error || "Upload failed.");
                      }
                      setTaskFile({
                        name: data.file?.name ?? file.name,
                        link: data.file?.webViewLink ?? null,
                      });
                      setTaskFileStatus("File attached.");
                    } catch (error) {
                      setTaskFileStatus(
                        error instanceof Error ? error.message : "Upload failed."
                      );
                    }
                  }}
                />
              </label>
              {taskFile ? (
                <>
                  <input
                    type="hidden"
                    name="attachment_url"
                    value={taskFile.link ?? ""}
                  />
                  <input
                    type="hidden"
                    name="attachment_name"
                    value={taskFile.name ?? ""}
                  />
                </>
              ) : null}
              {taskFileStatus ? (
                <p className="text-xs text-cyan-200/80">{taskFileStatus}</p>
              ) : null}
            </div>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/90 via-indigo-400/90 to-fuchsia-500/90 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.55)] transition hover:brightness-110"
              type="submit"
            >
              Publish task
            </button>
          </form>
          <div className="mt-6 grid gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/70">
                No tasks yet.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">{task.title}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                      Due {task.deadline}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-cyan-100/70">
                    {task.problem}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-cyan-100/60">
                      Hint: {task.hints}
                    </span>
                    <form action={deleteTaskAction}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <button
                        className="inline-flex h-8 items-center justify-center rounded-full border border-cyan-300/40 px-4 text-xs font-semibold text-white transition hover:bg-cyan-500/10"
                        type="submit"
                      >
                        Remove
                      </button>
                    </form>
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
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6"
          ref={uploadsRef}
        >
          <h2 className="text-xl font-semibold">Upload Documents</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Upload PDFs and resources. Students will see them in their
            dashboard.
          </p>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-cyan-300/40 bg-slate-950/70 px-6 py-10 text-sm text-cyan-100/70">
              <input
                className="hidden"
                type="file"
                onChange={async (event) => {
                  const selectedFile = event.target.files?.[0];
                  if (!selectedFile) return;
                  setUploadStatus("Uploading...");
                  setUploadProgress(0);
                  setUploadedFile(null);
                  try {
                    const formData = new FormData();
                    formData.append("file", selectedFile);

                    const responseData = await new Promise<{
                      ok: boolean;
                      file?: { name?: string; webViewLink?: string | null };
                      error?: string;
                    }>((resolve, reject) => {
                      const xhr = new XMLHttpRequest();
                      xhr.open("POST", "/api/drive/upload-user");
                      xhr.upload.addEventListener("progress", (event) => {
                        if (event.lengthComputable) {
                          const percent = Math.round(
                            (event.loaded / event.total) * 100
                          );
                          setUploadProgress(percent);
                        }
                      });
                      xhr.addEventListener("load", () => {
                        try {
                          const json = JSON.parse(xhr.responseText);
                          if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(json);
                          } else {
                            reject(
                              new Error(json?.error || "Upload failed.")
                            );
                          }
                        } catch {
                          reject(new Error("Upload failed."));
                        }
                      });
                      xhr.addEventListener("error", () =>
                        reject(new Error("Upload failed."))
                      );
                      xhr.send(formData);
                    });

                    setUploadedFile({
                      name: responseData.file?.name ?? selectedFile.name,
                      link: responseData.file?.webViewLink ?? null,
                    });
                    setUploadStatus("Upload complete.");
                    setUploadProgress(100);
                  } catch (error) {
                    setUploadStatus(
                      error instanceof Error ? error.message : "Upload failed."
                    );
                  }
                }}
              />
              Drag & drop or click to upload
            </label>
            <div className="w-full rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-xs text-cyan-100/70">
              {driveUrl ? (
                <>
                  <p>Drive folder:</p>
                  <a
                    className="mt-2 inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                    href={driveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                      Open materials folder
                  </a>
                </>
              ) : (
                <p>Add a Drive link in `.env.local` to enable sync.</p>
              )}
              {uploadStatus ? (
                <div className="mt-3 grid gap-2">
                  <p className="text-cyan-200/80">{uploadStatus}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}
              {uploadedFile ? (
                <p className="mt-2 text-cyan-200">
                  Uploaded:{" "}
                  {uploadedFile.link ? (
                    <a
                      className="underline underline-offset-4"
                      href={uploadedFile.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {uploadedFile.name}
                    </a>
                  ) : (
                    uploadedFile.name
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6"
          ref={analyticsRef}
        >
          <h2 className="text-xl font-semibold">Student Performance</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Analytics placeholders for completion rate, difficulty balance, and
            momentum.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Active
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {analytics.activeUsers}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Completion
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {analytics.completionRate}%
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Momentum
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {analytics.momentum >= 0 ? "+" : ""}
                {analytics.momentum}%
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Completion pie
              </p>
              <div className="mt-4 flex items-center justify-center">
                <div className="relative h-36 w-36 rounded-full border border-cyan-200/10 bg-slate-950/70">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#22d3ee 0deg ${
                        Math.min(360, Math.max(0, analytics.completionRate * 3.6))
                      }deg, rgba(148,163,184,0.15) ${
                        Math.min(360, Math.max(0, analytics.completionRate * 3.6))
                      }deg 360deg)`,
                    }}
                  />
                  <div className="absolute inset-4 rounded-full bg-slate-950/90" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-cyan-100/80">
                    {analytics.completionRate}%
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Weekly progress
              </p>
              <div className="mt-4 grid gap-3">
                {analytics.dailyProgress.map((item, index) => (
                  <div key={`bar-${index}`} className="grid gap-1 text-xs">
                    <div className="flex items-center justify-between text-cyan-100/70">
                      <span>{item.label}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6"
          ref={leetcodeRef}
        >
          <h2 className="text-xl font-semibold">LeetCode Stats</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Live stats for users who have added a LeetCode ID (latest 8).
          </p>
          {leetCodeStats.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/70">
              No LeetCode IDs configured yet.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {leetCodeStats.map((item) => (
                <div
                  key={item.email}
                  className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-cyan-100/80">
                        @{item.leetcodeId}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                      {item.stats ? item.stats.totalSolved : "--"} solved
                    </span>
                  </div>
                  {item.stats ? (
                    <div className="mt-4 grid gap-3">
                      <div className="grid gap-2 text-xs text-cyan-100/70">
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                          Last 5 accepted
                        </p>
                        {item.stats.recentAccepted.length === 0 ? (
                          <p>No recent submissions.</p>
                        ) : (
                          <ul className="grid gap-2">
                            {item.stats.recentAccepted.map((entry) => (
                              <li
                                key={`${entry.titleSlug}-${entry.timestamp}`}
                                className="flex items-center justify-between gap-2 rounded-xl border border-cyan-200/10 bg-slate-950/70 px-3 py-2"
                              >
                                <span>{entry.title}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                                  #{entry.titleSlug}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {[
                        { label: "Easy", value: item.stats.easySolved, color: "bg-emerald-400" },
                        { label: "Medium", value: item.stats.mediumSolved, color: "bg-amber-400" },
                        { label: "Hard", value: item.stats.hardSolved, color: "bg-rose-400" },
                      ].map((row) => (
                        <div key={row.label} className="grid gap-1 text-xs">
                          <div className="flex items-center justify-between text-cyan-100/70">
                            <span>{row.label}</span>
                            <span>{row.value}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                            <div
                              className={`h-full rounded-full ${row.color}`}
                              style={{
                                width: `${
                                  item.stats?.totalSolved
                                    ? (row.value / item.stats.totalSolved) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-cyan-100/60">
                      Unable to fetch stats.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Task Submissions</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Review student answers and mark them as approved or rejected.
          </p>
          {submissions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-5 text-sm text-cyan-100/70">
              No submissions yet.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-5 text-sm text-cyan-100/80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                        {submission.user_name ?? submission.email}
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        Task {submission.task_id ?? "General"}
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-200/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                      {submission.status}
                    </span>
                  </div>
                  {submission.answer_text ? (
                    <p className="mt-3 text-sm text-cyan-100/80">
                      {submission.answer_text}
                    </p>
                  ) : null}
                  {submission.answer_url ? (
                    <a
                      className="mt-3 inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                      href={submission.answer_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View submitted link
                    </a>
                  ) : null}
                  {submission.answer_image_url ? (
                    <a
                      className="mt-3 inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                      href={submission.answer_image_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View submitted image
                    </a>
                  ) : null}
                  {submission.status === "pending" ? (
                    <form
                      className="mt-4 grid gap-3"
                      action={updateSubmissionStatusAction}
                    >
                      <input
                        type="hidden"
                        name="submission_id"
                        value={submission.id}
                      />
                      <textarea
                        className="min-h-[80px] w-full rounded-xl border border-cyan-200/10 bg-slate-950/80 px-4 py-3 text-xs text-white placeholder:text-cyan-100/50"
                        name="admin_remark"
                        placeholder="Add remarks for the student"
                        defaultValue={submission.admin_remark ?? ""}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-400/80 px-4 text-xs font-semibold text-slate-950 transition hover:brightness-110"
                          type="submit"
                          name="status"
                          value="approved"
                        >
                          Approve
                        </button>
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-full border border-cyan-300/30 px-4 text-xs font-semibold text-white transition hover:bg-cyan-500/10"
                          type="submit"
                          name="status"
                          value="rejected"
                        >
                          Reject
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4 grid gap-2 text-xs text-cyan-100/70">
                      <div className="rounded-xl border border-cyan-200/10 bg-slate-950/70 px-3 py-2">
                        Remarks: {submission.admin_remark ?? "No remarks"}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          <div className="mt-6 flex items-center justify-between text-xs text-cyan-100/70">
            <span>
              Page {submissionsPage} of {submissionsTotalPages}
            </span>
            <div className="flex gap-2">
              <a
                className={`rounded-full border px-3 py-1 ${
                  submissionsHasPrev
                    ? "border-cyan-300/40 text-cyan-100 hover:bg-cyan-500/10"
                    : "border-cyan-200/10 text-cyan-100/40 pointer-events-none"
                }`}
                href={`?page=${Math.max(1, submissionsPage - 1)}`}
              >
                Prev
              </a>
              <a
                className={`rounded-full border px-3 py-1 ${
                  submissionsHasNext
                    ? "border-cyan-300/40 text-cyan-100 hover:bg-cyan-500/10"
                    : "border-cyan-200/10 text-cyan-100/40 pointer-events-none"
                }`}
                href={`?page=${submissionsPage + 1}`}
              >
                Next
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Registered Users</h2>
          <p className="mt-2 text-sm text-cyan-100/70">
            Total users: {profiles.length}
          </p>
          {profiles.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/70">
              No users found.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 text-sm text-cyan-100/80">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {profile.full_name ?? profile.email}
                    </p>
                    <p className="text-xs text-cyan-100/60">{profile.email}</p>
                  </div>
                  <form action={deleteUserAction}>
                    <input type="hidden" name="email" value={profile.email} />
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-full border border-cyan-300/40 px-4 text-xs font-semibold text-white transition hover:bg-cyan-500/10"
                      type="submit"
                    >
                      Remove account
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-cyan-200/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
          Admin Profile
        </p>
        <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-sm text-cyan-100/80">
          <p className="font-semibold text-white">{userName}</p>
          <p className="mt-1 text-xs">{userEmail}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300/70">
            Role
          </p>
          <p className="mt-1 text-sm text-white">Admin</p>
        </div>
        <button
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-cyan-200/40 text-sm font-semibold text-white transition hover:bg-cyan-500/10"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </button>
        <div className="mt-6 rounded-2xl border border-cyan-200/10 bg-slate-950/70 p-4 text-xs text-cyan-100/70">
          Profile settings and team permissions will appear here.
        </div>
      </aside>
    </div>
  );
}
