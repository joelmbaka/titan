"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store } from "@/lib/types";
import { ExternalLink, Globe, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface SetupSubdomainButtonProps {
  store: Store;
  onSuccess?: (subdomain: string) => void;
}

export function SetupSubdomainButton({ store, onSuccess }: SetupSubdomainButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    code?: string;
    suggestion?: string;
  }>({});

  const handleSetupSubdomain = async () => {
    try {
      setIsLoading(true);
      setResult({});

      const response = await fetch("/api/setup-subdomain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeId: store.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || "Failed to set up subdomain",
          code: data.code,
          suggestion: data.suggestion
        });
        return;
      }

      setResult({
        success: true,
        message: data.message,
      });

      if (onSuccess && data.subdomain) {
        onSuccess(data.subdomain);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If the store already has a subdomain and it's working, show a link to visit
  if (store.subdomain && !result.error && !isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Store subdomain: <span className="font-medium">{store.subdomain}.joelmbaka.site</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://${store.subdomain}.joelmbaka.site`, "_blank")}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Visit Store
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSetupSubdomain}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        {isLoading ? "Setting up..." : "Setup Subdomain"}
      </Button>

      {result.success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {result.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Error
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{result.error}</p>
            {result.code === 'SUBDOMAIN_EXISTS' && (
              <div className="mt-2 text-sm">
                <p className="font-medium">{result.suggestion}</p>
                <Link 
                  href={`/dashboard/stores/${store.id}/edit`} 
                  className="text-blue-600 hover:underline mt-1 inline-block"
                >
                  Edit store details
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 