import Link from 'next/link';

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Store Not Found</h2>
        <p className="text-gray-600 mb-8">
          The store you're looking for doesn't exist or may have been removed.
        </p>
        <div className="space-y-4">
          <Link 
            href="https://joelmbaka.site" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          >
            Return to Main Site
          </Link>
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
} 