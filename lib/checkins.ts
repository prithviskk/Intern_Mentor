import { supabaseAdmin } from "@/lib/supabase";

export type CheckinRecord = {
  id: string;
  email: string;
  checkin_date: string;
  created_at: string;
};

export async function listCheckins(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("checkins")
      .select("id, email, checkin_date, created_at")
      .eq("email", email)
      .order("checkin_date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as CheckinRecord[];
  } catch {
    return [];
  }
}

export async function createCheckin(email: string, checkinDate: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("checkins")
      .insert({
        email,
        checkin_date: checkinDate,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as CheckinRecord;
  } catch {
    return null;
  }
}

export async function deleteCheckinsByEmail(email: string) {
  const { error } = await supabaseAdmin
    .from("checkins")
    .delete()
    .eq("email", email);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listCheckinsSince(sinceDate: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("checkins")
      .select("id, email, checkin_date, created_at")
      .gte("checkin_date", sinceDate);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as CheckinRecord[];
  } catch {
    return [];
  }
}
