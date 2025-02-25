import Link from 'next/link';

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Store Not Found</h2>
        <p className="text-gray-600 mb-8">
          The store you're looking for doesn't exist or has been removed.
        </p>
        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Return to Homepage
          </Link>
          <Link 
            href="/dashboard/stores"
            className="block w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            View Your Stores
          </Link>
        </div>
      </div>
    </div>
  );
} 