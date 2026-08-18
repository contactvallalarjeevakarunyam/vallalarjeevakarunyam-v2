import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getStates() {
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .order("name");

  console.log("States data:", data);
  console.log("States error:", error);

  if (error) throw error;
  return data;
}

export async function getDistricts(stateId: number) {
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("state_id", stateId)
    .order("name");

  console.log("Districts data:", data);
  console.log("Districts error:", error);

  if (error) throw error;
  return data;
}