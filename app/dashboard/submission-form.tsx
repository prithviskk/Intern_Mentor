"use client";

import { useRef, useState } from "react";

type TaskOption = {
  id: string;
  title: string;
};

type SubmissionFormProps = {
  tasks: TaskOption[];
};

export default function SubmissionForm({ tasks }: SubmissionFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [showTick, setShowTick] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Uploading...");
    setShowTick(false);
    setUploadProgress(0);

    const formData = new FormData(event.currentTarget);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/submissions");
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setStatus("Uploaded");
          setShowTick(true);
          setUploadProgress(100);
          formRef.current?.reset();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setStatus(response?.error || "Upload failed.");
        }
      } catch {
        setStatus("Upload failed.");
      }
    });
    xhr.addEventListener("error", () => setStatus("Upload failed."));
    xhr.send(formData);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} ref={formRef}>
      <select
        className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
        name="task_id"
        defaultValue=""
      >
        <option value="">Select task (optional)</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
        name="answer_url"
        placeholder="Answer link (GitHub, Docs, etc.)"
        type="url"
      />
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-cyan-300/40 bg-slate-950/70 px-4 py-3 text-xs text-cyan-100/70">
        <span>Upload an image (optional)</span>
        <input
          className="hidden"
          name="answer_image"
          type="file"
          accept="image/*"
          ref={fileInputRef}
        />
      </label>
      <textarea
        className="min-h-[120px] w-full rounded-xl border border-cyan-200/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-cyan-100/50"
        name="answer_text"
        placeholder="Or paste your answer here"
      />
      <button
        className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/90 via-indigo-400/90 to-fuchsia-500/90 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.55)] transition hover:brightness-110"
        type="submit"
      >
        Submit answer
      </button>
      {status ? (
        <div className="grid gap-2 text-xs text-cyan-100/80">
          <div className="flex items-center justify-between">
            <span>{status}</span>
            {showTick ? <span className="tick-mark">✓</span> : null}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}
