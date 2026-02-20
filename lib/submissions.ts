import { supabaseAdmin } from "@/lib/supabase";

export type SubmissionInput = {
  email: string;
  user_name?: string | null;
  task_id: string | null;
  answer_url: string | null;
  answer_text: string | null;
  answer_image_url?: string | null;
  admin_remark?: string | null;
};

export type SubmissionRecord = SubmissionInput & {
  id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export async function createSubmission(input: SubmissionInput) {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .insert({
      email: input.email,
      user_name: input.user_name ?? null,
      task_id: input.task_id,
      answer_url: input.answer_url,
      answer_text: input.answer_text,
      answer_image_url: input.answer_image_url ?? null,
      admin_remark: input.admin_remark ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubmissionRecord;
}

export async function listSubmissionsByEmail(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, email, user_name, task_id, answer_url, answer_text, answer_image_url, admin_remark, status, created_at"
      )
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as SubmissionRecord[];
  } catch {
    return [];
  }
}

export async function listAllSubmissions() {
  try {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, email, user_name, task_id, answer_url, answer_text, answer_image_url, admin_remark, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as SubmissionRecord[];
  } catch {
    return [];
  }
}

export async function listSubmissionsPage(page: number, pageSize: number) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error, count } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, email, user_name, task_id, answer_url, answer_text, answer_image_url, admin_remark, status, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      submissions: (data ?? []) as SubmissionRecord[],
      page: safePage,
      totalPages,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
    };
  } catch {
    return {
      submissions: [] as SubmissionRecord[],
      page: safePage,
      totalPages: 1,
      hasPrev: false,
      hasNext: false,
    };
  }
}

export async function updateSubmissionStatus(
  id: string,
  status: "approved" | "rejected",
  adminRemark?: string | null
) {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .update({ status, admin_remark: adminRemark ?? null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubmissionRecord;
}

export async function deleteSubmissionById(id: string, email: string) {
  const { error } = await supabaseAdmin
    .from("submissions")
    .delete()
    .eq("id", id)
    .eq("email", email);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteSubmissionsByEmail(email: string) {
  const { error } = await supabaseAdmin
    .from("submissions")
    .delete()
    .eq("email", email);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listSubmissionsSince(sinceDate: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("id, email, created_at")
      .gte("created_at", sinceDate);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as SubmissionRecord[];
  } catch {
    return [];
  }
}
