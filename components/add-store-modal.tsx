"use client";

import { useState, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NAICSCategory } from "@/lib/types";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { StoreContext } from "@/context/store-context";
import { createDnsRecordForDomain } from "@/lib/vercel-dns";

interface AddStoreModalProps {
  open: boolean;
  onClose: () => void;
  onStoreAdded?: () => void;
  onAdd?: (name: string, category: string, subdomain: string) => Promise<void>;
}

// Add the mutation directly in the component
const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      id
      name
      industry
      subdomain
      createdAt
      updatedAt
    }
  }
`;

export function AddStoreModal({ 
  open,
  onClose,
  onStoreAdded,
}: AddStoreModalProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<NAICSCategory | "">("");
  const [subdomain, setSubdomain] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const [createStore] = useMutation(CREATE_STORE_MUTATION);
  const { addStore } = useContext(StoreContext);
  const [createdStore, setCreatedStore] = useState<{
    name: string;
    industry: string;
    subdomain: string;
  } | null>(null);

  const handleAdd = async () => {
    if (name.trim() && industry && subdomain.trim() && termsAccepted) {
      setIsLoading(true);
      try {
        // First, create the DNS record
        const dnsResult = await createDnsRecordForDomain(`${subdomain}.joelmbaka.site`, {
          name: subdomain,
          type: "CNAME",
          value: "cname.vercel-dns.com",
          ttl: 60,
        });

        if (!dnsResult.success) {
          throw new Error(dnsResult.message);
        }

        // Then create the store
        const { data, errors } = await createStore({
          variables: {
            input: {
              name,
              industry,
              subdomain,
            },
          },
        });

        if (errors) {
          console.error('GraphQL Errors:', errors);
          alert(`Error: ${errors[0].message}`);
          return;
        }

        if (data?.createStore) {
          console.log('Created store data:', data.createStore);
          addStore(data.createStore);
          setCreatedStore(data.createStore);
          setShowSuccess(true);
          
          if (onStoreAdded) {
            await onStoreAdded();
          }
        }
      } catch (error) {
        console.error('Full error:', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSubdomain(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {showSuccess ? "Store Created!" : "Add New Store"}
          </DialogTitle>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">🎉 Store Created Successfully!</p>
            <div className="text-left space-y-2">
              <p><span className="font-medium">Name:</span> {createdStore?.name}</p>
              <p><span className="font-medium">Industry:</span> {createdStore?.industry.replace(/_/g, ' ')}</p>
              <p><span className="font-medium">Subdomain:</span> {createdStore?.subdomain}.joelmbaka.site</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setName("");
                  setIndustry("");
                  setSubdomain("");
                  setTermsAccepted(false);
                  setShowSuccess(false);
                }}
              >
                Create Another
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  router.push('/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
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

            {/* Industry */}
            <div>
              <Label>Industry</Label>
              <Select
                value={industry}
                onValueChange={(value: NAICSCategory) => setIndustry(value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NAICSCategory).map((industryValue) => (
                    <SelectItem 
                      key={industryValue} 
                      value={industryValue}
                    >
                      {industryValue.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={!name || !industry || !subdomain || !termsAccepted || isLoading}
            >
              {isLoading ? "Creating Store..." : "Add Store"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 