import { supabaseAdmin } from "@/lib/supabase";

export type ProfileRecord = {
  id: string;
  email: string;
  full_name: string | null;
  place: string | null;
  date_of_birth: string | null;
  leetcode_id: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function getProfileByEmail(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, full_name, place, date_of_birth, leetcode_id, created_at, updated_at"
      )
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as ProfileRecord | null;
  } catch {
    return null;
  }
}

export async function listProfiles() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, full_name, place, date_of_birth, leetcode_id, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as ProfileRecord[];
  } catch {
    return [];
  }
}

export async function deleteProfileByEmail(email: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("email", email);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertProfile(payload: {
  email: string;
  full_name?: string | null;
  place: string;
  date_of_birth: string;
  leetcode_id: string;
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          email: payload.email,
          full_name: payload.full_name ?? null,
          place: payload.place,
          date_of_birth: payload.date_of_birth,
          leetcode_id: payload.leetcode_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as ProfileRecord;
  } catch {
    return null;
  }
}
