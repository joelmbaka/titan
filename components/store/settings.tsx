import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Settings() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Store Settings</h2>
      
      <div className="space-y-2">
        <Label htmlFor="store-name">Store Name</Label>
        <Input id="store-name" placeholder="Enter store name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-domain">Custom Domain</Label>
        <Input 
          id="store-domain" 
          placeholder="yourstore.com" 
          className="font-mono"
        />
      </div>
    </div>
  );
} 