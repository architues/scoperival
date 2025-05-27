"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addCompetitor, getCompetitors } from "@/app/actions/competitors";
import { Competitor } from "@/types/database";
import { toast } from "sonner";
import { PricingModal } from "@/components/pricing-modal";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Load competitors on mount
  useEffect(() => {
    loadCompetitors();
  }, []);

  async function loadCompetitors() {
    try {
      const data = await getCompetitors();
      setCompetitors(data);
    } catch (error) {
      console.error("Error loading competitors:", error);
      toast.error("Failed to load competitors");
    }
  }

  async function handleAddCompetitor(formData: FormData) {
    try {
      setIsLoading(true);
      const name = formData.get("name") as string;
      const url = formData.get("url") as string;

      await addCompetitor(name, url);
      toast.success("Competitor added successfully");
      formData.set("name", "");
      formData.set("url", "");
      loadCompetitors();
    } catch (error) {
      if (error instanceof Error && error.message === "UPGRADE_REQUIRED") {
        setShowPricingModal(true);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to add competitor");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container py-12">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Competitor</CardTitle>
            <CardDescription>
              Monitor changes to your competitor's website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleAddCompetitor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter competitor name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Competitor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">Your Competitors</h2>
          {competitors.length === 0 ? (
            <p className="text-muted-foreground">No competitors added yet</p>
          ) : (
            <div className="grid gap-4">
              {competitors.map((competitor) => (
                <Card key={competitor.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold">{competitor.name}</h3>
                    <p className="text-sm text-muted-foreground">{competitor.url}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <PricingModal 
        open={showPricingModal} 
        onOpenChange={setShowPricingModal} 
      />
    </div>
  );
}