import { supabaseAdmin } from "@/lib/supabase";

export type TaskInput = {
  title: string;
  deadline: string;
  problem: string;
  hints: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
};

export type TaskRecord = TaskInput & {
  id: string;
  created_at: string;
};

export async function createTask(input: TaskInput) {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .insert({
      title: input.title,
      deadline: input.deadline,
      problem: input.problem,
      hints: input.hints,
      attachment_url: input.attachment_url ?? null,
      attachment_name: input.attachment_name ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TaskRecord;
}

export async function deleteTaskById(taskId: string) {
  const { error } = await supabaseAdmin.from("tasks").delete().eq("id", taskId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listTasks() {
  try {
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select(
        "id, created_at, title, deadline, problem, hints, attachment_url, attachment_name"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as TaskRecord[];
  } catch {
    return [];
  }
}
