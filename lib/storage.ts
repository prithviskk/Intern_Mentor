import { supabaseAdmin } from "@/lib/supabase";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "submission-images";

export async function uploadSubmissionImage(payload: {
  file: File;
  userEmail: string;
}) {
  const extension = payload.file.name.split(".").pop() || "png";
  const safeEmail = payload.userEmail.replace(/[^a-z0-9]/gi, "_");
  const filePath = `${safeEmail}/${Date.now()}.${extension}`;

  const arrayBuffer = await payload.file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, arrayBuffer, {
      contentType: payload.file.type || "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}
