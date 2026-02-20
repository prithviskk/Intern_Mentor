"use server";

import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createTask } from "@/lib/tasks";
import { revalidatePath } from "next/cache";
import { updateSubmissionStatus } from "@/lib/submissions";
import { deleteTaskById } from "@/lib/tasks";
import { deleteProfileByEmail } from "@/lib/profiles";
import { deleteSubmissionsByEmail } from "@/lib/submissions";
import { deleteCheckinsByEmail } from "@/lib/checkins";

const taskSchema = z.object({
  title: z.string().min(3, "Title is required."),
  deadline: z.string().min(3, "Deadline is required."),
  problem: z.string().min(10, "Problem statement is required."),
  hints: z.string().min(3, "Hints are required."),
  attachment_url: z.string().optional(),
  attachment_name: z.string().optional(),
});

export async function createTaskAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const payload = taskSchema.parse({
    title: formData.get("title"),
    deadline: formData.get("deadline"),
    problem: formData.get("problem"),
    hints: formData.get("hints"),
    attachment_url: formData.get("attachment_url")?.toString() ?? "",
    attachment_name: formData.get("attachment_name")?.toString() ?? "",
  });

  await createTask(payload);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateSubmissionStatusAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const submissionId = formData.get("submission_id")?.toString() ?? "";
  const status = formData.get("status")?.toString() ?? "";
  const adminRemark = formData.get("admin_remark")?.toString() ?? "";
  if (!submissionId || (status !== "approved" && status !== "rejected")) {
    throw new Error("Invalid request.");
  }

  await updateSubmissionStatus(
    submissionId,
    status,
    adminRemark ? adminRemark : null
  );
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const taskId = formData.get("task_id")?.toString() ?? "";
  if (!taskId) {
    throw new Error("Invalid request.");
  }

  await deleteTaskById(taskId);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteUserAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const email = formData.get("email")?.toString() ?? "";
  if (!email) {
    throw new Error("Invalid request.");
  }

  await deleteSubmissionsByEmail(email);
  await deleteCheckinsByEmail(email);
  await deleteProfileByEmail(email);
  revalidatePath("/admin");
}
