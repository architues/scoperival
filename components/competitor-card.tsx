import { Competitor } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { checkCompetitor, deleteCompetitor } from "@/lib/actions/competitors";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react";

interface CompetitorCardProps {
  competitor: Competitor;
  onDelete: () => void;
}

export function CompetitorCard({ competitor, onDelete }: CompetitorCardProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCheck = async () => {
    try {
      setIsChecking(true);
      const { changed } = await checkCompetitor(competitor.id);
      if (changed) {
        toast.success("Changes detected!");
      } else {
        toast.info("No changes detected");
      }
    } catch (error) {
      toast.error("Failed to check competitor");
    } finally {
      setIsChecking(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCompetitor(competitor.id);
      onDelete();
      toast.success("Competitor deleted");
    } catch (error) {
      toast.error("Failed to delete competitor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{competitor.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground break-all">{competitor.url}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Last checked: {competitor.last_checked ? new Date(competitor.last_checked).toLocaleString() : "Never"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCheck}
          disabled={isChecking || isDeleting}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          Check Now
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isChecking || isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
} 