"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function activateLicense(licenseKey: string) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Verify the license key with your payment provider
  // This is a placeholder - implement your actual license verification logic
  const isValid = await verifyLicenseKey(licenseKey);

  if (!isValid) {
    throw new Error("Invalid license key");
  }

  // Update user metadata with the new plan
  const { error } = await supabase.auth.updateUser({
    data: {
      plan: "premium",
      licenseKey,
    },
  });

  if (error) {
    throw new Error("Failed to activate license");
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

async function verifyLicenseKey(licenseKey: string): Promise<boolean> {
  // Implement your license verification logic here
  // This could involve checking against a database of valid keys
  // or verifying with your payment provider's API
  return true; // Placeholder
} 