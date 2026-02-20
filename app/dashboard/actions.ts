"use server";

import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { upsertProfile } from "@/lib/profiles";
import { revalidatePath } from "next/cache";
import { createCheckin } from "@/lib/checkins";
import { createSubmission } from "@/lib/submissions";
import { deleteSubmissionById } from "@/lib/submissions";
import { uploadSubmissionImage } from "@/lib/storage";

const profileSchema = z.object({
  place: z.preprocess(
    (val) => (typeof val === "string" ? val : ""),
    z.string().min(2, "Place is required.")
  ),
  date_of_birth: z.preprocess(
    (val) => (typeof val === "string" ? val : ""),
    z.string().min(4, "Date of birth is required.")
  ),
  leetcode_id: z.preprocess(
    (val) => (typeof val === "string" ? val : ""),
    z.string().min(2, "LeetCode ID is required.")
  ),
});

export async function saveProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const payload = profileSchema.parse({
    place: formData.get("place"),
    date_of_birth: formData.get("date_of_birth"),
    leetcode_id: formData.get("leetcode_id"),
  });

  await upsertProfile({
    email: session.user.email,
    full_name: session.user.name ?? null,
    place: payload.place,
    date_of_birth: payload.date_of_birth,
    leetcode_id: payload.leetcode_id,
  });

  revalidatePath("/dashboard");
}

export async function checkinAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);
  await createCheckin(session.user.email, todayString);
  revalidatePath("/dashboard");
}

const submissionSchema = z.object({
  task_id: z.string().optional(),
  answer_url: z.string().url().optional().or(z.literal("")),
  answer_text: z.string().optional().or(z.literal("")),
});

export async function submitAnswerAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const payload = submissionSchema.parse({
    task_id: formData.get("task_id")?.toString() ?? "",
    answer_url: formData.get("answer_url")?.toString() ?? "",
    answer_text: formData.get("answer_text")?.toString() ?? "",
  });

  const imageFile = formData.get("answer_image");
  const hasImage = imageFile instanceof File && imageFile.size > 0;

  if (!payload.answer_text && !payload.answer_url && !hasImage) {
    throw new Error("Provide an answer or link.");
  }

  let imageUrl: string | null = null;
  if (hasImage) {
    imageUrl = await uploadSubmissionImage({
      file: imageFile,
      userEmail: session.user.email,
    });
  }

  await createSubmission({
    email: session.user.email,
    task_id: payload.task_id || null,
    answer_url: payload.answer_url || null,
    answer_text: payload.answer_text || null,
    answer_image_url: imageUrl,
  });

  revalidatePath("/dashboard");
}

export async function deleteSubmissionAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const submissionId = formData.get("submission_id")?.toString() ?? "";
  if (!submissionId) {
    throw new Error("Invalid request.");
  }

  await deleteSubmissionById(submissionId, session.user.email);
  revalidatePath("/dashboard");
}
