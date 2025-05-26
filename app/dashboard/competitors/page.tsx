import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CompetitorsList } from "@/components/competitors/competitors-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function CompetitorsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // In a real app, we would fetch competitors from Supabase here
  const competitors = []

  return (
    <DashboardShell>
      <DashboardHeader heading="Competitors" text="Manage your tracked competitors.">
        <Link href="/dashboard/competitors/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Competitor
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4">
        <CompetitorsList competitors={competitors} />
      </div>
    </DashboardShell>
  )
}