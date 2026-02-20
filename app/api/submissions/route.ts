import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createSubmission } from "@/lib/submissions";
import { uploadSubmissionImage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const taskId = formData.get("task_id")?.toString() || null;
    const answerUrl = formData.get("answer_url")?.toString() || null;
    const answerText = formData.get("answer_text")?.toString() || null;
    const imageFile = formData.get("answer_image");
    const hasImage = imageFile instanceof File && imageFile.size > 0;

    if (!answerUrl && !answerText && !hasImage) {
      return NextResponse.json(
        { error: "Provide an answer or link." },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;
    if (hasImage) {
      imageUrl = await uploadSubmissionImage({
        file: imageFile,
        userEmail: session.user.email,
      });
    }

    const submission = await createSubmission({
      email: session.user.email,
      user_name: session.user.name ?? null,
      task_id: taskId,
      answer_url: answerUrl,
      answer_text: answerText,
      answer_image_url: imageUrl,
    });

    return NextResponse.json({ ok: true, submission });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
