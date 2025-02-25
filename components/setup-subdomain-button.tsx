"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store } from "@/lib/types";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SetupSubdomainButtonProps {
  store: Store;
  onSuccess?: () => void;
}

export function SetupSubdomainButton({ store, onSuccess }: SetupSubdomainButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSetupSubdomain = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/setup-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: store.id,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: data.success,
          message: data.message,
        });
        
        if (data.success && onSuccess) {
          onSuccess();
        }
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to set up subdomain',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSetupSubdomain} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Setting up subdomain...
          </>
        ) : (
          <>
            Setup Subdomain
          </>
        )}
      </Button>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          <AlertDescription>
            {result.success ? result.message : result.error}
          </AlertDescription>
        </Alert>
      )}
      
      {store.subdomain && (
        <div className="text-sm text-gray-500 mt-2">
          <p>Subdomain: <span className="font-medium">{store.subdomain}.joelmbaka.site</span></p>
          <p className="mt-1">
            <a 
              href={`https://${store.subdomain}.joelmbaka.site`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit store website
            </a>
          </p>
        </div>
      )}
    </div>
  );
} 