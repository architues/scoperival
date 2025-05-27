import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { client_reference_id?: string };
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // For MVP, generate a simple license key
  const licenseKey = `SCOPE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className="container max-w-2xl py-12">
      <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your account is being upgraded. Please use the license key below to activate your subscription.
        </p>

        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-sm font-mono">{licenseKey}</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To activate your subscription:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to your dashboard settings</li>
            <li>Enter the license key above</li>
            <li>Click "Activate License"</li>
          </ol>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link href="/dashboard/settings">
              Go to Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 