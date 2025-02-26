import Link from 'next/link';

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Store Not Found</h2>
          <p className="text-gray-600 mb-6">
            The store you're looking for doesn't exist or may have been removed.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
              <p className="font-medium mb-2">Possible reasons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The subdomain may be incorrect</li>
                <li>The store may have been deleted</li>
                <li>The DNS records may not have propagated yet</li>
                <li>There might be an issue with the store configuration</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
              <p className="font-medium mb-2">Try these solutions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check the subdomain spelling</li>
                <li>Contact the store owner</li>
                <li>If you're the store owner, check your store settings</li>
                <li>
                  <Link href="/api/check-subdomain-store" className="text-blue-600 hover:underline">
                    Check store API
                  </Link>
                </li>
              </ul>
            </div>
            
            <Link 
              href="https://joelmbaka.site" 
              className="inline-block w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Go to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 