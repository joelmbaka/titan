'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    console.error('ErrorBoundary - Caught error:', error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
    </div>
  );
} 