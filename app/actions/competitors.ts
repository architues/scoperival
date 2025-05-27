'use server';

import { createClient } from "@/utils/supabase/server";
import { Competitor } from "@/types/database";
import crypto from "crypto";

// Helper function to fetch URL with timeout
async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper function to generate hash
function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function addCompetitor(name: string, url: string): Promise<Competitor> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Check competitor limit
  const { count, error: countError } = await supabase
    .from("competitors")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    console.error("Error checking competitor count:", countError);
    throw new Error("Failed to check competitor limit");
  }

  // Free tier limit: 1 competitor
  if (count && count >= 1) {
    throw new Error("UPGRADE_REQUIRED");
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Insert competitor
  const { data, error } = await supabase
    .from("competitors")
    .insert([{ 
      name: name.trim(), 
      url: url.trim(),
      user_id: user.id 
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding competitor:", error);
    throw new Error("Failed to add competitor");
  }

  return data;
}

export async function getCompetitors(): Promise<Competitor[]> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching competitors:", error);
    throw new Error("Failed to fetch competitors");
  }

  return data;
}

export async function deleteCompetitor(id: string): Promise<void> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Verify ownership
  const { data: competitor, error: fetchError } = await supabase
    .from("competitors")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !competitor) {
    throw new Error("Competitor not found");
  }

  if (competitor.user_id !== user.id) {
    throw new Error("Not authorized");
  }

  // Delete competitor (changes will be deleted via cascade)
  const { error } = await supabase
    .from("competitors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting competitor:", error);
    throw new Error("Failed to delete competitor");
  }
}

export async function checkCompetitor(id: string): Promise<{ changed: boolean; newHash: string }> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Get competitor
  const { data: competitor, error: fetchError } = await supabase
    .from("competitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !competitor) {
    throw new Error("Competitor not found");
  }

  try {
    // Fetch and hash content
    const content = await fetchWithTimeout(competitor.url);
    const newHash = generateHash(content);

    // If no previous hash, just update
    if (!competitor.last_hash) {
      await supabase
        .from("competitors")
        .update({ 
          last_hash: newHash, 
          last_checked: new Date().toISOString() 
        })
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
        .update({ 
          last_hash: newHash, 
          last_checked: new Date().toISOString() 
        })
        .eq("id", id);

      return { changed: true, newHash };
    }

    // Update last checked time
    await supabase
      .from("competitors")
      .update({ last_checked: new Date().toISOString() })
      .eq("id", id);

    return { changed: false, newHash };
  } catch (error) {
    console.error("Error checking competitor:", error);
    throw new Error("Failed to check competitor");
  }
} 