import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Check } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleUpgrade = async (plan: "starter" | "growth") => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const baseUrl = plan === "starter" 
        ? "https://test.checkout.dodopayments.com/buy/pdt_g1HPPzAtm6AGoSE1FIW1t"
        : "https://test.checkout.dodopayments.com/buy/pdt_Pys06FeA4EXjkHYSjgNZ8";

      const checkoutUrl = `${baseUrl}?quantity=1&client_reference_id=${user.id}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error initiating upgrade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Starter</h3>
              <p className="text-2xl font-bold">$29</p>
              <p className="text-sm text-muted-foreground">/month</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Up to 5 competitors</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Daily checks</span>
                </li>
              </ul>
              <Button 
                className="mt-4 w-full" 
                onClick={() => handleUpgrade("starter")}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Upgrade to Starter"}
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Growth</h3>
              <p className="text-2xl font-bold">$99</p>
              <p className="text-sm text-muted-foreground">/month</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Unlimited competitors</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Hourly checks</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button 
                className="mt-4 w-full" 
                onClick={() => handleUpgrade("growth")}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Upgrade to Growth"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 