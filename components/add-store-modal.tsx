"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AddStoreModal({ 
  open,
  onClose,
  onAdd
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, category: string, subdomain: string) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAdd = () => {
    if (name.trim() && category.trim() && subdomain.trim() && termsAccepted) {
      onAdd(name, category, subdomain);
      onClose();
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Only allow alphanumeric and hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    setSubdomain(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Store Name */}
          <div>
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter store name"
              className="mt-1"
            />
          </div>

          {/* Store Category */}
          <div>
            <Label htmlFor="store-category">Category</Label>
            <Input
              id="store-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter store category"
              className="mt-1"
            />
          </div>

          {/* Subdomain */}
          <div>
            <Label htmlFor="store-subdomain">Subdomain</Label>
            <div className="flex items-center mt-1">
              <Input
                id="store-subdomain"
                value={subdomain}
                onChange={handleSubdomainChange}
                placeholder="your-store"
                className="rounded-r-none"
              />
              <div className="px-3 py-2 border border-l-0 rounded-r-md bg-muted text-muted-foreground">
                .joelmbaka.site
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your store will be accessible at: {subdomain ? 
              `https://${subdomain}.joelmbaka.site` : 
              'Enter a subdomain'}
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms">
              I agree to the terms and conditions
            </Label>
          </div>

          {/* Add Button */}
          <Button 
            onClick={handleAdd} 
            className="w-full"
            disabled={!name || !category || !subdomain || !termsAccepted}
          >
            Add Store
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 