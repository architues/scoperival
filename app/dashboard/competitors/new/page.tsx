import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CompetitorForm } from "@/components/competitors/competitor-form"

export default async function NewCompetitorPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Add Competitor" text="Add a new competitor to track." />
      <div className="grid gap-4">
        <CompetitorForm />
      </div>
    </DashboardShell>
  )
}