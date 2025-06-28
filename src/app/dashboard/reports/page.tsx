import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Reports</CardTitle>
                <CardDescription>This feature is currently under development.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    The report generation functionality will be available soon. You'll be able to export detailed PDF and CSV reports of all flagged activity.
                </p>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
