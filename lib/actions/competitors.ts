import { createClient } from "@/utils/supabase/server";
import { Competitor } from "@/types/database";
import crypto from "crypto";

export async function getCompetitors(): Promise<Competitor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addCompetitor(name: string, url: string): Promise<Competitor> {
  const supabase = createClient();
  
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  const { data, error } = await supabase
    .from("competitors")
    .insert([{ name, url }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCompetitor(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("competitors")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

async function fetchAndHashUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  return crypto.createHash("sha256").update(html).digest("hex");
}

export async function checkCompetitor(id: string): Promise<{ changed: boolean; newHash: string }> {
  const supabase = createClient();
  
  // Get competitor
  const { data: competitor, error: fetchError } = await supabase
    .from("competitors")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Fetch and hash new content
  const newHash = await fetchAndHashUrl(competitor.url);

  // If no previous hash, just update
  if (!competitor.last_hash) {
    await supabase
      .from("competitors")
      .update({ last_hash: newHash, last_checked: new Date().toISOString() })
      .eq("id", id);
    return { changed: false, newHash };
  }

  // If hash changed, record the change
  if (newHash !== competitor.last_hash) {
    await supabase.from("changes").insert({
      competitor_id: id,
      detected_at: new Date().toISOString(),
      old_hash: competitor.last_hash,
      new_hash: newHash,
    });

    await supabase
      .from("competitors")
      .update({ last_hash: newHash, last_checked: new Date().toISOString() })
      .eq("id", id);

    return { changed: true, newHash };
  }

  // Update last checked time
  await supabase
    .from("competitors")
    .update({ last_checked: new Date().toISOString() })
    .eq("id", id);

  return { changed: false, newHash };
} 