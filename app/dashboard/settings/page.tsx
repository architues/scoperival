import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activateLicense } from "@/app/actions/license";
import { toast } from "sonner";

export default async function SettingsPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: user } = await supabase.auth.getUser();

  async function handleLicenseActivation(formData: FormData) {
    "use server";
    
    const licenseKey = formData.get("license") as string;
    
    try {
      await activateLicense(licenseKey);
      toast.success("License activated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to activate license");
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings and subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.user?.email || ""}
              disabled
            />
          </div>

          <form action={handleLicenseActivation} className="space-y-2">
            <Label htmlFor="license">License Key</Label>
            <div className="flex gap-2">
              <Input
                id="license"
                name="license"
                placeholder="Enter your license key"
                className="font-mono"
                required
              />
              <Button type="submit">Activate License</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the license key you received after payment
            </p>
          </form>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              {user?.user?.user_metadata?.plan || "Free"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 