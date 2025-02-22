import { BarChart } from "lucide-react";

export function Analytics() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Store Analytics</h2>
      <div className="bg-card rounded-lg p-4">
        <BarChart className="h-6 w-6 mb-2" />
        <p className="text-muted-foreground">
          Analytics data will appear here once your store is active
        </p>
      </div>
    </div>
  );
} 