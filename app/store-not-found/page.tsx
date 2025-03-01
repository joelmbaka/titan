'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Store, AlertTriangle } from 'lucide-react';

export default function StoreNotFound() {
  const searchParams = useSearchParams();
  const subdomain = searchParams.get('subdomain') || 'unknown';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-6">
            The store <span className="font-semibold text-red-500">{subdomain}</span> does not exist or is no longer available.
          </p>
          
          <div className="space-y-4 w-full">
            <Link href="/" className="w-full">
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Homepage
              </Button>
            </Link>
            
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Store className="h-4 w-4" />
                Browse Available Stores
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  );
} 